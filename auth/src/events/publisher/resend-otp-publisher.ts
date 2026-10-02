import { Publisher, Subjects, UserResendOtpEvent } from '@bloggie/library';

export class ResendOtpPublisher extends Publisher<UserResendOtpEvent> {
  readonly subject = Subjects.UserResendOtp;
}
