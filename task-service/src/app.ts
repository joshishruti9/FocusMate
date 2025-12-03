import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import taskRoutes from './routes/task.routes';

dotenv.config();

const mongoUri = "mongodb+srv://sjoshi2_db_user:ddMzBV8iy0oSRE2y@focusmate.ylqqvj8.mongodb.net/?appName=focusmate";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// DB connection
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
