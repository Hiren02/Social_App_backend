const dao = require("./userDao");
const userConstant = require("./userConstants");
const mapper = require("./userMapper");
const constants = require("../../constants");
const appUtils = require("../../appUtils");
const ObjectId = require("mongoose").Types.ObjectId;
const mailHandler = require("../../middleware/email");
const jwtHandler = require("../../middleware/jwtHandler");
const fileUtils = require("../../middleware/multer");
const { query } = require("express");

async function registerUser(details) {
  try {
    let emailQuery = {
      email: details.email,
    };
    let userNameQuery = {
      userName: details.userName,
    };
    const isEmail = await dao.getUserDetails(emailQuery);
    const isUserName = await dao.getUserDetails(userNameQuery);
    if (isEmail) {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.EmailAlreadyExists
      );
    } else if (isUserName) {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.UsernameAlreadyExists
      );
    } else {
      let convertedPass = await appUtils.convertPass(details.password);
      console.log("inside try", details);
      details.password = convertedPass;
      details.createdAt = new Date().getTime();
      // details.dob = details.dob.split("-").reverse().join("-");
      // const date = new Date(details.dob);
      // details.dob = date;
      const userCreate = await dao.createUser(details);
      console.log(userCreate);
      if (userCreate) {
        return mapper.responseMappingWithData(
          userConstant.CODE.Success,
          userConstant.MESSAGE.Success,
          userCreate
        );
      } else {
        return mapper.responseMappingWithData(
          userConstant.CODE.INTRNLSRVR,
          userConstant.MESSAGE.internalServerError,
          userCreate
        );
      }
    }
  } catch (error) {
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function sendCode(details) {
  try {
    if (!details || Object.keys(details).length == 0) {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.InvalidDetails
      );
    } else {
      let query = {};
      if (details.email) {
        query.email = details.email.toLowerCase();
      } else {
        query.userName = details.userName.toLowerCase();
      }
      const userDetails = await dao.getUserDetails(query);
      try {
        if (userDetails) {
          let verificationCode = Math.floor(
            Math.random() * (999999 - 100000) + 100000
          );
          let updateObj = {};
          updateObj.OTP = verificationCode;
          updateObj.OTPExpiryTime = new Date().getTime() + 60 * 1000;
          if (details.email) {
            let mailQuery = {};
            if (details.resendOTP && details.resendOTP === true) {
              mailQuery.mailName = constants.EMAIL_TEMPLATES.NEW_RESEND_CODE;
            } else {
              mailQuery.mailName =
                constants.EMAIL_TEMPLATES.NEW_VERIFICATION_CODE;
            }
            let templateDetails = await dao.getTemplateDetails(mailQuery);
            if (templateDetails) {
              let mailUserDetails = {
                userName: userDetails.userName,
                email: userDetails.email,
                verificationCode: verificationCode,
              };
              mailHandler.SEND_MAIL(mailUserDetails, templateDetails);
            }
          }
          const userOTPUpdate = await dao.updateProfile(query, updateObj);
          try {
            if (userOTPUpdate) {
              if (details.email || details.userName) {
                if (details.resendOTP && details.resendOTP === true) {
                  return mapper.responseMapping(
                    userConstant.CODE.Success,
                    userConstant.MESSAGE.ResendVerificationOTPsendSuccess
                  );
                } else {
                  return mapper.responseMappingWithData(
                    userConstant.CODE.Success,
                    userConstant.MESSAGE.VerificationOTPsendSuccess,
                    details._id
                  );
                }
              }
            } else {
              return mapper.responseMapping(
                userConstant.CODE.INTRNLSRVR,
                userConstant.MESSAGE.internalServerError
              );
            }
          } catch (error) {
            return mapper.responseMapping(
              userConstant.CODE.INTRNLSRVR,
              userConstant.MESSAGE.internalServerError
            );
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.InvalidCredentials
          );
        }
      } catch (error) {
        return mapper.responseMapping(
          userConstant.CODE.INTRNLSRVR,
          userConstant.MESSAGE.internalServerError
        );
      }
    }
  } catch (error) {
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function verifySecurityCode(id, OTP) {
  try {
    if (!id || !ObjectId.isValid(id) || !OTP) {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.InvalidDetails
      );
    } else {
      let query = {
        _id: id,
        OTP: OTP,
      };
      const userDetails = await dao.getUserDetails(query);
      if (userDetails) {
        let currentTime = Date.now();
        if (userDetails.OTPExpiryTime > currentTime) {
          let updatedObj = {
            isOTPVerified: true,
          };
          const userUpdated = await dao.updateProfile(query, updatedObj);
          if (userUpdated) {
            let filteredUserResponseFields =
              mapper.filteredUserResponseFields(userUpdated);
            let usrObj = {
              _id: userUpdated._id,
              email: userUpdated.email.toLowerCase(),
            };
            const results = await Promise.all([
              jwtHandler.genUserToken(usrObj),
            ]);
            if (results) {
              let token = results[0];
              filteredUserResponseFields.token = token;
              return mapper.responseMappingWithData(
                userConstant.CODE.Success,
                userConstant.MESSAGE.LoginSuccess,
                filteredUserResponseFields
              );
            } else {
              return mapper.responseMapping(
                userConstant.CODE.INTRNLSRVR,
                userConstant.MESSAGE.internalServerError
              );
            }
          } else {
            return mapper.responseMapping(
              userConstant.CODE.INTRNLSRVR,
              userConstant.MESSAGE.internalServerError
            );
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.BadRequest,
            userConstant.MESSAGE.TimeOut
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.BadRequest,
          userConstant.MESSAGE.InvalidVerificationCode
        );
      }
    }
  } catch (err) {
    return mapper.responseMapping(
      constants.CODE.INTRNLSRVR,
      constants.MESSAGE.internalServerError
    );
  }
}

async function login(details) {
  try {
    if (!details || Object.keys(details).length == 0) {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.InvalidDetails
      );
    } else {
      let query = {
        role: details.role,
      };
      let match = appUtils.isValidEmail(details.email);
      console.log("match", match);
      if (match == true) {
        query.email = details.email;
      }
      if (match == false) {
        query.userName = details.email;
      }
      const userDetails = await dao.getUserDetails(query);
      if (userDetails) {
        if (userDetails.status === "ACTIVE") {
          let isValidPassword = await appUtils.verifyPassword(
            details.password,
            userDetails.password
          );
          if (isValidPassword) {
            let prevLoginActivities = userDetails.loginActivity;
            prevLoginActivities.push({
              device: details.device,
              date: details.date,
              browser: details.browser,
              ipaddress: details.ipaddress,
              country: details.country,
              state: details.state,
            });
            if (userDetails.twoFactorAuthentication === true) {
              let result = await sendCode(userDetails);
              return result;
            } else {
              let updateObj = {
                loginActivity: prevLoginActivities,
              };
              const userUpdated = await dao.updateProfile(query, updateObj);
              console.log("userUpdated", userUpdated);
              try {
                if (userUpdated) {
                  let filteredUserResponseFields =
                    mapper.filteredUserResponseFields(userUpdated);
                  let usrObj = {
                    _id: userUpdated._id,
                    email: userUpdated.email.toLowerCase(),
                    // userName: userUpdated.userName,
                  };
                  const results = await Promise.all([
                    jwtHandler.genUserToken(usrObj),
                  ]);
                  let token = results[0];
                  filteredUserResponseFields.token = token;
                  if (details.email) {
                    return mapper.responseMappingWithData(
                      userConstant.CODE.Success,
                      userConstant.MESSAGE.LoginSuccess,
                      filteredUserResponseFields
                    );
                  } else {
                    return mapper.responseMappingWithData(
                      userConstant.CODE.Success,
                      userConstant.MESSAGE.UserNameLoginSuccess,
                      filteredUserResponseFields
                    );
                  }
                } else {
                  // console.log("inside else");
                  return mapper.responseMapping(
                    userConstant.CODE.INTRNLSRVR,
                    userConstant.MESSAGE.internalServerError
                  );
                }
              } catch (err) {
                console.log({ err });
                return mapper.responseMapping(
                  userConstant.CODE.INTRNLSRVR,
                  userConstant.MESSAGE.internalServerError
                );
              }
            }
          } else {
            return mapper.responseMapping(
              userConstant.CODE.BadRequest,
              userConstant.MESSAGE.InvalidPassword
            );
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.FRBDN,
            userConstant.MESSAGE.DeactivatedUser
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.InvalidCredentials
        );
      }
    }
  } catch (err) {
    console.log({ err });
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function setNewPassword(token, password, tokenData) {
  try {
    if (!token || !password) {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.InvalidDetails
      );
    } else {
      let query = { email: tokenData.email };
      let isUserExists = await dao.getUserDetails(query);
      console.log("isUserExists", isUserExists);
      // return false
      if (isUserExists && isUserExists.forgotPasswordToken === token) {
        // if(isUserExists.forgotPasswordToken === token){
        // return("valid token yes")

        // }
        let currentTime = Date.now();
        if (isUserExists.tokenExpiryTime > currentTime) {
          // return("not expired yet")

          let newPass = await appUtils.convertPass(password);
          let query = {
            email: isUserExists.email,
          };
          let updateObj = {
            password: newPass,
          };
          const updateDone = await dao.updateProfile(query, updateObj);
          if (updateDone) {
            return mapper.responseMapping(
              userConstant.CODE.Success,
              userConstant.MESSAGE.Success
            );
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.ReqTimeOut,
            userConstant.MESSAGE.TimeOut
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.InvalidToken
        );
      }
    }
  } catch (err) {
    console.log({ err });
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function getAllSuggetions(request) {
  try {
    let aggregateQuery = [];
    let aggregatedResult = [];

    let skip = request.skip ? parseInt(request.skip) : 0;
    let limit = request.limit ? parseInt(request.limit) : 100000;

    aggregateQuery.push(
      {
        $match: {
          $and: [
            { role: constants.USER_TYPE.USER },
            { status: constants.STATUS.ACTIVE },
          ],
        },
      },
      {
        $sort: { userName: 1 },
      },
      {
        $facet: {
          searched_user: [
            {
              $match: {
                _id: ObjectId(request.id),
              },
            },
          ],
          other_users: [
            {
              $match: {
                _id: {
                  $ne: ObjectId(request.id),
                },
              },
            },
          ],
        },
      },
      {
        $unwind: "$searched_user",
      },
      {
        $project: {
          not_user_friends: {
            $filter: {
              input: "$other_users",
              as: "array",
              cond: {
                $not: { $in: ["$$array._id", "$searched_user.friends._id"] },
              },
            },
          },
        },
      },

      {
        $project: {
          data: { $slice: ["$not_user_friends", skip, limit] },
        },
      }
    );

    const aggregated = await dao.getAllUserDetailsByQuery(aggregateQuery);

    let detailsArr = aggregated[0].data;
    aggregatedResult = mapper.filterDetails(detailsArr);

    if (aggregatedResult.length > 0) {
      let total = aggregatedResult.length;

      let responseObj = {
        totalRecords: total,
        records: aggregatedResult,
      };
      return mapper.responseMappingWithData(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success,
        responseObj
      );
    } else {
      let total = aggregatedResult.length;

      let responseObj = {
        totalRecords: total,
        records: aggregatedResult,
        message: "Records not found",
      };
      return mapper.responseMappingWithData(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success,
        responseObj
      );
    }
  } catch (error) {
    console.log(error);
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function getUserFriends(request) {
  try {
    let aggregateQuery = [{ $sort: { userName: 1 } }];
    aggregateQuery.push({ $match: { role: constants.USER_TYPE.USER } });

    if (request.id) {
      console.log(
        "indide else.................................................................."
      );
      aggregateQuery.push(
        {
          $match: {
            _id: ObjectId(request.id),
          },
        },
        {
          $unwind: "$friends",
        },
        {
          $lookup: {
            from: "users",
            localField: "friends._id",
            foreignField: "_id",
            as: "friendsInfo",
          },
        },
        {
          $unwind: "$friendsInfo",
        }
      );

      if (request.key && request.key !== "") {
        aggregateQuery.push({
          $match: {
            $or: [
              { "friendsInfo.userName": { $regex: request.key } },
              // { "friendsInfo.gender": { $regex: key } },
              // { "friendsInfo.email": { $regex: key } },
            ],
          },
        });
      }
      aggregateQuery.push(
        { $skip: request.skip ? parseInt(request.skip) : 0 },
        { $limit: request.limit ? parseInt(request.limit) : 10 }
      );
      aggregateQuery.push({
        $project: {
          "friendsInfo._id": 1,
          "friendsInfo.userName": 1,
          "friendsInfo.profilePhoto": 1,
          "friendsInfo.email": 1,
          "friendsInfo.gender": 1,
          "friendsInfo.posts": 1,
          "friendsInfo.status": 1,
          "friendsInfo.dob": 1,
          "friendsInfo.friends": 1,
          "friendsInfo.requests": 1,
          "friendsInfo.profilePhoto": 1,
        },
      });
      const aggregatedResult = await dao.getAllUserDetailsByQuery(
        aggregateQuery
      );
      console.log(aggregatedResult);

      if (aggregatedResult.length > 0) {
        let friendsDeatils = aggregatedResult.map((array) => {
          return array.friendsInfo;
        });
        let total = aggregatedResult.length;
        let responseObj = {
          totalRecords: total,
          records: friendsDeatils,
        };
        return mapper.responseMappingWithData(
          userConstant.CODE.Success,
          userConstant.MESSAGE.Success,
          responseObj
        );
      } else {
        let total = aggregatedResult.length;

        let responseObj = {
          totalRecords: total,
          records: aggregatedResult,
          message: "Records not found",
        };
        return mapper.responseMappingWithData(
          userConstant.CODE.Success,
          userConstant.MESSAGE.Success,
          responseObj
        );
      }
    }
  } catch (error) {
    console.log(error);
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function acceptFriendRequest(details) {
  try {
    if (details.acceptersId != details.reqMakersId) {
      let userQuery = {
        _id: details.acceptersId,
        status: constants.STATUS.ACTIVE,
        role: constants.USER_TYPE.USER,
      };
      const userDetails = await dao.getUserDetails(userQuery);
      console.log("userDetails", userDetails);
      if (userDetails) {
        let friendQuery = {
          _id: details.reqMakersId,
          status: constants.STATUS.ACTIVE,
          role: constants.USER_TYPE.USER,
        };
        const friendsDetails = await dao.getUserDetails(friendQuery);
        // console.log("friendsDetails", friendsDetails);
        if (friendsDetails) {
          let userFriendsArray = userDetails.friends;
          let userRequestsArray = userDetails.requests;
          // console.log("userRequestsArray", userRequestsArray);
          if (userRequestsArray.length > 0) {
            for (let i = 0; i < userRequestsArray.length; i++) {
              // console.log(userRequestsArray[i]._id)
              if (userRequestsArray[i]._id == details.reqMakersId) {
                console.log(
                  "inside iffffffffffffffffffffffffffffffffffffffffffff"
                );
                userRequestsArray.splice(i, 1);
                userFriendsArray.push({
                  _id: details.reqMakersId,
                });
                friendsDetails.friends.push({
                  _id: details.acceptersId,
                });
              }
            }
            // console.log(userRequestsArray ,userFriendsArray);
            // return false;
            let userUpdateObj = {
              friends: userFriendsArray,
              requests: userRequestsArray,
            };
            let friendUpdateObj = {
              friends: friendsDetails.friends,
            };
            const updateListOfUsersFriend = await dao.updateProfile(
              userQuery,
              userUpdateObj
            );
            const updateListOfFriends = await dao.updateProfile(
              friendQuery,
              friendUpdateObj
            );
            if (updateListOfUsersFriend && updateListOfFriends) {
              return mapper.responseMapping(
                userConstant.CODE.Success,
                userConstant.MESSAGE.Success
              );
            } else {
              return mapper.responseMapping(
                userConstant.CODE.INTRNLSRVR,
                userConstant.MESSAGE.internalServerError
              );
            }
          } else {
            return mapper.responseMapping(
              userConstant.CODE.DataNotFound,
              userConstant.MESSAGE.NoRequestFound
            );
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoUserFound
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.SelfRequestaAreNotAllowed
      );
    }
  } catch (error) {
    console.log("err", error);
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function sendRequest(userId, friendId) {
  try {
    if (userId != friendId) {
      let query = {
        _id: userId,
        role: constants.USER_TYPE.USER,
        status: constants.STATUS.ACTIVE,
      };
      let userDetails = await dao.getUserDetails(query);

      if (userDetails) {
        let friendQuery = {
          _id: friendId,
          role: constants.USER_TYPE.USER,
          status: constants.STATUS.ACTIVE,
        };
        let friendsDeatils = await dao.getUserDetails(friendQuery);
        if (friendsDeatils) {
          let friendRequests = friendsDeatils.requests;
          let friendOfFriends = friendsDeatils.friends;
          console.log("friendsDeatils", friendRequests);

          let objIndex = friendRequests.findIndex(
            (array) => array._id == userId
          );
          console.log("objIndex", objIndex);
          let index = friendOfFriends.findIndex((array) => array._id == userId);

          if (objIndex === -1 && index === -1) {
            friendRequests.push({
              _id: userId,
            });
            let updateQuery = {
              _id: friendId,
            };
            let updateObj = {
              requests: friendRequests,
            };
            let updateAddFriendList = await dao.updateProfile(
              updateQuery,
              updateObj
            );
            if (updateAddFriendList) {
              return mapper.responseMapping(
                userConstant.CODE.Success,
                userConstant.MESSAGE.Success
              );
            } else {
              return mapper.responseMapping(
                userConstant.CODE.INTRNLSRVR,
                userConstant.MESSAGE.internalServerError
              );
            }
          } else {
            return mapper.responseMapping(
              userConstant.CODE.BadRequest,
              userConstant.MESSAGE.AlreadyRquested
            );
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoUserFound
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      // console.log("can not request yourself");
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.SelfRequestaAreNotAllowed
      );
    }
  } catch {
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function forgotPassword(email) {
  try {
    let query = {
      email: email.toLowerCase(),
    };
    const userDetails = await dao.getUserDetails(query);
    // console.log("userDetails",userDetails);
    if (userDetails) {
      // console.log("inside the block");
      let usrObj = {
        email: userDetails.email.toLowerCase(),
        tokenExpiryTime: new Date().getTime() + 30 * 60 * 1000,
      };
      const results = await Promise.all([jwtHandler.genUserToken(usrObj)]);
      let token = results[0];
      console.log("inside forgot password token", token);
      let updateObj = {
        forgotPasswordToken: token,
        tokenExpiryTime: new Date().getTime() + 30 * 60 * 1000,
      };
      let updateToken = await dao.updateProfile(query, updateObj);
      // console.log("updateToken", updateToken);
      let templateQuery = {
        mailName: constants.EMAIL_TEMPLATES.USER_FORGOT_PASSWORD,
      };
      let templateDetails = await dao.getTemplateDetails(templateQuery);

      if (templateDetails) {
        let mailUserDetails = {
          userName: userDetails.userName,
          email: userDetails.email.toLowerCase(),
          forgotPasswordUrl: `${process.env.URL}setNewPassword/${token}`,
        };
        mailHandler.SEND_MAIL(mailUserDetails, templateDetails);
        return mapper.responseMapping(
          userConstant.CODE.Success,
          userConstant.MESSAGE.ResetPasswordMailSent
        );
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.TemplateNotFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.InavalidEmailAddress
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function changePassword(id, details) {
  try {
    let query = {
      _id: id,
    };
    const userDetails = await dao.getUserDetails(query);
    if (userDetails) {
      let isMatchingPassword = await appUtils.verifyPassword(
        details.currentPassword,
        userDetails.password
      );
      if (isMatchingPassword) {
        let newPasswordForUser = await appUtils.convertPass(
          details.newPassword
        );
        let updateObj = {
          password: newPasswordForUser,
        };
        const updatePassword = await dao.updateProfile(query, updateObj);
        if (updatePassword) {
          let templateQuery = {
            mailName: constants.EMAIL_TEMPLATES.USER_RESET_PASSWORD,
          };
          let templateDetails = await dao.getTemplateDetails(templateQuery);

          if (templateDetails) {
            let mailUserDetails = {
              email: userDetails.email,
              userName: userDetails.userName,
            };
            mailHandler.SEND_MAIL(mailUserDetails, templateDetails);
          } else {
            return mapper.responseMapping(
              userConstant.CODE.DataNotFound,
              userConstant.MESSAGE.TemplateNotFound
            );
          }
          return mapper.responseMapping(
            userConstant.CODE.Success,
            userConstant.MESSAGE.PasswordUpdateSuccess
          );
        } else {
          return mapper.responseMapping(
            userConstant.CODE.BadRequest,
            userConstant.MESSAGE.PasswordUpdatedFailed
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.BadRequest,
          userConstant.MESSAGE.OldPasswordDoesNotMatch
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.InvalidCredentials
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function twoFactorAuthToggle(details, id) {
  try {
    let query = {
      email: details.email,
      _id: id,
    };
    let userDetails = await dao.getUserDetails(query);
    if (userDetails) {
      let updateObj = {
        twoFactorAuthentication: details.twoFactorAuthentication,
      };
      let updatedUser = await dao.updateProfile(query, updateObj);
      if (updatedUser) {
        return mapper.responseMapping(
          userConstant.CODE.Success,
          userConstant.MESSAGE.Success
        );
      } else {
        return mapper.responseMapping(
          userConstant.CODE.INTRNLSRVR,
          userConstant.MESSAGE.internalServerError
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.DATANOTFOUND
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function addFeeds(req) {
  let details = req.body;
  let { id } = req.params;
  if (
    !details ||
    Object.keys(details).length == 0 ||
    !details.userName ||
    !id ||
    !ObjectId.isValid(id)
  ) {
    return mapper.responseMapping(
      userConstant.CODE.BadRequest,
      userConstant.MESSAGE.InvalidDetails
    );
  } else {
    // fileUtils.upload(req, res, async (err) => {

    let query = {
      userName: details.userName,
      role: constants.USER_TYPE.USER,
      _id: id,
    };
    const userDetails = await dao.getUserDetails(query);
    // console.log(userDetails)
    if (userDetails) {
      let file = req.file;
      console.log("file", file);
      const result = await appUtils.uploadImage(file);
      // console.log("result", result.url);

      if (result && result.url) {
        userDetails.posts.push({
          createdAt: Date.now(),
          description: details.description,
          imageURL: result.url,
        });

        let updateQuery = {
          _id: userDetails._id,
          userName: details.userName,
        };

        let updateObj = {
          posts: userDetails.posts,
        };
        let updatedProfile = await dao.updateProfile(updateQuery, updateObj);
        // console.log("updatedProfile",updatedProfile)
        if (updatedProfile) {
          // console.log("inside if");
          return mapper.responseMapping(
            userConstant.CODE.Success,
            userConstant.MESSAGE.Success
          );
        } else {
          return mapper.responseMapping(
            userConstant.CODE.INTRNLSRVR,
            userConstant.MESSAGE.internalServerError
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.INTRNLSRVR,
          userConstant.MESSAGE.internalServerError
        );
      }
    } else {
      // console.log("no found");
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.DATANOTFOUND
      );
    }
  }
  // })
}

async function addLike(details, id) {
  // let details = req.body;
  console.log("sdfjsagdfgsdfhjhs", details, id);
  if (
    !details ||
    Object.keys(details).length == 0 ||
    !details.likeFrom ||
    !details.to ||
    !id ||
    !ObjectId.isValid(id)
  ) {
    return mapper.responseMapping(
      userConstant.CODE.BadRequest,
      userConstant.MESSAGE.InvalidDetails
    );
  } else {
    let userQuery = {
      userName: details.likeFrom,
      role: constants.USER_TYPE.USER,
      _id: id,
    };
    let userDeatils = await dao.getUserDetails(userQuery);
    if (userDeatils) {
      let friendQuery = {
        userName: details.to,
        role: constants.USER_TYPE.USER,
      };
      let friendsDeatils = await dao.getUserDetails(friendQuery);
      if (friendsDeatils) {
        let postArray = friendsDeatils.posts;

        let objIndex = postArray.findIndex(
          (array) => array._id == details.post_id
        );
        // console.log("objIndex",objIndex);
        if (objIndex === -1) {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoPostsFound
          );
        } else {
          let likesArray = postArray[objIndex].likesBy;
          console.log("likesArray", likesArray);
          let filteredArray = likesArray.filter(
            (array) => array.userName === details.likeFrom
          );
          // console.log("filterdArray",filteredArray);
          if (filteredArray.length > 0) {
            return mapper.responseMapping(
              userConstant.CODE.BadRequest,
              "you have already liked this post"
            );
          } else {
            likesArray.push({
              userName: details.likeFrom,
            });

            // return false;
            postArray[objIndex].likesBy = likesArray;
            postArray[objIndex].likesCount = postArray[objIndex].likesCount + 1;
            // console.log("postArray",postArray)
            let updateObj = {};

            updateObj.posts = postArray;
            let updateFriendsProfile = await dao.updateProfile(
              friendQuery,
              updateObj
            );
            // console.log("updateFriendsProfile",updateFriendsProfile);
            if (updateFriendsProfile) {
              return mapper.responseMapping(
                userConstant.CODE.Success,
                userConstant.MESSAGE.Success
              );
            } else {
              return mapper.responseMapping(
                userConstant.CODE.INTRNLSRVR,
                userConstant.MESSAGE.internalServerError
              );
            }
          }
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.DATANOTFOUND
      );
    }
  }
}

async function dislikePost(details, id) {
  // let details = req.body;
  if (
    !details ||
    Object.keys(details).length == 0 ||
    !details.dislikeFrom ||
    !details.to ||
    !id ||
    !ObjectId.isValid(id)
  ) {
    return mapper.responseMapping(
      userConstant.CODE.BadRequest,
      userConstant.MESSAGE.InvalidDetails
    );
  } else {
    let userQuery = {
      userName: details.dislikeFrom,
      role: constants.USER_TYPE.USER,
      _id: id,
    };
    let userDeatils = await dao.getUserDetails(userQuery);
    if (userDeatils) {
      let friendQuery = {
        userName: details.to,
        role: constants.USER_TYPE.USER,
      };
      let friendsDeatils = await dao.getUserDetails(friendQuery);
      if (friendsDeatils) {
        let postArray = friendsDeatils.posts;

        let objIndex = postArray.findIndex(
          (array) => array._id == details.post_id
        );
        // console.log("objIndex",objIndex);
        if (objIndex === -1) {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoPostsFound
          );
        } else {
          let likesArray = postArray[objIndex].likesBy;
          console.log("likesArray", likesArray);

          let index = likesArray.findIndex(
            (array) => array.userName == details.dislikeFrom
          );
          if (index != -1) {
            likesArray.splice(index, 1);
            //  console.log("likesArray",likesArray);
            postArray[objIndex].likesBy = likesArray;
            postArray[objIndex].likesCount = postArray[objIndex].likesCount - 1;
            // console.log("postArray", postArray)
            let updateObj = {};

            updateObj.posts = postArray;
            let updateFriendsProfile = await dao.updateProfile(
              friendQuery,
              updateObj
            );
            // console.log("updateFriendsProfile",updateFriendsProfile);
            if (updateFriendsProfile) {
              return mapper.responseMapping(
                userConstant.CODE.Success,
                userConstant.MESSAGE.Success
              );
            } else {
              return mapper.responseMapping(
                userConstant.CODE.INTRNLSRVR,
                userConstant.MESSAGE.internalServerError
              );
            }
          } else {
            return mapper.responseMapping(
              userConstant.CODE.DataNotFound,
              userConstant.MESSAGE.NoLikeFound
            );
          }
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.DATANOTFOUND
      );
    }
  }
}

async function addComment(details, id) {
  if (
    !details ||
    Object.keys(details).length == 0 ||
    !details.from ||
    !details.to ||
    !id ||
    !ObjectId.isValid(id)
  ) {
    return mapper.responseMapping(
      userConstant.CODE.BadRequest,
      userConstant.MESSAGE.InvalidDetails
    );
  } else {
    let userQuery = {
      userName: details.from,
      role: constants.USER_TYPE.USER,
      _id: id,
    };
    let userDeatils = await dao.getUserDetails(userQuery);
    // console.log("userDetails" ,userDeatils)
    if (userDeatils) {
      let friendQuery = {
        userName: details.to,
        role: constants.USER_TYPE.USER,
      };
      let friendsDeatils = await dao.getUserDetails(friendQuery);
      // console.log("friendsDeatils",friendsDeatils);
      if (friendsDeatils) {
        let postArray = friendsDeatils.posts;

        let objIndex = postArray.findIndex(
          (array) => array._id == details.post_id
        );
        console.log("objIndex", objIndex);
        if (objIndex === -1) {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoPostsFound
          );
        } else {
          let commentsArray = postArray[objIndex].comments;

          commentsArray.push({
            userName: details.from,
            description: details.description,
            createdAt: Date.now(),
          });
          // console.log("commentsArray", commentsArray);
          //
          postArray[objIndex].comments = commentsArray;
          // console.log("postArray", postArray);

          let updateObj = {};

          updateObj.posts = postArray;
          // console.log("updateObj", updateObj);
          let updateFriendsProfile = await dao.updateProfile(
            friendQuery,
            updateObj
          );
          // console.log("updateFriendsProfile", updateFriendsProfile.posts);
          if (updateFriendsProfile) {
            return mapper.responseMapping(
              userConstant.CODE.Success,
              userConstant.MESSAGE.Success
            );
          } else {
            return mapper.responseMapping(
              userConstant.CODE.INTRNLSRVR,
              userConstant.MESSAGE.internalServerError
            );
          }
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.DATANOTFOUND
      );
    }
  }
}

async function getAllRequests(key, skip, limit, id) {
  try {
    if (id && ObjectId.isValid(id)) {
      let query = {
        _id: id,
        role: constants.USER_TYPE.USER,
      };
      let user = await dao.getUserDetails(query);
      console.log(user);
      if (user) {
        let aggregateQuery = [{ $sort: { userName: 1 } }];
        aggregateQuery.push({ $match: { role: constants.USER_TYPE.USER } });

        console.log(id);
        aggregateQuery.push(
          {
            // $match: {_id: ObjectId(queryParams.id)},
            $match: {
              _id: ObjectId(id),
            },
          },
          {
            $unwind: "$requests",
          },
          {
            $lookup: {
              from: "users",
              localField: "requests._id",
              foreignField: "_id",
              as: "requestsInfo",
            },
          },
          {
            $unwind: "$requestsInfo",
          }
        );
        if (key && key !== "") {
          aggregateQuery.push({
            $match: {
              $or: [
                { "requestsInfo.userName": { $regex: key } },
                // { "friendsInfo.gender": { $regex: key } },
                // { "friendsInfo.email": { $regex: key } },
              ],
            },
          });
        }
        aggregateQuery.push(
          { $skip: skip ? parseInt(skip) : 0 },
          { $limit: limit ? parseInt(limit) : 10 }
        );
        aggregateQuery.push({
          $project: {
            "requestsInfo._id": 1,
            "requestsInfo.userName": 1,
            "requestsInfo.email": 1,
            "requestsInfo.gender": 1,
            "requestsInfo.posts": 1,
            // "requestsInfo.status": 1,
            "requestsInfo.dob": 1,
            "requestsInfo.friends": 1,
            "requestsInfo.requests": 1,
            "requestsInfo.profilePhoto": 1,
          },
        });
        const aggregatedResult = await dao.getAllUserDetailsByQuery(
          aggregateQuery
        );
        console.log(aggregatedResult);

        if (aggregatedResult.length > 0) {
          let total = aggregatedResult.length;

          let responseObj = {
            totalRecords: total,
            records: aggregatedResult,
          };
          return mapper.responseMappingWithData(
            userConstant.CODE.Success,
            userConstant.MESSAGE.Success,
            responseObj
          );
        } else {
          let total = aggregatedResult.length;

          let responseObj = {
            totalRecords: total,
            records: aggregatedResult,
            message: "Records not found",
          };
          return mapper.responseMappingWithData(
            userConstant.CODE.Success,
            userConstant.MESSAGE.Success,
            responseObj
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.InvalidDetails
      );
    }
  } catch (error) {
    console.log(error);
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function uploadProfilePic(req) {
  let details = req.body;
  let { id } = req.params;
  if (
    !details ||
    Object.keys(details).length == 0 ||
    !details.userName ||
    !id ||
    !ObjectId.isValid(id)
  ) {
    return mapper.responseMapping(
      userConstant.CODE.BadRequest,
      userConstant.MESSAGE.InvalidDetails
    );
  } else {
    let query = {
      userName: details.userName,
      role: constants.USER_TYPE.USER,
      _id: id,
    };
    const userDetails = await dao.getUserDetails(query);
    if (userDetails) {
      let file = req.file;
      console.log("file", file);
      const result = await appUtils.uploadImage(file);
      // console.log("result",result)
      if (result && result.url) {
        let updateQuery = {
          _id: userDetails._id,
          userName: details.userName,
          // role:constants.USER_TYPE.USER
        };
        let updateObj = {
          profilePhoto: result.url,
        };
        let updateProfile = await dao.updateProfile(updateQuery, updateObj);
        // console.log("updateProfile",updateProfile)
        if (updateProfile) {
          let resObj = {
            profilePhoto: updateProfile.profilePhoto,
          };
          return mapper.responseMappingWithData(
            userConstant.CODE.Success,
            userConstant.MESSAGE.Success,
            resObj
          );
        } else {
          return mapper.responseMapping(
            userConstant.CODE.INTRNLSRVR,
            userConstant.MESSAGE.internalServerError
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.INTRNLSRVR,
          userConstant.MESSAGE.internalServerError
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.NoUserFound
      );
    }
  }
}

async function replyToComment(details, id) {
  try {
    if (
      !details ||
      !details.userName ||
      Object.keys(details).length == 0 ||
      !id ||
      !ObjectId.isValid(id)
    ) {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.InvalidDetails
      );
    } else {
      let userQuery = {
        userName: details.userName,
        role: constants.USER_TYPE.USER,
        //userName of that person : in who's post the another user are commenting
      };
      let userDetails = await dao.getUserDetails(userQuery);
      // console.log("userDetails" , userDetails)
      if (userDetails) {
        let fromUserQuery = {
          userName: details.from,
          role: constants.USER_TYPE.USER,
        };
        let fromUserDetails = await dao.getUserDetails(fromUserQuery);
        // console.log("fromUserDetails" , fromUserDetails);
        if (fromUserDetails) {
          let postsArray = userDetails.posts;
          console.log("postsArray", postsArray);
          let index = userDetails.posts.findIndex(
            (post) => post._id == details.post_id
          );
          console.log("index", index);
          if (index === -1) {
            return mapper.responseMapping(
              userConstant.CODE.DataNotFound,
              userConstant.MESSAGE.NoPostsFound
            );
          } else {
            console.log(userDetails.posts[index].comments);

            let commentsArray = userDetails.posts[index].comments;
            let commentIndex = commentsArray.findIndex(
              (comment) => comment._id == details.comment_id
            );
            console.log(commentIndex);
            if (commentIndex === -1) {
              return mapper.responseMapping(
                userConstant.CODE.DataNotFound,
                userConstant.MESSAGE.NoCommentFound
              );
            } else {
              postsArray[index].comments[commentIndex].commentReplies.push({
                from: details.from,
                to: details.to,
                createdAt: Date.now(),
                reply: details.reply,
              });

              let updateObj = {};
              updateObj.posts = postsArray;

              let updatedReply = await dao.updateProfile(userQuery, updateObj);
              if (updatedReply) {
                return mapper.responseMapping(
                  userConstant.CODE.Success,
                  userConstant.MESSAGE.Success
                );
              } else {
                return mapper.responseMapping(
                  userConstant.CODE.INTRNLSRVR,
                  userConstant.MESSAGE.internalServerError
                );
              }
            }
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoUserFound
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    }
  } catch (error) {
    console.log("err", error);
  }
}

async function getOneUser(id, selectedId) {
  try {
    let query = {};
    if (selectedId) {
      query._id = selectedId;
    } else {
      query._id = id;
    }

    let user = await dao.getUserDetails(query);

    if (user) {
      let filteredUserResponseFields = mapper.filteredUserResponseFields(user);
      return mapper.responseMappingWithData(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success,
        filteredUserResponseFields
      );
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.NoUserFound
      );
    }
  } catch (error) {
    console.log(error);
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function getAllPosts(skip, limit, id) {
  try {
    if (id && ObjectId.isValid(id)) {
      let query = {
        _id: id,
        role: constants.USER_TYPE.USER,
      };
      let user = await dao.getUserDetails(query);
      console.log(user);

      if (user) {
        let aggregateQuery = [{ $sort: { userName: 1 } }];
        aggregateQuery.push({ $match: { role: constants.USER_TYPE.USER } });

        console.log(id);
        aggregateQuery.push(
          {
            $match: {
              _id: ObjectId(id),
            },
          },
          {
            $unwind: "$posts",
          },
          {
            $sort: { "posts.createdAt": -1 },
          },
          {
            $project: {
              posts: 1,
            },
          }
        );

        aggregateQuery.push(
          { $skip: skip ? parseInt(skip) : 0 },
          { $limit: limit ? parseInt(limit) : 10 }
        );

        const aggregatedResult = await dao.getAllUserDetailsByQuery(
          aggregateQuery
        );
        console.log(aggregatedResult);

        if (aggregatedResult.length > 0) {
          let total = aggregatedResult.length;

          let responseObj = {
            totalRecords: total,
            records: aggregatedResult,
          };
          return mapper.responseMappingWithData(
            userConstant.CODE.Success,
            userConstant.MESSAGE.Success,
            responseObj
          );
        } else {
          let total = aggregatedResult.length;

          let responseObj = {
            totalRecords: total,
            records: aggregatedResult,
            message: "Records not found",
          };
          return mapper.responseMappingWithData(
            userConstant.CODE.Success,
            userConstant.MESSAGE.Success,
            responseObj
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.InvalidDetails
      );
    }
  } catch (error) {
    console.log(error);
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function deleteOnePost(id, post_id) {
  try {
    let query = {
      _id: id,
      role: constants.USER_TYPE.USER,
    };
    let userDetails = await dao.getUserDetails(query);
    // console.log(userDetails);
    if (userDetails) {
      let index = userDetails.posts.findIndex((array) => array._id == post_id);
      if (index != -1) {
        // console.log("innnnnnnnnnnnnnnnnnnnnnnnn")
        userDetails.posts.splice(index, 1);

        // // console.log("postArray", postArray)
        let updateObj = {};

        updateObj.posts = userDetails.posts;
        console.log(" userDetails.posts", updateObj);
        let updateFriendsProfile = await dao.updateProfile(query, updateObj);
        if (updateFriendsProfile) {
          return mapper.responseMapping(
            userConstant.CODE.Success,
            userConstant.MESSAGE.Success
          );
        } else {
          return mapper.responseMapping(
            userConstant.CODE.INTRNLSRVR,
            userConstant.MESSAGE.internalServerError
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoPostsFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.NoUserFound
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function getAllUsers(request) {
  try {
    const aggregateQuery = [{ $sort: { userName: 1 } }];
    aggregateQuery.push({
      $match: {
        $and: [
          { role: constants.USER_TYPE.USER },
          { status: constants.STATUS.ACTIVE },
        ],
      },
    });
    aggregateQuery.push({
      $project: {
        userName: 1,
        email: 1,
        _id: 1,
        profilePhoto: 1,
      },
    });
    if (request.key) {
      aggregateQuery.push({
        $match: {
          $or: [{ userName: { $regex: request.key } }],
        },
      });
    }
    aggregateQuery.push(
      { $skip: request.skip ? parseInt(request.skip) : 0 },
      { $limit: request.limit ? parseInt(request.limit) : 100000 }
    );

    const aggregatedResult = await dao.getAllUserDetailsByQuery(aggregateQuery);
    console.log(aggregatedResult);

    if (aggregatedResult.length > 0) {
      let total = aggregatedResult.length;

      let responseObj = {
        totalRecords: total,
        records: aggregatedResult,
      };
      return mapper.responseMappingWithData(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success,
        responseObj
      );
    } else {
      let total = aggregatedResult.length;

      let responseObj = {
        totalRecords: total,
        records: aggregatedResult,
        message: "Records not found",
      };
      return mapper.responseMappingWithData(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success,
        responseObj
      );
    }
  } catch (error) {}
}

async function getFriendPosts(id, skip, limit) {
  try {
    let aggregateQuery = [{ $sort: { userName: 1 } }];
    aggregateQuery.push({ $match: { role: constants.USER_TYPE.USER } });

    if (id) {
      console.log("indide else.........", id);
      aggregateQuery.push(
        {
          $match: {
            _id: ObjectId(id),
          },
        },
        {
          $unwind: "$friends",
        },
        {
          $lookup: {
            from: "users",
            localField: "friends._id",
            foreignField: "_id",
            as: "friendsInfo",
          },
        },
        {
          $unwind: "$friendsInfo",
        },
        {
          $unwind: "$friendsInfo.posts",
        },

        { $sort: { "friendsInfo.posts.createdAt": -1 } }
      );

      aggregateQuery.push({
        $project: {
          "friendsInfo._id": 1,
          "friendsInfo.userName": 1,
          "friendsInfo.posts": 1,
          "friendsInfo.profilePhoto": 1,
        },
      });
      aggregateQuery.push(
        { $skip: skip ? parseInt(skip) : 0 },
        { $limit: limit ? parseInt(limit) : 3 }
      );
      const aggregatedResult = await dao.getAllUserDetailsByQuery(
        aggregateQuery
      );
      console.log(aggregatedResult);

      if (aggregatedResult.length > 0) {
        let friendPostDeatils = aggregatedResult.map((array) => {
          return array.friendsInfo;
        });
        let total = friendPostDeatils.length;
        let responseObj = {
          totalRecords: total,
          records: friendPostDeatils,
        };
        return mapper.responseMappingWithData(
          userConstant.CODE.Success,
          userConstant.MESSAGE.Success,
          responseObj
        );
      } else {
        let total = aggregatedResult.length;

        let responseObj = {
          totalRecords: total,
          records: aggregatedResult,
          message: "Records not found",
        };
        return mapper.responseMappingWithData(
          userConstant.CODE.Success,
          userConstant.MESSAGE.Success,
          responseObj
        );
      }
    }
  } catch (error) {
    console.log(error);
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function selectedUser(details) {
  try {
    let query = {
      role: constants.USER_TYPE.USER,
      _id: details.userId,
    };
    const userDetails = await dao.getUserDetails(query);
    console.log(userDetails.friends);
    if (userDetails) {
      let filteredArray = userDetails.friends.filter(
        (array) => array._id == details.selectedId
      );
      // console.log("filteredArray",filteredArray);
      if (details.selectedId == details.userId) {
        let resObj = {
          user_id: details.selectedId,
          self: true,
        };
        return mapper.responseMappingWithData(
          userConstant.CODE.Success,
          userConstant.MESSAGE.Success,
          resObj
        );
      } else if (filteredArray.length > 0) {
        let resObj = {
          friend_id: details.selectedId,
          friend: true,
        };
        return mapper.responseMappingWithData(
          userConstant.CODE.Success,
          userConstant.MESSAGE.Success,
          resObj
        );
      } else {
        let resObj = {
          other_id: details.selectedId,
          other: true,
        };
        return mapper.responseMappingWithData(
          userConstant.CODE.Success,
          userConstant.MESSAGE.Success,
          resObj
        );
      }
    }
  } catch (error) {}
}

async function unfriendUser(details) {
  try {
    if (details.removedBy != details.to) {
      let userQuery = {
        _id: details.removedBy,
        status: constants.STATUS.ACTIVE,
        role: constants.USER_TYPE.USER,
      };
      const userDetails = await dao.getUserDetails(userQuery);
      console.log("userDetails", userDetails);
      if (userDetails) {
        let friendQuery = {
          _id: details.to,
          status: constants.STATUS.ACTIVE,
          role: constants.USER_TYPE.USER,
        };
        const friendsDetails = await dao.getUserDetails(friendQuery);

        if (friendsDetails) {
          let index = userDetails.friends.findIndex(
            (array) => array._id == details.to
          );
          console.log(index);
          console.log(userDetails.friends);
          if (index != -1) {
            let idx = friendsDetails.friends.findIndex(
              (array) => array._id == details.removedBy
            );
            if (idx != -1) {
              userDetails.friends.splice(index, 1);
              friendsDetails.friends.splice(idx, 1);

              let updateObj = {
                friends: userDetails.friends,
              };
              let frndObj = {
                friends: friendsDetails.friends,
              };
              const updateFriends = await dao.updateProfile(
                userQuery,
                updateObj
              );
              const updateFriendOfTo = await dao.updateProfile(
                friendQuery,
                frndObj
              );

              if (updateFriends && updateFriendOfTo) {
                return mapper.responseMapping(
                  userConstant.CODE.Success,
                  userConstant.MESSAGE.Success
                );
              } else {
                return mapper.responseMapping(
                  userConstant.CODE.INTRNLSRVR,
                  userConstant.MESSAGE.internalServerError
                );
              }
            } else {
              return mapper.responseMapping(
                userConstant.CODE.DataNotFound,
                userConstant.MESSAGE.CanNotRemoveFriend
              );
            }
          } else {
            return mapper.responseMapping(
              userConstant.CODE.DataNotFound,
              userConstant.MESSAGE.CanNotRemoveFriend
            );
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoUserFound
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.selfRemovalNotAllowed
      );
    }
  } catch (error) {
    console.log("err", error);
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function rejectFriendRequest(details) {
  try {
    if (details.rejectorId != details.reqMakerId) {
      let userQuery = {
        _id: details.rejectorId,
        status: constants.STATUS.ACTIVE,
        role: constants.USER_TYPE.USER,
      };
      const userDetails = await dao.getUserDetails(userQuery);
      console.log("userDetails", userDetails);
      if (userDetails) {
        let friendQuery = {
          _id: details.reqMakerId,
          status: constants.STATUS.ACTIVE,
          role: constants.USER_TYPE.USER,
        };
        const friendsDetails = await dao.getUserDetails(friendQuery);

        if (friendsDetails) {
          let userRequestsArray = userDetails.requests;

          if (userRequestsArray.length > 0) {
            for (let i = 0; i < userRequestsArray.length; i++) {
              // console.log(userRequestsArray[i]._id)

              if (userRequestsArray[i]._id == details.reqMakerId) {
                console.log(
                  "inside iffffffffffffffffffffffffffffffffffffffffffff"
                );
                userRequestsArray.splice(i, 1);
              }
            }

            // console.log(userRequestsArray ,userFriendsArray);
            // return false;
            let userUpdateObj = {
              requests: userRequestsArray,
            };

            const updateListOfUsersFriend = await dao.updateProfile(
              userQuery,
              userUpdateObj
            );

            if (updateListOfUsersFriend) {
              return mapper.responseMapping(
                userConstant.CODE.Success,
                userConstant.MESSAGE.Success
              );
            } else {
              return mapper.responseMapping(
                userConstant.CODE.INTRNLSRVR,
                userConstant.MESSAGE.internalServerError
              );
            }
          } else {
            return mapper.responseMapping(
              userConstant.CODE.DataNotFound,
              userConstant.MESSAGE.NoRequestFound
            );
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoUserFound
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.selfRemovalNotAllowed
      );
    }
  } catch (error) {
    console.log("err", error);
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function getAllComments(skip, limit, postId, postBy) {
  try {
    let aggregateQuery = [{ $sort: { userName: 1 } }];
    aggregateQuery.push({ $match: { role: constants.USER_TYPE.USER } });

    aggregateQuery.push(
      {
        $match: {
          _id: ObjectId(postBy),
        },
      },
      {
        $unwind: "$posts",
      },
      {
        $match: {
          "posts._id": ObjectId(postId),
        },
      },
      {
        $unwind: "$posts.comments",
      },
      {
        $sort: { "posts.comments.createdAt": -1 },
      },
      {
        $project: {
          posts: 1,
          userName: 1,
        },
      }
    );

    aggregateQuery.push(
      { $skip: skip ? parseInt(skip) : 0 },
      { $limit: limit ? parseInt(limit) : 10 }
    );

    const aggregatedResult = await dao.getAllUserDetailsByQuery(aggregateQuery);

    // let aggregatedResult = aggregated.map((array) => {
    //   return array;
    // });

    if (aggregatedResult.length > 0) {
      let total = aggregatedResult.length;

      let responseObj = {
        totalRecords: total,
        records: aggregatedResult,
      };
      return mapper.responseMappingWithData(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success,
        responseObj
      );
    } else {
      let total = aggregatedResult.length;

      let responseObj = {
        totalRecords: total,
        records: aggregatedResult,
        message: "Records not found",
      };
      return mapper.responseMappingWithData(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success,
        responseObj
      );
    }
  } catch (error) {
    console.log(error);
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function cancelFriendRequest(userId, friendId) {
  try {
    if (userId != friendId) {
      let query = {
        _id: userId,
        role: constants.USER_TYPE.USER,
        status: constants.STATUS.ACTIVE,
      };
      let userDetails = await dao.getUserDetails(query);

      if (userDetails) {
        let friendQuery = {
          _id: friendId,
          role: constants.USER_TYPE.USER,
          status: constants.STATUS.ACTIVE,
        };
        let friendsDeatils = await dao.getUserDetails(friendQuery);
        if (friendsDeatils) {
          let friendRequests = friendsDeatils.requests;
          // let friendOfFriends = friendsDeatils.friends;
          console.log("friendsDeatils", friendRequests);

          let objIndex = friendRequests.findIndex(
            (array) => array._id == userId
          );
          console.log("objIndex", objIndex);
          // let index = friendOfFriends.findIndex((array) => array._id == userId);

          if (objIndex !== -1) {
            friendRequests.splice(objIndex, 1);
            let updateQuery = {
              _id: friendId,
            };
            let updateObj = {
              requests: friendRequests,
            };
            let updateAddFriendList = await dao.updateProfile(
              updateQuery,
              updateObj
            );
            if (updateAddFriendList) {
              return mapper.responseMapping(
                userConstant.CODE.Success,
                userConstant.MESSAGE.Success
              );
            } else {
              return mapper.responseMapping(
                userConstant.CODE.INTRNLSRVR,
                userConstant.MESSAGE.internalServerError
              );
            }
          } else {
            return mapper.responseMapping(
              userConstant.CODE.DataNotFound,
              userConstant.MESSAGE.NoRequestFound
            );
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoUserFound
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      // console.log("can not request yourself");
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.selfRemovalNotAllowed
      );
    }
  } catch {
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function deleteOneComment(id, postBy, postId, commentId) {
  try {
    let query = {
      _id: id,
      role: constants.USER_TYPE.USER,
    };
    let userDetails = await dao.getUserDetails(query);
    if (userDetails) {
      let posterQuery = {
        userName: postBy,
        role: constants.USER_TYPE.USER,
      };
      let postersDetails = await dao.getUserDetails(posterQuery);
      if (postersDetails) {
        let postsArray = postersDetails.posts;

        let index = postsArray.findIndex((array) => {
          return array._id == postId;
        });

        if (index !== -1) {
          let commentsArray = postsArray[index].comments;
          let commentIndex = commentsArray.findIndex((array) => {
            return array._id == commentId;
          });
          // console.log("comment", commentIndex)
          console.log(
            "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
            commentsArray.length
          );
          if (commentIndex !== -1) {
            // console.log("................",)
            if (commentsArray[commentIndex].userName === userDetails.userName) {
              commentsArray.splice(commentIndex, 1);
              postsArray[index].comments = commentsArray;
              // console.log("postArray", postArray);

              let updateObj = {};

              updateObj.posts = postsArray;
              // console.log("updateObj", updateObj);
              let updatepostersProfile = await dao.updateProfile(
                posterQuery,
                updateObj
              );
              if (updatepostersProfile) {
                return mapper.responseMapping(
                  userConstant.CODE.Success,
                  userConstant.MESSAGE.Success
                );
              } else {
                return mapper.responseMapping(
                  userConstant.CODE.INTRNLSRVR,
                  userConstant.MESSAGE.internalServerError
                );
              }
            } else {
              return mapper.responseMapping(
                userConstant.CODE.BadRequest,
                userConstant.MESSAGE.notAllowed
              );
            }
          } else {
            return mapper.responseMapping(
              userConstant.CODE.DataNotFound,
              userConstant.MESSAGE.NoCommentFound
            );
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoPostsFound
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.NoUserFound
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function deleteReplyToComment(details) {
  try {
    if (!details || !details.postBy || Object.keys(details).length == 0) {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.InvalidDetails
      );
    } else {
      let userQuery = {
        userName: details.postBy,
        role: constants.USER_TYPE.USER,
      };
      let userDetails = await dao.getUserDetails(userQuery);
      // console.log("userDetails" , userDetails)
      if (userDetails) {
        let fromUserQuery = {
          userName: details.from,
          role: constants.USER_TYPE.USER,
        };
        let fromUserDetails = await dao.getUserDetails(fromUserQuery);
        // console.log("fromUserDetails" , fromUserDetails);
        if (fromUserDetails) {
          let postsArray = userDetails.posts;
          console.log("postsArray", postsArray);
          let index = userDetails.posts.findIndex(
            (post) => post._id == details.post_id
          );
          console.log("index", index);
          if (index === -1) {
            return mapper.responseMapping(
              userConstant.CODE.DataNotFound,
              userConstant.MESSAGE.NoPostsFound
            );
          } else {
            console.log(userDetails.posts[index].comments);

            let commentsArray = userDetails.posts[index].comments;
            let commentIndex = commentsArray.findIndex(
              (comment) => comment._id == details.comment_id
            );
            console.log(commentIndex);
            if (commentIndex === -1) {
              return mapper.responseMapping(
                userConstant.CODE.DataNotFound,
                userConstant.MESSAGE.NoCommentFound
              );
            } else {
              let commentReplyArray =
                userDetails.posts[index].comments[commentIndex].commentReplies;
              let commentReplyIndex = commentReplyArray.findIndex(
                (commentReply) => commentReply._id == details.commentReply_id
              );
              if (commentReplyIndex === -1) {
                return mapper.responseMapping(
                  userConstant.CODE.DataNotFound,
                  userConstant.MESSAGE.NoCommentReplyFound
                );
              } else {
                if (
                  commentReplyArray[commentReplyIndex].from === details.from
                ) {
                  postsArray[index].comments[
                    commentIndex
                  ].commentReplies.splice(commentReplyIndex, 1);

                  let updateObj = {};
                  updateObj.posts = postsArray;

                  let updatedReply = await dao.updateProfile(
                    userQuery,
                    updateObj
                  );
                  if (updatedReply) {
                    return mapper.responseMapping(
                      userConstant.CODE.Success,
                      userConstant.MESSAGE.Success
                    );
                  } else {
                    return mapper.responseMapping(
                      userConstant.CODE.INTRNLSRVR,
                      userConstant.MESSAGE.internalServerError
                    );
                  }
                } else {
                  return mapper.responseMapping(
                    userConstant.CODE.BadRequest,
                    userConstant.MESSAGE.notAllowed
                  );
                }
              }
            }
          }
        } else {
          return mapper.responseMapping(
            userConstant.CODE.DataNotFound,
            userConstant.MESSAGE.NoUserFound
          );
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.DataNotFound,
          userConstant.MESSAGE.NoUserFound
        );
      }
    }
  } catch (error) {
    console.log("err", error);
  }
}

async function newConversation(senderId, receiverId) {
  try {
    if (!senderId || !receiverId) {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.InvalidDetails
      );
    } else {
      if (senderId !== receiverId) {
        let details = {
          members: [senderId, receiverId],
        };
        const findConversation = await dao.getConversationDetails(details);
        console.log("findConversation", findConversation);
        if (findConversation) {
          return mapper.responseMappingWithData(
            userConstant.CODE.Success,
            userConstant.MESSAGE.Success,
            findConversation
          );
        } else {
          let recheckQuery = { members: [receiverId, senderId] };
          const refindConversation = await dao.getConversationDetails(
            recheckQuery
          );
          console.log("refindConversation", refindConversation);
          if (refindConversation) {
            return mapper.responseMappingWithData(
              userConstant.CODE.Success,
              userConstant.MESSAGE.Success,
              refindConversation
            );
          } else {
            const conversationCreate = await dao.createConversation(details);
            console.log(conversationCreate);
            if (conversationCreate) {
              return mapper.responseMappingWithData(
                userConstant.CODE.Success,
                userConstant.MESSAGE.Success,
                conversationCreate
              );
            } else {
              return mapper.responseMappingWithData(
                userConstant.CODE.INTRNLSRVR,
                userConstant.MESSAGE.internalServerError,
                conversationCreate
              );
            }
          }
        }
      } else {
        return mapper.responseMapping(
          userConstant.CODE.BadRequest,
          userConstant.MESSAGE.selfChatNotAllowed
        );
      }
    }
  } catch (error) {
    console.log("err", error);
  }
}

async function getAllConversations(id) {
  try {
    let query = {
      members: { $in: [id] },
    };
    const findAllConversations = await dao.getAllConversationsDetails(query);
    if (findAllConversations) {
      return mapper.responseMappingWithData(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success,
        findAllConversations
      );
    }
  } catch (error) {
    console.log("err", error);
  }
}

async function newMessage(sender, text, conversationId) {
  try {
    console.log(sender, text, conversationId);
    if (!sender || !text || !conversationId) {
      return mapper.responseMapping(
        userConstant.CODE.BadRequest,
        userConstant.MESSAGE.InvalidDetails
      );
    } else {
      let details = {
        sender,
        text,
        conversationId,
      };
      const messageCreate = await dao.createMessage(details);
      console.log(messageCreate);
      if (messageCreate) {
        let query = { _id: ObjectId(conversationId) };
        let updatedObj = { updatedAt: Date.now() };
        const getUpdatedConversation = await dao.updateConversation(
          query,
          updatedObj
        );
        return mapper.responseMappingWithData(
          userConstant.CODE.Success,
          userConstant.MESSAGE.Success,
          messageCreate
        );
      } else {
        return mapper.responseMappingWithData(
          userConstant.CODE.INTRNLSRVR,
          userConstant.MESSAGE.internalServerError,
          messageCreate
        );
      }
    }
  } catch (error) {
    console.log("err", error);
  }
}

async function getAllMessages(conversationId) {
  try {
    let query = {
      conversationId: conversationId,
    };
    const findAllMessages = await dao.getAllMessagesDetails(query);
    if (findAllMessages) {
      return mapper.responseMappingWithData(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success,
        findAllMessages
      );
    }
  } catch (error) {
    console.log("err", error);
  }
}

async function deleteChatUser(conversationId) {
  try {
    let query = {
      _id: conversationId,
    };
    const conversationDeatils = await dao.getConversationDetails(query);

    if (conversationDeatils) {
      let deletequery = {
        _id: ObjectId(conversationId),
      };

      let deleteMessagesQuery = {
        conversationId: conversationId,
      };
      console.log("deletequery", conversationDeatils);
      const data = await dao.deleteConversation(deletequery);
      const data2 = await dao.deleteMessages(deleteMessagesQuery);
      console.log("data", data);
      return mapper.responseMapping(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success
      );
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.NoUserFound
      );
    }
  } catch (error) {
    console.log("error", error);

    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

async function deletesinglemessage(messageId) {
  try {
    let query = {
      _id: ObjectId(messageId),
    };
    const getSingleMessage = await dao.getSingleMessage(query);
    if (getSingleMessage) {
      const data = await dao.deleteMessages(getSingleMessage);
      return mapper.responseMapping(
        userConstant.CODE.Success,
        userConstant.MESSAGE.Success
      );
    } else {
      return mapper.responseMapping(
        userConstant.CODE.DataNotFound,
        userConstant.MESSAGE.NoUserFound
      );
    }
  } catch (error) {
    console.log("error", error);

    return mapper.responseMapping(
      userConstant.CODE.INTRNLSRVR,
      userConstant.MESSAGE.internalServerError
    );
  }
}

module.exports = {
  registerUser,
  sendCode,
  verifySecurityCode,
  login,
  setNewPassword,
  sendRequest,
  forgotPassword,
  acceptFriendRequest,
  changePassword,
  twoFactorAuthToggle,
  addFeeds,
  addLike,
  addComment,
  getAllRequests,
  uploadProfilePic,
  replyToComment,
  getOneUser,
  dislikePost,
  getAllPosts,
  deleteOnePost,
  getUserFriends,
  getAllUsers,
  getAllSuggetions,
  getFriendPosts,
  selectedUser,
  unfriendUser,
  rejectFriendRequest,
  getAllComments,
  cancelFriendRequest,
  deleteOneComment,
  deleteReplyToComment,
  newConversation,
  getAllConversations,
  newMessage,
  getAllMessages,
  deleteChatUser,
  deletesinglemessage,
};
