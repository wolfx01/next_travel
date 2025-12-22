const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  userName: String,
  email: String,
  isAdmin: { type: Boolean, default: false }
}, { strict: false });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function checkAdmins() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Database');

    const users = await User.find({}, 'userName email isAdmin');
    console.log('--- USERS LIST ---');
    users.forEach(user => {
        console.log(`User: ${user.userName} | Email: ${user.email} | Admin: ${user.isAdmin}`);
    });
    console.log('------------------');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdmins();
