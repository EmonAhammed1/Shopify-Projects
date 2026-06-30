import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';

// Simple in-memory cache for storefront cookies
const cookieCache = {};

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    const project = await Project.findOne({ slug });

    if (!project || !project.liveUrl) {
      return new NextResponse('Project or Live URL not found', { status: 404 });
    }

    let shopDomain = project.liveUrl.trim();
    if (!/^https?:\/\//i.test(shopDomain)) {
      shopDomain = `https://${shopDomain}`;
    }
    // Strip trailing slash
    shopDomain = shopDomain.replace(/\/$/, '');

    const { searchParams } = new URL(request.url);
    let targetPath = searchParams.get('path') || '/';
    if (!targetPath.startsWith('/')) {
      targetPath = '/' + targetPath;
    }

    // Forward any other query parameters from the request
    const forwardParams = new URLSearchParams(searchParams);
    forwardParams.delete('path');
    const queryString = forwardParams.toString();
    const targetUrl = `${shopDomain}${targetPath}${queryString ? '?' + queryString : ''}`;

    console.log(`🌐 Proxy request: ${targetUrl}`);

    const password = project.storefrontPassword ? project.storefrontPassword.trim() : '';
    let cookies = cookieCache[shopDomain] || '';

    // If password is set and we don't have cookies cached, authenticate first
    if (password && !cookies) {
      console.log(`🔑 Authenticating proxy for dev store: ${shopDomain}`);
      const formData = new URLSearchParams();
      formData.append('form_type', 'storefront_password');
      formData.append('utf8', '✓');
      formData.append('password', password);

      const loginRes = await fetch(`${shopDomain}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: formData.toString(),
        redirect: 'manual',
      });

      let setCookieHeaders = [];
      if (typeof loginRes.headers.getSetCookie === 'function') {
        setCookieHeaders = loginRes.headers.getSetCookie();
      } else {
        const rawCookie = loginRes.headers.get('set-cookie');
        if (rawCookie) {
          setCookieHeaders = rawCookie.split(',').map(c => c.trim());
        }
      }

      if (setCookieHeaders.length > 0) {
        cookies = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
        cookieCache[shopDomain] = cookies;
        console.log('✅ Storefront authenticated successfully, cookies cached');
      } else {
        console.warn('⚠️ No Set-Cookie headers returned from storefront login');
      }
    }

    // Make the request to Shopify
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    if (cookies) {
      headers['Cookie'] = cookies;
    }

    const pageRes = await fetch(targetUrl, { headers });
    
    // If we get an unauthorized or password redirect, clear cookie cache and retry once
    if (pageRes.status === 403 || pageRes.url.includes('/password')) {
      if (password && cookieCache[shopDomain]) {
        console.log('🔄 Session expired, clearing cache and retrying...');
        delete cookieCache[shopDomain];
        
        // Re-authenticate
        const formData = new URLSearchParams();
        formData.append('form_type', 'storefront_password');
        formData.append('utf8', '✓');
        formData.append('password', password);

        const loginRes = await fetch(`${shopDomain}/password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          body: formData.toString(),
          redirect: 'manual',
        });

        let setCookieHeaders = [];
        if (typeof loginRes.headers.getSetCookie === 'function') {
          setCookieHeaders = loginRes.headers.getSetCookie();
        } else {
          const rawCookie = loginRes.headers.get('set-cookie');
          if (rawCookie) {
            setCookieHeaders = rawCookie.split(',').map(c => c.trim());
          }
        }
        if (setCookieHeaders.length > 0) {
          cookies = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
          cookieCache[shopDomain] = cookies;
          headers['Cookie'] = cookies;
        }
      }
    }

    const finalRes = await fetch(targetUrl, { headers });
    
    // Get target content type
    const contentType = finalRes.headers.get('content-type') || 'text/html; charset=utf-8';
    
    // If the resource is not HTML (e.g. CSS, JS, image), return it as-is with the correct MIME type
    if (!contentType.includes('text/html')) {
      const buffer = await finalRes.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;

    let html = await finalRes.text();

    // Modify HTML to inject base tag and force visibility in iframe
    const forceVisibilityStyle = `
      <style>
        body, html {
          opacity: 1 !important;
          visibility: visible !important;
        }
      </style>
    `;
    const baseTag = `<base href="${shopDomain}/">`;
    html = html.replace('<head>', `<head>${baseTag}${forceVisibilityStyle}`);

    // Rewrite relative links to route through our proxy so they don't break the iframe
    // Use (\?|$) to match asset extensions even if they have query parameters like ?v=...
    const assetRegex = /\.(css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2|ico|json)(\?|$)/i;

    html = html.replace(/href="\/([^"]*)"/g, (match, path) => {
      if (path.startsWith('http') || path.startsWith('//') || assetRegex.test(path)) {
        if (path.startsWith('//')) {
          return `href="${protocol}:${path}"`;
        }
        return match;
      }
      return `href="${origin}/api/projects/${slug}/proxy?path=/${path}"`;
    });

    html = html.replace(/href='\/([^']*)'/g, (match, path) => {
      if (path.startsWith('http') || path.startsWith('//') || assetRegex.test(path)) {
        if (path.startsWith('//')) {
          return `href='${protocol}:${path}'`;
        }
        return match;
      }
      return `href="${origin}/api/projects/${slug}/proxy?path=/${path}"`;
    });

    // Also rewrite form actions
    html = html.replace(/action="\/([^"]*)"/g, (match, path) => {
      if (path.startsWith('http') || path.startsWith('//') || assetRegex.test(path)) {
        if (path.startsWith('//')) {
          return `action="${protocol}:${path}"`;
        }
        return match;
      }
      return `action="${origin}/api/projects/${slug}/proxy?path=/${path}"`;
    });

    // Strip frame-busting scripts if any exist
    html = html.replace(/window\.top\.location/g, 'window.self.location');
    html = html.replace(/top\.location/g, 'self.location');

    // Inject auto-login script if this is the Shopify storefront password page
    const autoLoginScript = `
      <script>
        (function() {
          const password = ${JSON.stringify(password)};
          if (!password) return;
          
          function tryAutoSubmit() {
            const passwordInput = document.querySelector('input[type="password"], input[name="password"]');
            if (passwordInput) {
              const form = passwordInput.closest('form');
              if (form) {
                passwordInput.value = password;
                console.log("🔑 Automating storefront password entry inside iframe proxy...");
                setTimeout(() => {
                  form.submit();
                }, 300);
              }
            }
          }
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryAutoSubmit);
          } else {
            tryAutoSubmit();
          }
        })();
      </script>
    `;

    if (html.includes('</body>')) {
      html = html.replace('</body>', `${autoLoginScript}</body>`);
    } else {
      html += autoLoginScript;
    }

    // Return the response without X-Frame-Options or CSP headers
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Explicitly allow embedding
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (err) {
    console.error('❌ GET project proxy:', err.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    const project = await Project.findOne({ slug });

    if (!project || !project.liveUrl) {
      return new NextResponse('Project or Live URL not found', { status: 404 });
    }

    let shopDomain = project.liveUrl.trim();
    if (!/^https?:\/\//i.test(shopDomain)) {
      shopDomain = `https://${shopDomain}`;
    }
    shopDomain = shopDomain.replace(/\/$/, '');

    const { searchParams } = new URL(request.url);
    let targetPath = searchParams.get('path') || '/password';
    if (!targetPath.startsWith('/')) {
      targetPath = '/' + targetPath;
    }

    const bodyText = await request.text();
    console.log(`🌐 Proxy POST request: ${shopDomain}${targetPath}`);

    const loginRes = await fetch(`${shopDomain}${targetPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: bodyText,
      redirect: 'manual',
    });

    let setCookieHeaders = [];
    if (typeof loginRes.headers.getSetCookie === 'function') {
      setCookieHeaders = loginRes.headers.getSetCookie();
    } else {
      const rawCookie = loginRes.headers.get('set-cookie');
      if (rawCookie) {
        setCookieHeaders = rawCookie.split(',').map(c => c.trim());
      }
    }

    if (setCookieHeaders.length > 0) {
      const cookies = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
      cookieCache[shopDomain] = cookies;
      console.log('✅ Storefront authenticated via proxy POST, cookies cached');
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const redirectUrl = `${protocol}://${host}/api/projects/${slug}/proxy?path=%2F`;

    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (err) {
    console.error('❌ POST project proxy:', err.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
