function responseMapping(code, msg) {
  return {
    responseCode: code,
    responseMessage: msg,
  };
}

function responseMappingWithData(code, msg, data) {
  return {
    responseCode: code,
    responseMessage: msg,
    responseData: data,
  };
}

function filteredUserResponseFields(obj) {
  let {
    _id,
    email,
    userName,
    createdAt,
    createdBy,
    loginActivity,
    twoFactorAuthentication,
    role,
  } = obj;

  return {
    _id,

    email,
    createdBy,
    createdAt,
    userName,
    loginActivity,
    twoFactorAuthentication,
    role,
  };
}

function filterAllowedTemplateFields(templateDetails) {
  let { _id, mailName, mailTitle, mailBody, mailSubject } = templateDetails;
  return {
    _id,
    mailName,
    mailTitle,
    mailBody,
    mailSubject,
  };
}
function filteredUserFields(obj) {
  let {
    _id,
    email,
    userName,
    createdAt,
    createdBy,
    loginActivity,
    twoFactorAuthentication,
    role,
    status,
    dob,
    posts,
    friends,
    requests,
    profilePhoto,
    
  } = obj;

  return {
    _id,
    userName,
    email,
    createdBy,
    createdAt,
    loginActivity,
    twoFactorAuthentication,
    role,
    status,
    dob,
    posts,
    friends,
    requests,
    profilePhoto,
  };
}

function filterTemplateUpdateFields(templateDetails) {
  const { mailTitle, mailBody, mailSubject } = templateDetails;
  return { mailTitle, mailBody, mailSubject };
}

function filterUsersDetails(userDetails) {

  return userDetails.map((users)=>{
    return ({
      _id:users._id,
      email:users.email,
      userName:users.userName,
      status:users.status,
      dob:users.dob,
      gender:users.gender,
      role:users.role,
      twoFactorAuthentication:users.twoFactorAuthentication,
      isOTPVerified:users.isOTPVerified,
      friends:users.friends,
      requests:users.requests,
      profilePhoto:users.profilePhoto
    })
  })
}

module.exports = {
  responseMapping,

  responseMappingWithData,

  filteredUserResponseFields,

  filterAllowedTemplateFields,

  filteredUserFields,

  filterTemplateUpdateFields,
  filterUsersDetails,
};
