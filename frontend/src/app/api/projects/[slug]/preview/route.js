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

    // Strip trailing slash if present
    targetUrl = targetUrl.replace(/\/$/, '');

    const password = project.storefrontPassword ? project.storefrontPassword.trim() : '';

    if (password) {
      // Return auto-submitting HTML form pointing to Shopify storefront's /password
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Previewing ${project.title}</title>
          <style>
            body {
              background-color: #050508;
              color: #f0f0ff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .loader {
              border: 3px solid rgba(150, 191, 72, 0.1);
              border-top: 3px solid #96bf48;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            p {
              font-size: 1.1rem;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <p>Redirecting and unlocking Shopify Development Store...</p>
          
          <form id="bypass-form" action="${targetUrl}/password" method="post" style="display:none;">
            <input type="password" name="password" value="${password}" />
          </form>

          <script>
            // Submit form immediately
            window.onload = function() {
              document.getElementById('bypass-form').submit();
            }
          </script>
        </body>
        </html>
      `;

      return new NextResponse(htmlContent, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Fallback to normal redirect if no password is set
    return NextResponse.redirect(targetUrl);
  } catch (err) {
    console.error('❌ GET project preview:', err.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
