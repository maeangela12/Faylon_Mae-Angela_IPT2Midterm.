// SERVER ENTRY POINT: sets up Express, connects to PostgreSQL, and mounts the routes.
require('dotenv').config(); // loads secrets from the .env file
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const donorRoutes = require('./routes/donors');

const app = express();
app.use(cors());          // lets the React app (different port) call this API
app.use(express.json());  // lets us read JSON request bodies

app.get('/', (req, res) => res.json({ message: 'Blood Donor Registry API is running.' }));
app.use('/api/donors', donorRoutes);

// Unknown route -> 404 JSON
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// Central error handler: sends a clear message instead of crashing the server.
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ error: 'Request body is not valid JSON.' });
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
initDb()
  .then(() => {
    console.log('PostgreSQL connected, donors table ready');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('PostgreSQL connection failed:', err.message);
    process.exit(1);
  });
