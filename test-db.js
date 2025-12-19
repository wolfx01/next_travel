const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local manually
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGO_URI;

console.log('--- DB Connection Test ---');
console.log('MONGO_URI Length:', MONGODB_URI ? MONGODB_URI.length : 'Undefined');

if (!MONGODB_URI) {
  console.error('ERROR: MONGO_URI is missing from .env.local');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log('SUCCESS: Connected to MongoDB!');
    // List collections to verify detailed access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('FAILURE: Could not connect to MongoDB.');
    console.error('Error Details:', error);
  }
}

testConnection();
