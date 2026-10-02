export class OtpService {
  static generateOtp = jest.fn();
  static verifyOtp = jest.fn().mockResolvedValue(true);
}
