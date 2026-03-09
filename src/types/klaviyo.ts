export type ContactProperties = Partial<{
  firstName: string;
  lastName: string;
  userId: string;
  phoneNumber: string;

  //for registration
  verificationToken: string;
  //for forgot password
  resetPasswordToken: string;
}>;

export enum MessageEvent {
  USER_SIGNS_UP = "Stairpay Platform User Signs Up",
  USER_FORGOT_PASSWORD = "Stairpay Platform User Forgot Password",
  REQUEST_DEVELOPMENT_LISTING = "Request a new development",
  REQUEST_UNIT_LISTING = "Request a new unit",
}
