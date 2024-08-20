const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Schema for Bundles
const bundleSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/, // Ensures the date is in YYYY-MM-DD format
  },
  bundles: {
    type: [String],
    required: true,
  },
});

const Bundle = mongoose.model('Bundle', bundleSchema);

// Route to get bundles for a specific date
app.get('/bundles/:date', async (req, res) => {
  const { date } = req.params;
  try {
    const bundle = await Bundle.findOne({ date });
    if (bundle) {
      res.json(bundle.bundles);
    } else {
      res.json([]); // No bundles for this date
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log('Server is running on http://localhost:${PORT}')
});