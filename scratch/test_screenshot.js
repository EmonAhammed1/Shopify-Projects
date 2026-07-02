// Use built-in fetch

async function test() {
  const targetUrl = 'https://tallow-goodness.myshopify.com';
  const password = '1';

  try {
    console.log('Sending GET to Shopify with query param...');
    const loginRes = await fetch(`${targetUrl}/password?password=${password}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      redirect: 'manual',
    });

    console.log('Response Status:', loginRes.status);
    const setCookies = typeof loginRes.headers.getSetCookie === 'function'
      ? loginRes.headers.getSetCookie()
      : loginRes.headers.get('set-cookie');
    console.log('Set-Cookie headers:', setCookies);

    let cookieHeader = '';
    if (setCookies) {
      const cookies = Array.isArray(setCookies) ? setCookies : [setCookies];
      cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
      console.log('Extracted cookieHeader:', cookieHeader);
    }

    const cacheBusterUrl = `${targetUrl}?_cb=${Date.now()}`;
    let microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(cacheBusterUrl)}&screenshot=true&embed=screenshot.url`;
    if (cookieHeader) {
      microlinkUrl += `&headers.cookie=${encodeURIComponent(cookieHeader)}`;
    }
    console.log('Calling Microlink URL:', microlinkUrl);

    const microlinkRes = await fetch(microlinkUrl);
    console.log('Microlink status:', microlinkRes.status);
    console.log('Microlink redirect URL:', microlinkRes.url);

    if (!microlinkRes.ok) {
      const body = await microlinkRes.text();
      console.log('Microlink error body:', body);
    }

  } catch (err) {
    console.error('Error during test:', err);
  }
}

test();
