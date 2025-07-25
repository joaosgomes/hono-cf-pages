import { Hono } from 'hono'
import { renderer } from './renderer'
import { swaggerUI } from '@hono/swagger-ui'
import { showRoutes } from 'hono/dev'
import { compress } from 'hono/compress'
import { brotliCompressSync } from 'node:zlib'


const app = new Hono()


//middlware
app.use(renderer)


let db = [
  { id: 1, item: 'item 1', check: false },
  { id: 2, item: 'item 2', check: false },
];


//app.get('/', (c) => {
//  return c.json('joaosgomes hono-cf-pages')
//})


app.get('/', (c) => {
  const fullUrl = c.req.url; // Get the full URL from the request
  const url = new URL(fullUrl); // Create a URL object to easily extract parts

  const baseUrl = `${url.protocol}//${url.host}`; // Construct the base URL

  const endpoints = [

    { method: 'GET', path: `${baseUrl}/`, description: 'Get a list of all available endpoints' },
    { method: 'GET', path: `${baseUrl}/text`, description: 'Get text message' },
    { method: 'GET', path: `${baseUrl}/items`, description: 'Get all items' },
    { method: 'GET', path: `${baseUrl}/items/:id`, description: 'Get a specific item by ID' },
    { method: 'POST', path: `${baseUrl}/items`, description: 'Post a new item' },
    { method: 'DELETE', path: `${baseUrl}/items/:id`, description: 'Delete a specific item by ID' },
    { method: 'GET', path: `${baseUrl}/no-cache-control`, description: 'Endpoint without Cache Control Header' },
    { method: 'GET', path: `${baseUrl}/no-cache`, description: 'Endpoint with Header Cache-Control: private, no-cache, max-age=0, Pragma, no-cache' },


    {
      method: 'GET', path: `${baseUrl}/custom-cache.jpeg?`, description: 'Dynamically set the Cache-Control header for the response based on query parameters. Specify caching behaviors like `max-age`, `no-cache`, or `public` to control how your content is cached.'
    },

    { method: 'GET', path: `${baseUrl}/custom-cache.jpeg?cacheControl='max-age=3600'`, description: 'Set Cache-Control: max-age=3600' },
    { method: 'GET', path: `${baseUrl}/custom-cache.jpeg?cacheControl='no-cache'`, description: 'Set Cache-Control: no-cache' },
    { method: 'GET', path: `${baseUrl}/custom-cache.jpeg?cacheControl='private,max-age=600'`, description: 'Set Cache-Control: private, max-age=600' },
    { method: 'GET', path: `${baseUrl}/custom-cache.jpeg?cacheControl='no-store'`, description: 'Set Cache-Control: no-store' },
    { method: 'GET', path: `${baseUrl}/custom-cache.jpeg?cacheControl='immutable,max-age=86400'`, description: 'Set Cache-Control: immutable, max-age=86400' },
    { method: 'GET', path: `${baseUrl}/custom-cache.jpeg?cacheControl='max-age=300,stale-while-revalidate=600'`, description: 'Set Cache-Control: max-age=300, stale-while-revalidate=600' },
    { method: 'GET', path: `${baseUrl}/custom-cache.jpeg?cacheControl='public,max-age=1800'`, description: 'Set Cache-Control: public, max-age=1800' },
  ];

  return c.json({
    message: 'joaosgomes hono-cf-pages available endpoints:',
    endpoints,
  });
});


app.get('/error-500.html', (c) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>*Cloudflare Error*</title>
</head>
<body>

  <div>::CLOUDFLARE_ERROR_500S_BOX::</div>

  <p>
    Teste 500 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  </p>

</body>
</html>`

  return c.html(html, 500)
})


app.get('/error-1000.html', (c) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Cloudflare Error</title>
</head>
<body>

  <div>::CLOUDFLARE_ERROR_1000S_BOX::</div>

  <p>
    1000 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  </p>

</body>
</html>`

    return c.html(html, 500)
})

app.get('/binary.bin', (c) => {
  const binaryData = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]) // "Hello" in ASCII

  return c.body(binaryData, 200, {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="hello.bin"',
  })
})

// Exact match route
app.get('/us/lazgcp/20ab0f1a-9587-43d9-a980-a5b12959c30f_ALL-93-52.png', (c) => {
  return c.text('200 OK: Image path matched')
})

// Exact match route
app.get('/worldwide/en/company/ir/stock-information/investors-news/change-in-large-shareholding-%28above-5%%29-0000000699', (c) => {
  return c.text('200 OK')
})

app.get('/test/%A%GGG', (c) => {
  return c.text('200 OK')
})

app.get('/worldwide/en/company/ir/stock-information/investors-news/change-in-large-shareholding-(above-5%)-of-investment-securities-0000000498', (c) => {
  return c.text('200 OK')
})


// Fallback route: 404 Not Found
app.all('*', (c) => {
  return c.text('404 Not Found', 404)
})



