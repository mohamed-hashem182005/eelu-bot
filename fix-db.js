require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Drop old collection if exists
  try {
    await mongoose.connection.dropCollection('pdfs');
    console.log('Dropped old pdfs collection');
  } catch (e) {
    console.log('No old pdfs collection');
  }
  
  // Ensure Material collection exists
  const Material = require('./models/Material');
  const count = await Material.countDocuments();
  console.log(`Material collection has ${count} documents`);
  
  await mongoose.disconnect();
  console.log('Done');
}

fix();