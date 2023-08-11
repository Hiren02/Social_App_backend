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
    userName,
    email,
    twoFactorAuthentication,
    isOTPVerified,
    friends,
    requests,
    role,
    dob,
    posts,
    profilePhoto,
  } = obj;
  return {
    _id,
    userName,
    email,
    twoFactorAuthentication,
    isOTPVerified,
    friends,
    requests,
    role,
    dob,
    posts,
    profilePhoto,
  };
}

function filterUserFriends(friendsArray) {
  return friendsArray.map((id) => {
    return id._id;
  });
}

function filterUsersDetails(userDetails) {
  return userDetails.map((users) => {
    return {
      _id: users._id,
      email: users.email,
      userName: users.userName,
      status: users.status,
      dob: users.dob,
      gender: users.gender,
      role: users.role,
      twoFactorAuthentication: users.twoFactorAuthentication,
      isOTPVerified: users.isOTPVerified,
      friends: users.friends,
      requests: users.requests,
      posts:users.posts,
      profilePhoto:users.profilePhoto
    };
  });
}

function filterDetails(userDetails) {
  return userDetails.map((users) => {
    return {
      _id: users._id,
      email: users.email,
      userName: users.userName,
      profilePhoto:users.profilePhoto,
      requests : users.requests
    };
  });
}

module.exports = {
  responseMapping,
  filterUserFriends,
  filterUsersDetails,
  responseMappingWithData,
  filteredUserResponseFields,
  filterDetails
  
};
