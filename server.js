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

// Route to get bundles for a specific date
app.get('/bundle/:date', async (req, res) => {
  const { date } = req.params;

  // Access the specific database dynamically
  const db = mongoose.connection.useDb('day_events');
  
  // Access the specific collection dynamically
  const Bundle = db.model('Bundle', new mongoose.Schema({
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/, // Ensures the date is in YYYY-MM-DD format
    },
    bundles: {
      type: [String],
      required: true,
    },
  }), 'bundle'); // Explicitly set the collection name

  try {
    const bundle = await Bundle.findOne({ date });
    console.log('Found bundle:'+ bundle);
    if (bundle) {
      res.json(bundle.bundles);
    } else {
      res.json('No Bundles []'); // No bundles for this date
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log('Server is running on http://localhost:'+PORT)
});
