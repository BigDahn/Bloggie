import { Email } from '../utils/email';

const sendOtp = async (email: string, otp: string) => {
  const emailService = new Email(otp, email);
  await emailService.send('otp-email-template', 'Your OTP for Bloggie App');
};

export { sendOtp };
