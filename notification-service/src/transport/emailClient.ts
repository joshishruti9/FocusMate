import nodemailer from 'nodemailer';

class EmailClient {
  static async sendEmail(to: string, subject: string, text: string) {
    if (process.env.NODE_ENV === 'test') {
      // In tests, just resolve to avoid sending real emails
      return Promise.resolve({ to, subject, text });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: Number( 587),
      secure: false,
      auth: {
        user: 'testmail@gmail.com',
        pass: '*********',
      },
    });

    const result = await transporter.sendMail({
      from: 'sjoshi2@seattleu.edu',
      to,
      subject,
      text,
    });

    return result;
  }
}

export default EmailClient;
