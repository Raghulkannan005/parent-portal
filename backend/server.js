import app from "./src/app.js"
import dotenv from "dotenv"
import connectdb from "./src/database/db.js"
import path from "path"
import { fileURLToPath } from "url"
import express from "express"

dotenv.config()

const PORT = process.env.PORT || 3000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to database with reconnection logic
const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB...');
  connectdb()
    .then(() => console.log('Database connection successful'))
    .catch(err => {
      console.error('Database connection error:', err);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    });
};

connectWithRetry();

// Serve frontend build files
const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

// Any route that is not API will be redirected to index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});