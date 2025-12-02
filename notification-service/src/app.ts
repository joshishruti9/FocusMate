import express from 'express';
import bodyParser from 'body-parser';
import NotificationService from './services/notificationService';

const app = express();
app.use(bodyParser.json());

app.get('/health', (_req, res) => res.status(200).send({ ok: true }));

// admin endpoint to trigger immediate check
app.get('/admin/run-check', async (req, res) => {
  try {
    await notificationService.triggerCheck(req as any, res as any);
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as any).message });
  }
});

const PORT = process.env.PORT || 5003;

const notificationService = NotificationService.getInstance();
notificationService.start();

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
