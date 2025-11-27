import NotificationService from '../services/notificationService';
import EmailClient from '../transport/emailClient';
import axios from 'axios';

jest.mock('axios');
jest.mock('../transport/emailClient');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedEmailClient = EmailClient as jest.Mocked<typeof EmailClient>;

describe('Notification Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('sends email for tasks due soon when user has email notifications enabled', async () => {
    const now = new Date();
    const soon = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

    mockedAxios.get.mockImplementation(url => {
      if (url.toString().includes('/api/tasks/due-soon')) {
        return Promise.resolve({ data: [{ taskName: 'Test', dueDate: new Date().toISOString(), reminder: { enabled: true, remindAt: soon.toISOString() }, userEmail: 'test@example.com' }] });
      }
      if (url.toString().includes('/api/users/email')) {
        return Promise.resolve({ data: { userEmail: 'test@example.com', notificationPreference: { email: { enabled: true, scheduleCron: '*/1 * * * *' } } } });
      }
      return Promise.resolve({ data: {} });
    });

    mockedEmailClient.sendEmail.mockResolvedValue({ to: 'test@example.com',  subject: "Hello", text: "This is a test email" });

    const svc = NotificationService.getInstance();
    await svc.checkAndNotify();

    expect(mockedEmailClient.sendEmail).toHaveBeenCalledWith('test@example.com', expect.any(String), expect.stringContaining('Test'));
  });

  it('sends email for tasks that have reminder.remindAt within window', async () => {
    const now = new Date();
    const soon = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    mockedAxios.get.mockImplementation(url => {
      if (url.toString().includes('/api/tasks/due-soon')) {
        return Promise.resolve({ data: [{ taskName: 'ReminderTask', dueDate: new Date().toISOString(), reminder: { enabled: true, remindAt: soon.toISOString() }, userEmail: 'reminder@test.com' }] });
      }
      if (url.toString().includes('/api/users/email')) {
        return Promise.resolve({ data: { userEmail: 'reminder@test.com', notificationPreference: { email: { enabled: true, scheduleCron: '*/1 * * * *' } } } });
      }
      return Promise.resolve({ data: {} });
    });

    mockedEmailClient.sendEmail.mockResolvedValue({ to: 'reminder@test.com',  subject: "Hello", text: "This is a test email" });

    const svc = NotificationService.getInstance();
    await svc.checkAndNotify();

    expect(mockedEmailClient.sendEmail).toHaveBeenCalledWith('reminder@test.com', expect.any(String), expect.stringContaining('ReminderTask'));
  });

  it('does not send email when user has disabled notifications', async () => {
    const now = new Date();
    const soon = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    mockedAxios.get.mockImplementation(url => {
      if (url.toString().includes('/api/tasks/due-soon')) {
        return Promise.resolve({ data: [{ taskName: 'Test2', dueDate: new Date().toISOString(), reminder: { enabled: false, remindAt: soon.toISOString() }, userEmail: 'disabled@test.com' }] });
      }
      if (url.toString().includes('/api/users/email')) {
        return Promise.resolve({ data: { userEmail: 'disabled@test.com', notificationPreference: { email: { enabled: false, scheduleCron: '*/1 * * * *' } } } });
      }
      return Promise.resolve({ data: {} });
    });

    const svc = NotificationService.getInstance();
    await svc.checkAndNotify();

    expect(mockedEmailClient.sendEmail).not.toHaveBeenCalled();
  });
});
