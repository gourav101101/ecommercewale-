const mongoose = require('mongoose');

async function test() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI.replace(/:([^:@]{3,})@/, ':***@')); // Hide password
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS');
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}
test();
