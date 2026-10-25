import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import mongoose from 'mongoose';
import Card from './models/Card.js';

async function main() {
  await mongoose.connect(process.env.MONGO_DB_URI);
  const total = await Card.countDocuments();
  console.log('TOTAL CARDS IN DB:', total);

  const batches = await Card.aggregate([
    {
      $group: {
        _id: '$batchId',
        count: { $sum: 1 },
        minCard: { $min: '$cardId' },
        maxCard: { $max: '$cardId' },
        minCreated: { $min: '$createdAt' },
        maxCreated: { $max: '$createdAt' },
      },
    },
    { $sort: { maxCreated: -1 } },
  ]);
  console.log('BATCHES:', JSON.stringify(batches, null, 2));

  const recentCards = await Card.find()
    .sort({ createdAt: -1 })
    .limit(60)
    .select('cardId cardNumber batchId createdAt');

  console.log('RECENT 60 COUNT:', recentCards.length);
  if (recentCards.length > 0) {
    console.log('NEWEST:', recentCards[0].cardId, 'batch:', recentCards[0].batchId, 'created:', recentCards[0].createdAt);
    console.log('OLDEST IN 60:', recentCards[recentCards.length - 1].cardId, 'batch:', recentCards[recentCards.length - 1].batchId);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
