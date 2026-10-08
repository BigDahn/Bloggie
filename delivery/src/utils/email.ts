import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

export class Email {
  protected from: string = 'Bloggie App';
  constructor(
    private otp: string,
    private to: string,
  ) {
    this.otp = otp;
    this.to = to;
  }

  transporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        pass: process.env.EMAIL_PASSWORD,
        user: process.env.EMAIL_USER,
      },
    });
  }

  async send(template: string, subject: string) {
    const templatePath = path.join(
      __dirname,
      '../template',
      `${template}.html`,
    );

    const templateSource = readFileSync(templatePath, 'utf-8');
    const templateHtml = Handlebars.compile(templateSource);

    const html = templateHtml({
      otp: this.otp,
      expiryMinutes: 10,
      year: new Date().getFullYear(),
    });

    const mailOptions = {
      to: this.to,
      from: this.from,
      subject: subject,
      html: html,
    };
    await this.transporter().sendMail(mailOptions);
  }
}
