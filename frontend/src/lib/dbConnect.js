import dns from 'dns';
import mongoose from 'mongoose';

// Force DNS servers
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  console.warn('⚠️ Failed to set DNS servers:', e.message);
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Helper to resolve mongodb+srv to direct connection string
function resolveMongoUri(uri) {
  return new Promise((resolve) => {
    if (!uri.startsWith('mongodb+srv://')) {
      return resolve(uri);
    }

    const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?#]+)(.*)$/);
    if (!match) {
      console.warn('⚠️ Invalid MongoDB SRV URI format, using original');
      return resolve(uri);
    }

    const [, auth, host, rest] = match;

    console.log(`🔍 Resolving MongoDB SRV: ${host}...`);
    dns.resolveSrv(`_mongodb._tcp.${host}`, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        console.warn('⚠️ SRV DNS resolution failed, falling back to original URI:', err?.message || 'No addresses found');
        return resolve(uri);
      }

      const hosts = addresses.map(addr => `${addr.name}:${addr.port}`).join(',');
      let finalRest = rest || '/';
      if (!finalRest.includes('ssl=true') && !finalRest.includes('tls=true')) {
        const separator = finalRest.includes('?') ? '&' : '?';
        finalRest = `${finalRest}${separator}ssl=true`;
      }
      if (!finalRest.includes('authSource=')) {
        const separator = finalRest.includes('?') ? '&' : '?';
        finalRest = `${finalRest}${separator}authSource=admin`;
      }

      const directUri = `mongodb://${auth}@${hosts}${finalRest}`;
      console.log('✅ Resolved direct MongoDB URI successfully');
      resolve(directUri);
    });
  });
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log('🔌 Connecting to MongoDB...');
    cached.promise = (async () => {
      const resolvedUri = await resolveMongoUri(MONGODB_URI);
      return mongoose.connect(resolvedUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
    })().then((m) => {
      console.log('✅ MongoDB connected');
      return m;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
