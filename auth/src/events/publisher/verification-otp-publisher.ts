import {
  Publisher,
  Subjects,
  UserVerificationOtpEvent,
} from '@bloggie/library';

export class VerificationOtp extends Publisher<UserVerificationOtpEvent> {
  readonly subject = Subjects.UserVerificationOtp;
}
