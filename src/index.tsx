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
  const endpoints = [
    { method: 'GET', path: '/', description: 'Get a list of all available endpoints staging branch' },
    { method: 'GET', path: '/text', description: 'Get text message' },
    { method: 'GET', path: '/items', description: 'Get all items' },
    { method: 'GET', path: '/items/:id', description: 'Get a specific item by ID' },
    { method: 'POST', path: '/items', description: 'Post a new item' },
    { method: 'DELETE', path: '/items/:id', description: 'Delete a specific item by ID' },
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





export default app
