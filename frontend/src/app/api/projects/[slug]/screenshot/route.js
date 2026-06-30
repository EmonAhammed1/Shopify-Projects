import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    const project = await Project.findOne({ slug });

    if (!project || !project.liveUrl) {
      return new NextResponse('Project not found', { status: 404 });
    }

    let targetUrl = project.liveUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    // Strip trailing slash
    targetUrl = targetUrl.replace(/\/$/, '');

    const password = project.storefrontPassword ? project.storefrontPassword.trim() : '';

    let cookieHeader = '';

    if (password) {
      // Step 1: Submit POST request to /password to get storefront_digest cookie
      const formData = new URLSearchParams();
      formData.append('form_type', 'storefront_password');
      formData.append('utf8', '✓');
      formData.append('password', password);

      const loginRes = await fetch(`${targetUrl}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: formData.toString(),
        redirect: 'manual', // do not follow redirect, we just want headers
      });

      // Extract set-cookie headers
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
        cookieHeader = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
      }
    }

    // Step 2: Build Microlink screenshot URL with cache buster to force fresh bypass
    const cacheBusterUrl = `${targetUrl}?_cb=${Date.now()}`;
    let microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(cacheBusterUrl)}&screenshot=true&embed=screenshot.url&ttl=0`;
    if (cookieHeader) {
      // Pass the cookie via headers.cookie query parameter
      microlinkUrl += `&headers.cookie=${encodeURIComponent(cookieHeader)}`;
    }

    // Step 3: Fetch screenshot URL from Microlink metadata response
    const microlinkRes = await fetch(microlinkUrl);
    
    if (microlinkRes.ok) {
      // Redirect to the final Microlink screenshot CDN URL
      return NextResponse.redirect(microlinkRes.url);
    }

    // Fallback to placeholder/thumbnail on failure
    return NextResponse.redirect(project.thumbnail || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80');
  } catch (err) {
    console.error('❌ GET project screenshot:', err.message);
    return NextResponse.redirect('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80');
  }
}
