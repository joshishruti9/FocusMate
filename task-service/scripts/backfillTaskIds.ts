import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Task from '../src/models/task.model';

async function backfill() {
  const mongo = process.env.MONGODB_URI || 'mongodb://localhost:27017/focusmate';
  await mongoose.connect(mongo);
  try {
    const cursor = Task.find({ taskId: { $exists: false } }).cursor();
    let count = 0;
    for await (const doc of cursor) {
      doc.set('taskId', uuidv4());
      await doc.save();
      count++;
    }
    console.log(`Backfilled ${count} tasks with taskId`);
  } finally {
    await mongoose.disconnect();
  }
}

backfill().catch(err => {
  console.error(err);
  process.exit(1);
});
