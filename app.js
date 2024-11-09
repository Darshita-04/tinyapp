const express = require('express');
const methodOverride = require('method-override');

const app = express();
const PORT = 7000;

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(methodOverride('_method'));              // Enable method override with `_method`

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method} to ${req.url}`);
  next();
});

// Test route for PUT requests
app.put('/urls/:id', (req, res) => {
  res.send(`PUT request received for URL ID: ${req.params.id}`);
});

// Basic GET route to render a test form
app.get('/test', (req, res) => {
  res.send(`
    <form action="/urls/test123?_method=PUT" method="POST">
  <input type="text" name="longURL" placeholder="Enter new URL">
  <button type="submit">Submit PUT</button>
</form>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
