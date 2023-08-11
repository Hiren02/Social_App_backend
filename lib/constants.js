const STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
  };
  
  const USER_TYPE = {
    SUPER_ADMIN: "super-admin",
    ADMIN: "admin",
    USER: "user",
   
  };

const GENDER = {
  MALE : "male",
  FEMALE : "female",
  CUSTOM : "other"
};

  

const DB_MODEL_REF = {

    USERS: "users",
    ADMINS: "admins",
    EMAILTEMPLATES: "emailtemplates",
    THIRD_PARTY_SERVICES: "thirdpartyservices",
    FRIENDS : "friends"

  };

  const EMAIL_TEMPLATES = {
    // USER_NEW_REGISTER_WELCOME: "Welcome mail",
    NEW_VERIFICATION_CODE: "Security verification mail",
    NEW_RESEND_CODE: "Resend OTP Security verification mail",
    
    USER_FORGOT_PASSWORD: "User: Forgot password",
    // ADMIN_FORGOT_PASSWORD: "Admin: Forgot password",
    USER_RESET_PASSWORD: "User: Reset password",
    // ADMIN_RESET_PASSWORD: "Admin: Reset password",
    // TWO_FACTOR_AUTHENTICATION_ENABLED: "2FA enabled",
    TEST_NAME : "User : we are testing this create template API"
    // TWO_FACTOR_AUTHENTICATION_DISABLED: "2FA disabled",
  
  };

  module.exports = Object.freeze({
    // TOKEN_EXPIRATION_TIME: 24 * 60
     // in mins - 60
    STATUS,
    USER_TYPE,
    DB_MODEL_REF,
    GENDER,
    EMAIL_TEMPLATES,
  });