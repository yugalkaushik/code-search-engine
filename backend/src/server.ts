import express from 'express';
import serverless from 'serverless-http';
import { CodeIndexer } from './indexer';

const app = express();
const indexer = new CodeIndexer();

app.use(express.json());

// Index a file
app.post('/index', (req, res) => {
  const { docId, filePath } = req.body;
  if (!docId || !filePath) {
    return res.status(400).json({ error: 'docId and filePath are required' });
  }
  try {
    indexer.indexFile(docId, filePath);
    res.status(200).json({ message: `Indexed ${docId} successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// Search endpoint
app.get('/search', (req, res) => {
  const { query } = req.query;
  if (typeof query !== 'string') {
    return res.status(400).json({ error: 'Query must be a string' });
  }
  try {
    const results = indexer.search(query);
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Explicit listen for local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

export const handler = serverless(app);