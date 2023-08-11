

 let messages = {
    AccountNotFound:
      "An account with the provided details does not exist. Please try again with valid details",
    InvalidRegisterDetails:
      "Please provide the same email address and contact number",
    VerificationCodeSentToBoth:
      "Your account has been created. Please provide security code sent to your email address and contact number",
    InvalidCredentials: "Your email or password is incorrect. Please try again.",
    internalServerError: "Internal server error. Please try after some time",
    InvalidDetails: "Please provide valid details",
    InvalidVerificationCode: "Verification failed. Please try again.",
    VerificationSuccess: "Account verified successfully",
    Success: "Success",
    DATANOTFOUND: "Data not found",
    TOKEN_NOT_PROVIDED:
      "Your login session seems to be expired. Please login again",
    InvalidPassword: "Your email or password is incorrect. Please try again.",
    OldPasswordDoesNotMatch: "Current password does not match",
    LoginSuccess: "Logged in successfully",
    LogoutSuccess: "Logged out successfully",
    ProfileUpdatedSuccess: "Profile updated successfully",
    ProfileUpdatedFailed: "Profile update failed",
    ResetPasswordMailSent: "Please check your email for password reset",
    PasswordUpdateSuccess: "Password updated successfully",
    PasswordUpdatedFailed: "Password update failed",
    ResetPasswordLinkExpired: "Your reset password link seems to be expired",
    EmailAlreadyExists: "Email id already exists",
    UsernameAlreadyExists: "Username already exists",
    EmailResetSuccessful: "Email address updated successfully",
    ContactNumberAlreadyExists: "Contact number already exists",
    ContactResetSuccessful: "Contact number updated successfully",
    AddPostsuccessful: "Job post added successfully",
    SUPERADMINAUTHORIZED: "Only Super-Admin can create admin",
    SUPERADMINANDADMINAUTHORIZED: "Only Super-Admin or Admin can create User",
    DeleteRecordSuccess: "Record deleted successfully",
    DeleteRecordFailed: "Failed detele record",
    StatusChangeActiveToInactive:
      "Status changed successfully Active to Inactive",
    StatusChangeInactiveToActive:
      "Status changed successfully Inactive to Active",
    MasterDataAdded: "Details added successfully",
    MasterAlreadyExists: "Details with the same type already exists",
    MasterNotFound: "Master record does not exists",
    ValuesAddedSuccess: "Value added successfully",
    MasterUpdateSuccess: "Value updated successfully",
    MasterDeletedSuccess: "Value removed successfully",
    TemplateAlreadyExists: "Template already exists",
    TemplateCreatedSuccess: "Template added successfully",
    TemplateNotFound: "Template does not exists",
    TemplateUpdated: "Template updated successfully",
    TemplateActivated: "Template activated successfully",
    TemplateDeleted: "Template deleted successfully",
    TemplateDeactivated: "Template deactivated successfully",
    UserActivated: "User activated successfully",
    UserDeactivated: "User deactivated successfully",
    MasterValueNotDelete:
      "You can not delete this.This value is already being used",
    MasterValueDeleteSuccess: "Value removed successfully",
    AdminCreateSuccess: "Admin created Successfully",
    UserCreateSuccess: "User created Successfully",
  
    JobRoleAlreadyExists: "Job role with the same name already exists",
    JobRoleCreateSuccess: "New job-role created successfully",
    JobRoleNotFound: "Job role does not exists",
    JobRoleUpdateSuccess: "Job role update successfully",
    JobRoleUpdateFailed: "Job Role update failed",
    JobRoleActiveSuccess: "Job Role Active Successfully",
    JobRoleInActiveSuccess: "Job Role Inactive Successfully",
    JobRoleNotStatusNotChange:
      "You can not Inactive this job role, it is used by someone",
  
    SubJobRoleAddSuccess: "Sub job role add successfully",
    SubJobRoleAlreadyExists: "Sub Job role with the same name already exists",
    SubJobRoleUpdateSuccess: "Sub-Job role update successfully",
    SubJobRoleUpdateFailed: "Sub-Job Role update failed",
    SubJobRoleNotFound: "Sub-Job role does not exists",
    SubJobRoleActiveSuccess: "Sub-Job Role Active Successfully",
    SubJobRoleInActiveSuccess: "Sub-Job Role Inactive Successfully",
    SubJobRoleNotStatusNotChange:
      "You can not Inactive this sub-job role, it is used by someone",
  
    LanguageAddSucess: "Language add successfully",
    LanguageAlreadyExists: "This Language is already exists",
    LanguageNotFound: "Language Not Found",
    LanguageUpdateSuccess: "Language update successfully",
    LanguageUpdateFailed: "Language update failed",
    LanguageDeleteFailed: "Language is used by someone You can not delete",
    LanguageDeleteSuccess: "Language delete successfully",
    LocationAddSucess: "Location add successfully",
    LocationAlreadyExists: "This Location is already exists",
    LocationNotFound: "Location Not Found",
    LocationUpdateSuccess: "Location update successfully",
    LocationUpdateFailed: "Location update failed",
    LocationDeleteFailed: "Location is used by someone You can not delete",
    LocationDeleteSuccess: "Location delete successfully",
  
    CompanyNotFound: "Company Does not exist",
    CompanyActiveSuccess: "Company Active Successfully",
    CompanyInActiveSuccess: "Company Inactive Successfully",
    VerificationOTPsendSuccess: "OTP sent to your register email address",
    ResendVerificationOTPsendSuccess:
      "New OTP sent to your register email address",
    DeactivatedUser : "you are not activated user to perform this action."  ,
  TimeOut:'Time out please request again',
  notAllowedUser:"you are not allowed user to perform this action",
  InvalidToken:'something went wrong please try again',

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
  