import { Hono } from 'hono'
import { renderer } from './renderer'

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
      method: 'GET', path: `${baseUrl}/custom-cache?`, description: 'Dynamically set the Cache-Control header for the response based on query parameters. Specify caching behaviors like `max-age`, `no-cache`, or `public` to control how your content is cached.' 
    },

    { method: 'GET', path: `${baseUrl}/custom-cache?cacheControl='max-age=3600'`, description: 'Set Cache-Control: max-age=3600' },
    { method: 'GET', path: `${baseUrl}/custom-cache?cacheControl='no-cache'`, description: 'Set Cache-Control: no-cache' },
    { method: 'GET', path: `${baseUrl}/custom-cache?cacheControl='private,max-age=600'`, description: 'Set Cache-Control: private, max-age=600' },
    { method: 'GET', path: `${baseUrl}/custom-cache?cacheControl='no-store'`, description: 'Set Cache-Control: no-store' },
    { method: 'GET', path: `${baseUrl}/custom-cache?cacheControl='immutable,max-age=86400'`, description: 'Set Cache-Control: immutable, max-age=86400' },
    { method: 'GET', path: `${baseUrl}/custom-cache?cacheControl='max-age=300,stale-while-revalidate=600'`, description: 'Set Cache-Control: max-age=300, stale-while-revalidate=600' },
    { method: 'GET', path: `${baseUrl}/custom-cache?cacheControl='public,max-age=1800'`, description: 'Set Cache-Control: public, max-age=1800' },
  ];

  return c.json({
    message: 'joaosgomes hono-cf-pages available endpoints:',
    endpoints,
  });
});



app.get('/text', (c) => c.json('Hello Cloudflare Workers!'))

app.get('/items', (c) => {
  return c.json(db);
});

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
app.get('/custom-cache', (c) => {
  let cacheControl = c.req.query('cacheControl') || 'default-value'; // Get cacheControl query parameter
  
  // Sanitize input: remove unwanted characters if necessary
  cacheControl = cacheControl.replace(/['"]/g, '').trim(); // Remove quotes and trim whitespace

  c.header('Cache-Control', cacheControl); // Set the Cache-Control header
  c.header('Content-Type', 'application/javascript'); // Set content type to JS
  return c.json({ message: `Cache-Control set to: ${cacheControl}` });
});



export default app