app.get('/video.mp4', async (c) => {
  const videoUrl = 'https://r2-bucket.joaosilvagomes.com/BigBuckBunny_320x180.mp4';

  const res = await fetch(videoUrl);
  if (!res.ok) {
    return c.text('Video not found', 404);
  }

  // Clone the video stream
  const videoStream = res.body;

  return new Response(videoStream, {
    status: 200,
    headers: {
      'Vary': 'Accept-Encoding',
      'Content-Encoding': 'gzip',
      'Content-Type': 'video/mp4',
      'Server': 'Apache',
      'Accept-Ranges': 'bytes',
    },
  });
});



app.get('/text', (c) => c.json('Hello Cloudflare Workers!'))

app.get('/image-purge.jpeg', async (c) => {
  const customHeader = c.req.header('X-Custom-Image');

  if (!customHeader || customHeader === '0') {
    const response = await fetch('https://r2-bucket.joaosilvagomes.com/cf_logo.jpg');
    if (!response.ok) {
      return c.json({ message: 'Image not found', status: response.status });
    }
    const imageBlob = await response.blob();
    return new Response(imageBlob, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=120",
        "Content-Type": "image/jpeg",
        "Cache-Tag": "tag", // only here!
      },
    });
  }

  if (customHeader === '1') {
    const response = await fetch('https://r2-bucket.joaosilvagomes.com/poster-jpeg.jpeg');
    if (!response.ok) {
      return c.json({ message: 'Image not found', status: response.status });
    }
    const imageBlob = await response.blob();
    return new Response(imageBlob, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=120",
        "Content-Type": "image/jpeg",
        // No Cache-Tag here
      },
    });
  }

  // If header is invalid
  return c.json({ message: 'Invalid header value' }, 400);
});

app.get('/weak-etag/commercialsearch-com-news/economists-view-distress-opportunity-awaits-or-does-it/', (c) => {
  return c.text('w/"52b695334001ee0701d7a0f4bafb015a"', {
    headers: { 
      'set-cookie': '__cf_bm=UWNfGor8KJ8a662Ws10G9_72ItdWQYLSW_ih7F7KFNc-1742938794-1.0.1.1-oD9FGmhumc6Jh0lFZQ6amgcwY.MlfYZ3ZZyB5pysrWruAMDLyKlG8Q9d15Z4lHSgj2xK6dWGHXiEFP_.43Ri.PW20a2I8RPznxp9Vi8QvoA; path=/; expires=Tue, 25-Mar-25 22:09:54 GMT; domain=.yardi.com; HttpOnly; Secure; SameSite=None',
      'x-robots-tag': 'noindex, nofollow',
      'content-type': 'text/html; charset=UTF-8',
      'vary': 'Accept-Encoding',
      'accept-ranges': 'bytes',
      'etag': 'W/"52b695334001ee0701d7a0f4bafb015a"',
      'content-encoding': 'gzip',
      'cache-control': 'no-cache, must-revalidate, max-age=0, no-store',
      'set-cookie': 'anspress_session=91eba37fb77b875560ffb2e2c8251eaf; expires=Wed, 26 Mar 2025 20:37:30 GMT; Max-Age=86400; path=/'
    },
  });
});

app.get('/items', (c) => {
  return c.json(db);
});

app.get('/redirect.js', (c) => {
  return c.redirect('/302-redirect.js', 302);
});

app.get('/302-redirect.js', (c) => {
  return c.text('console.log("Hello from 302-redirect.js!");', {
    headers: { 'Content-Type': 'application/javascript' },
  });
});

app.get('/br', (c) => {
  const html = '<h1>............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................Hello, Brotli Compressed HTML...........................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................</h1>'
  const compressed = brotliCompressSync(Buffer.from(html)) // Compress HTML

  return new Response(compressed, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Encoding': 'br'
    }
  })
})


// Endpoint to Get a Single Item by ID (GET /item/:id)
app.get('/items/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const item = db.find((t) => t.id === id);
  if (item) {
    return c.json(item);
  } else {
    return c.json({ message: 'Item not found' }, 404);
  }
});

// Endpoint to Add a New Item (POST /item)
app.post('/items', async (c) => {
  const body = await c.req.json();
  const newItem = {
    id: db.length + 1,
    item: body.item,
    check: false,
  };
  db.push(newItem);
  return c.json(newItem, 201);
});

// Endpoint to Delete a Item by ID (DELETE /items/:id)
app.delete('/items/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const index = db.findIndex((t) => t.id === id);
  if (index !== -1) {
    db.splice(index, 1);
    return c.json({ message: 'Item deleted successfully' });
  } else {
    return c.json({ message: 'item not found' }, 404);
  }
});

app.get('/no-cache', (c) => {
  c.header('Cache-Control', 'private, no-cache, max-age=0');
  c.header('Pragma', 'no-cache');


  return c.json({ message: 'This response is not cached' });
});

app.get('/no-cache-control', (c) => {
  c.header('x-jgomes', '1');



  return c.json({ message: 'This response does not have cache-control header' });
});





