let messages = {
  InvalidRegisterDetails:
    "Please provide the same email address and contact number",
  InavalidEmailAddress: "please provide valid email",
  VerificationCodeSentToBoth:
    "Your account has been created. Please provide security code sent to your email address and contact number",
  InvalidCredentials: "Your email or password is incorrect. Please try again.",
  internalServerError: "Internal server error. Please try after some time",
  InvalidDetails: "Please provide valid details",
  InvalidVerificationCode: "Verification failed. Please try again.",
  VerificationSuccess: "Account verified successfully",
  PasswordUpdatedFailed: "Password update failed",
  OldPasswordDoesNotMatch: "Current password does not match",
  Success: "Success",
  InvalidToken: "something went wrong please try again",
  TimeOut: "Time out please request again",
  TOKEN_NOT_PROVIDED:
    "Your login session seems to be expired. Please login again",
  InvalidPassword: "Your email or password is incorrect. Please try again.",
  LoginSuccess: "Logged in successfully",
  LogoutSuccess: "Logged out successfully",
  ProfileUpdated: "Profile updated successfully",
  ResetPasswordMailSent: "Please check your registered email for further",
  PasswordUpdateSuccess: "Password updated successfully",
  ResetPasswordLinkExpired: "Your reset password link seems to be expired",
  EmailAlreadyExists: "Email id already exists",
  UsernameAlreadyExists: "username already exists",
  EmailResetSuccessful: "Email address updated successfully",
  ContactNumberAlreadyExists: "Contact number already exists",
  ContactResetSuccessful: "Contact number updated successfully",
  AddPostsuccessful: "Job post submited successfully",
  SUPERADMINAUTHORIZED: "Only Super-Admin can create admin",
  StatusChangeActiveToInactive:
    "Status changed successfully Active to Inactive",
  StatusChangeInactiveToActive:
    "Status changed successfully Inactive to Active",
  CompanyAlreadyExist: "Company already exist",
  EmailSetupErr: "Please contact admin for email setup",

  AlreadyAppliedJob: "This email is already applied for this job",
  ApplyJobPostSuccess: "Your request is successfully submited for this job",
  VerificationOTPsendSuccess: "OTP sent to your register email address",
  ResendVerificationOTPsendSuccess:
    "New OTP sent to your register email address",
  UserNameLoginSuccess: "logged in successfully",
  DeactivatedUser: "you are not activated user to perform this action.",
  DATANOTFOUND: "Data not found",
  NoPostsFound: "can not find this post",
  NoUserFound: "can not find this user",
  TemplateNotFound: "template not Found",
  NoCommentFound: "can not find the comment",
  NoCommentReplyFound: "there is no such reply from you",
  NoRequestFound:
    "there is no such requests from this user or user is your friend",
  NoLikeFound: "there is no like by this user",
  AlreadyRquested:
    " you have already requested to this user , or user is your friend",
  SelfRequestaAreNotAllowed: "you can not request or add friend to yourSelf",
  selfRemovalNotAllowed: "you can not perform this action",
  CanNotRemoveFriend: "you can not remove this user or user is not your friend",
  notAllowed: "you can not perform this action",
  selfChatNotAllowed: "you can not chat to yourself",
  conversationAlreadyExist: "Conversation already exist",
};

let codes = {
  FRBDN: 403,
  INTRNLSRVR: 500,
  Success: 200,
  DataNotFound: 404,
  BadRequest: 400,
  ReqTimeOut: 408,
};

module.exports = {
  CODE: codes,
  MESSAGE: messages,
};
