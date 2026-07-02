const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in env variables');
  process.exit(1);
}

// Define Schema
const projectSchema = new mongoose.Schema({
  title: String,
  thumbnail: String,
  screenshots: [String],
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

async function resolveImgBbUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('ibb.co/') && !url.includes('i.ibb.co/')) {
    try {
      console.log(`🔍 Resolving ImgBB link: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (response.ok) {
        const html = await response.text();
        const match = html.match(/https:\/\/i\.ibb\.co\/[a-zA-Z0-9]+\/[^"' >]+\.[a-zA-Z0-9]+/i);
        if (match) {
          console.log(`   ✅ Resolved direct image URL: ${match[0]}`);
          return match[0];
        } else {
          console.log(`   ⚠️ Could not find direct URL in page content`);
        }
      } else {
        console.log(`   ❌ Fetch failed with status ${response.status}`);
      }
    } catch (err) {
      console.error(`   ❌ Error resolving ImgBB URL:`, err.message);
    }
  }
  return url;
}

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const projects = await Project.find({});
    console.log(`📦 Found ${projects.length} projects in database`);

    let updatedCount = 0;

    for (const project of projects) {
      let isModified = false;

      // Check thumbnail
      if (project.thumbnail && project.thumbnail.includes('ibb.co/') && !project.thumbnail.includes('i.ibb.co/')) {
        const resolved = await resolveImgBbUrl(project.thumbnail);
        if (resolved !== project.thumbnail) {
          project.thumbnail = resolved;
          isModified = true;
        }
      }

      // Check screenshots
      if (project.screenshots && project.screenshots.length > 0) {
        const originalScreenshots = [...project.screenshots];
        for (let i = 0; i < project.screenshots.length; i++) {
          if (project.screenshots[i].includes('ibb.co/') && !project.screenshots[i].includes('i.ibb.co/')) {
            project.screenshots[i] = await resolveImgBbUrl(project.screenshots[i]);
          }
        }
        if (JSON.stringify(originalScreenshots) !== JSON.stringify(project.screenshots)) {
          isModified = true;
        }
      }

      if (isModified) {
        await project.save();
        console.log(`💾 Saved updates for project: ${project.title}`);
        updatedCount++;
      }
    }

    console.log(`🎉 DB fix complete. Updated ${updatedCount} projects.`);
  } catch (err) {
    console.error('❌ Error during execution:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

run();