app.get('/timeout', async (c) => {
  const delay = 60 * 1000; // 30 seconds delay
  
  // Simulate a timeout by using setTimeout inside a promise
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // After the delay, send a response
  return c.json({ message: 'Request timed out after delay' });
});

// Generate a large Content-Security-Policy header
const largeCSP = "default-src 'self'; " + "script-src https://example.com ".repeat(100); // ~16 KB CSP header
const x_custom_jgomes = "joaosilvagomes".repeat(100); // ~16 KB CSP header

app.get('/large-header', (c) => {
  c.header('Content-Security-Policy', largeCSP);
  c.header('X-Custom-JGOMES', x_custom_jgomes);

  return c.json({ message: 'This is a response with a large CSP header' });
});




/* app.get('/custom-cache', (c) => {
  let cacheControlValue = c.req.query('cacheControl');

  // Check if the value is wrapped in quotes and remove them
  if (cacheControlValue && (cacheControlValue.startsWith("'") && cacheControlValue.endsWith("'") || cacheControlValue.startsWith('"') && cacheControlValue.endsWith('"'))) {
    cacheControlValue = cacheControlValue.slice(1, -1);
  }

  // If the query parameter is exactly '', set Cache-Control to empty
  if (cacheControlValue === '') {
    c.header('Cache-Control', '');
    return c.json({ message: 'Response with Cache-Control: (empty)' });
  }

  // Process the cacheControl value
  const processedValue = cacheControlValue?.split(',').map(value => value.trim()).filter(Boolean).join(', ') || 'no-store';
  c.header('Cache-Control', processedValue);
  return c.json({ message: `Response with Cache-Control: ${processedValue}` });
});
*/


app.on('PURGE', '/cache', (c) => c.text('PURGE Method /cache'))

app.get('/custom-cache', async (c) => {
  let cacheControl = c.req.query('cacheControl') || 'default-value'; // Get cacheControl query parameter

  // Sanitize input: remove unwanted characters if necessary
  cacheControl = cacheControl.replace(/['"]/g, '').trim(); // Remove quotes and trim whitespace

  // Set headers
  c.header('Cache-Control', cacheControl); // Set the Cache-Control header

  const imageUrl = 'https://r2-bucket.joaosilvagomes.com/cf_logo.jpg'; // R2 bucket URL

  try {
    const response = await fetch(imageUrl, { method: 'GET' });

    if (!response.ok) {
      return c.json({ message: 'Image not found', status: response.status });
    }


    const imageBlob = await response.blob();

    return new Response(imageBlob, {
      status: 200,
      headers: {
        'Cache-Control': cacheControl,
        'Content-Type': 'image/jpeg',
      },
    });




  } catch (error) {
    console.error('Error fetching the image:', error);
    return c.json({ message: 'Failed to fetch the image' }, 500);
  }
});


app.get('/custom-cache.jpeg', async (c) => {
  let cacheControl = c.req.query('cacheControl') || 'default-value';

  // Sanitize input for security
  cacheControl = cacheControl.replace(/['"]/g, '').trim();

  let setCookie = c.req.query('set-cookie');
  if (setCookie) {
    setCookie = setCookie.replace(/['"]/g, '').trim();
  }

  // Retrieve and sanitize statusCode from query string
  let statusCodeString = c.req.query('statusCode');
  let statusCode = statusCodeString
    ? parseInt(statusCodeString, 10)
    : 200; // Default to 200 if not provided

  // Validate statusCode to ensure it is a valid HTTP status code
  if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
    statusCode = 200; // Default to 200 if invalid
  }

  // Set the Cache-Control header

  c.header('Cache-Control', cacheControl);

   // Conditionally set the se-cookie header
   if (setCookie) {
    c.header('Set-Cookie', setCookie);
  }

  
  c.header('Content-Type', 'image/jpeg');

  const imageUrl = 'https://r2-bucket.joaosilvagomes.com/cf_logo.jpg';

  try {
    const response = await fetch(imageUrl, { method: 'GET' });

    if (!response.ok) {
      return c.json({ message: 'Image not found', status: response.status });
    }

    const imageBlob = await response.blob();


    // Prepare headers for the final response
    // const headers = {
    //   'Cache-Control': cacheControl,
    //   'Content-Type': 'image/jpeg',
    // };

    const headers: Record<string, string> = {
      'Cache-Control': cacheControl,
      'Content-Type': 'image/jpeg',
      //'Set-Cookie': 'my-cookie-value',
    };

    // Conditionally include the se-cookie header
    if (setCookie) {
      headers['Set-Cookie'] = setCookie;
    }

    return new Response(imageBlob, {
      status: statusCode,
      headers,
    });

    // return new Response(imageBlob, {
    //   status: 200,
    //   headers: {
    //     'Cache-Control': cacheControl,
    //     'Content-Type': 'image/jpeg',
    //   },
    // });

  } catch (error) {
    console.error('Error fetching the image:', error);
    return c.json({ message: 'Failed to fetch the image' }, 500);
  }
});


showRoutes(app, {
  verbose: true,
})

export default app


