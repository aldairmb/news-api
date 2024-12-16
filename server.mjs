import dotenv from 'dotenv';  // Use import for dotenv as well
import fetch from 'node-fetch';  // Use import for node-fetch
import express from 'express';

dotenv.config();  // Load environment variables

const app = express();
const port = 3000;

// Serve static files from 'public' folder
app.use(express.static('public')); 

// Define the API route to fetch articles
app.get('/api/articles', async (req, res) => {
  const { category, source, keyword } = req.query;
  let url = https://newsapi.org/v2/top-headlines?apiKey=${process.env.NEWS_API_KEY};

  if (category) url += &category=${category};
  if (source) url += &sources=${source};
  if (keyword) url += &q=${encodeURIComponent(keyword)};

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching articles');
  }
});

// Define the API route to fetch the API key
app.get('/api/config', (req, res) => {
  res.json({ apiKey: process.env.NEWS_API_KEY });
});

// Start the server
app.listen(port, () => {
  console.log(Server running on http://localhost:${port});
});
