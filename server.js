// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { param, validationResult } = require('express-validator');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());  // Security headers
app.use(express.json());
app.use(morgan('common'));  // Logging

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

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
app.get('/bundles/:date',
  param('date').isISO8601().withMessage('Invalid date format'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log('Server is running on http://localhost:${PORT}')
});