// Drop stale indexes on the users collection
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function fixIndexes() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const collection = mongoose.connection.collection('users');
  const indexes = await collection.indexes();
  console.log('Current indexes:', JSON.stringify(indexes, null, 2));

  // Drop the stale username_1 index if it exists
  const staleIndex = indexes.find((i) => i.name === 'username_1');
  if (staleIndex) {
    await collection.dropIndex('username_1');
    console.log('✅ Dropped stale username_1 index');
  } else {
    console.log('No stale username_1 index found');
  }

  // Show updated indexes
  const updatedIndexes = await collection.indexes();
  console.log('Updated indexes:', JSON.stringify(updatedIndexes, null, 2));

  await mongoose.disconnect();
  console.log('Done');
}

fixIndexes().catch(console.error);
