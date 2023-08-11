const dao = require("./adminDao");
const userDao = require("../user/userDao");
const adminConst = require("./adminConstants");
const mapper = require("./adminMapper");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../../models/userModel");
const constants = require("../../constants");
const appUtils = require("../../appUtils");
const mailHandler = require("../../middleware/email");
const jwtHandler = require("../../middleware/jwtHandler");
const { query } = require("express");

async function createTemplate(id, templateDetails) {
  try {
    if (
      !id ||
      !ObjectId.isValid(id) ||
      !templateDetails ||
      Object.keys(templateDetails).length == 0
    ) {
      return mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      );
    } else {
      let adminQuery = {
        _id: id,
      };
      const adminDetails = await dao.getAdminDetails(adminQuery);
      if (adminDetails) {
        let mailQuery = {
          mailName: templateDetails.mailName,
        };
        let templateExists = await dao.getTemplateDetails(mailQuery);
        if (templateExists) {
          return mapper.responseMapping(
            adminConst.CODE.BadRequest,
            adminConst.MESSAGE.TemplateAlreadyExists
          );
        } else {
          let filterAllowedTemplateFields =
            mapper.filterAllowedTemplateFields(templateDetails);
          filterAllowedTemplateFields.createdBy = id;
          filterAllowedTemplateFields.createdAt = new Date().getTime();

          const templateCreated = await dao.createTemplate(
            filterAllowedTemplateFields
          );
          if (templateCreated) {
            let allowedTemplateFields = mapper.filterAllowedTemplateFields({
              ...templateDetails,
              _id: id,
            });
            return mapper.responseMappingWithData(
              adminConst.CODE.Success,
              adminConst.MESSAGE.TemplateCreatedSuccess,
              allowedTemplateFields
            );
          } else {
            return mapper.responseMapping(
              adminConst.CODE.INTRNLSRVR,
              adminConst.MESSAGE.internalServerError
            );
          }
        }
      } else {
        return mapper.responseMapping(
          adminConst.CODE.DataNotFound,
          adminConst.MESSAGE.InvalidCredentials
        );
      }
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

async function sendCode(details) {
  try {
    if (!details || Object.keys(details).length == 0) {
      return mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      );
    } else {
      let query = {};
      if (details.email) {
        query.email = details.email.toLowerCase();
      }
      const userDetails = await dao.getAdminDetails(query);
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
                email: userDetails.email,
                userName: userDetails.userName,
                verificationCode: verificationCode,
              };
              mailHandler.SEND_MAIL(mailUserDetails, templateDetails);
            }
          }
          const updatedUser = await dao.updateProfile(query, updateObj);
          try {
            if (updatedUser) {
              if (details.email) {
                if (details.resendOTP && details.resendOTP === true) {
                  return mapper.responseMapping(
                    adminConst.CODE.Success,
                    adminConst.MESSAGE.ResendVerificationOTPsendSuccess
                  );
                } else {
                  return mapper.responseMappingWithData(
                    adminConst.CODE.Success,
                    adminConst.MESSAGE.VerificationOTPsendSuccess,
                    details._id
                  );
                }
              }
            } else {
              return mapper.responseMapping(
                adminConst.CODE.INTRNLSRVR,
                adminConst.MESSAGE.internalServerError
              );
            }
          } catch (error) {
            return mapper.responseMapping(
              adminConst.CODE.INTRNLSRVR,
              adminConst.MESSAGE.internalServerError
            );
          }
        } else {
          return mapper.responseMapping(
            adminConst.CODE.DataNotFound,
            adminConst.MESSAGE.InvalidCredentials
          );
        }
      } catch (error) {
        return mapper.responseMapping(
          adminConst.CODE.INTRNLSRVR,
          adminConst.MESSAGE.internalServerError
        );
      }
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

async function login(details) {
  try {
    if (!details || Object.keys(details).length == 0) {
      return mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      );
    } else {
      let query = { role: details.role };
      let match = appUtils.isValidEmail(details.email);
      if (match == true) {
        query.email = details.email;
      }
      if (match == false) {
        query.userName = details.email;
      }
      const userDetails = await dao.getAdminDetails(query);

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
              const result = await sendCode(userDetails);
              return result;
            } else {
              let updatedObj = {
                loginActivity: prevLoginActivities,
              };
              const updatedUser = await dao.updateProfile(query, updatedObj);
              try {
                if (updatedUser) {
                  let filteredUserResponseFields =
                    mapper.filteredUserResponseFields(updatedUser);
                  let adminObj = {
                    _id: updatedUser._id,
                    email: updatedUser.email.toLowerCase(),
                  };
                  const tokenResults = await Promise.all([
                    jwtHandler.genAdminToken(adminObj),
                  ]);
                  let token = tokenResults[0];
                  filteredUserResponseFields.token = token;
                  return mapper.responseMappingWithData(
                    adminConst.CODE.Success,
                    adminConst.MESSAGE.LoginSuccess,
                    filteredUserResponseFields
                  );
                } else {
                  return mapper.responseMapping(
                    adminConst.CODE.INTRNLSRVR,
                    adminConst.MESSAGE.internalServerError
                  );
                }
              } catch (error) {
                return mapper.responseMapping(
                  adminConst.CODE.INTRNLSRVR,
                  adminConst.MESSAGE.internalServerError
                );
              }
            }
          } else {
            return mapper.responseMapping(
              adminConst.CODE.BadRequest,
              adminConst.MESSAGE.InvalidPassword
            );
          }
        } else {
          return mapper.responseMapping(
            adminConst.CODE.FRBDN,
            adminConst.MESSAGE.DeactivatedUser
          );
        }
      } else {
        return mapper.responseMapping(
          adminConst.CODE.DataNotFound,
          adminConst.MESSAGE.InvalidCredentials
        );
      }
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

async function verifySecurityCode(id, OTP) {
  try {
    if (!id || !ObjectId.isValid(id) || !OTP) {
      return mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      );
    } else {
      let query = {
        _id: id,
        OTP: OTP,
      };
      const userDetails = await dao.getAdminDetails(query);
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
                adminConst.CODE.Success,
                adminConst.MESSAGE.LoginSuccess,
                filteredUserResponseFields
              );
            } else {
              return mapper.responseMapping(
                adminConst.CODE.INTRNLSRVR,
                adminConst.MESSAGE.internalServerError
              );
            }
          } else {
            return mapper.responseMapping(
              adminConst.CODE.INTRNLSRVR,
              adminConst.MESSAGE.internalServerError
            );
          }
        } else {
          return mapper.responseMapping(
            adminConst.CODE.BadRequest,
            adminConst.MESSAGE.TimeOut
          );
        }
      } else {
        return mapper.responseMapping(
          adminConst.CODE.BadRequest,
          adminConst.MESSAGE.InvalidVerificationCode
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

async function updateTemplate(id, templateId, templateUpdateDetails) {
  try {
    let adminQuery = {
      _id: id,
      role: constants.USER_TYPE.ADMIN,
    };
    const adminDetails = await dao.getAdminDetails(adminQuery);
    if (adminDetails) {
      let templateQuery = {
        _id: templateId,
      };
      const templateDetails = await dao.getTemplateDetails(templateQuery);
      if (templateDetails) {
        let flterTemplateUpdateField = mapper.filterTemplateUpdateFields(
          templateUpdateDetails
        );
        flterTemplateUpdateField.editedAt = new Date();
        flterTemplateUpdateField.editedBy = id;
        const updatedTemplate = await dao.updateTemplate(
          templateQuery,
          flterTemplateUpdateField
        );
        if (updatedTemplate) {
          return mapper.responseMappingWithData(
            adminConst.CODE.Success,
            adminConst.MESSAGE.TemplateUpdated,
            updatedTemplate
          );
        } else {
          return mapper.responseMapping(
            adminConst.CODE.INTRNLSRVR,
            adminConst.MESSAGE.internalServerError
          );
        }
      } else {
        return mapper.responseMapping(
          adminConst.CODE.ReqTimeOut,
          adminConst.MESSAGE.TemplateNotFound
        );
      }
    } else {
      return mapper.responseMapping(
        adminConst.CODE.DataNotFound,
        adminConst.MESSAGE.DATANOTFOUND
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}
async function deleteTemplate(id, templateId) {
  try {
    let adminQuery = {
      _id: id,
      role: constants.USER_TYPE.ADMIN,
    };
    const adminDetails = await dao.getAdminDetails(adminQuery);
    if (adminDetails) {
      let templateQuery = {
        _id: templateId,
      };
      const templateDetails = await dao.getTemplateDetails(templateQuery);
      if (templateDetails) {
        let deletedTemplate = await dao.deleteTemplate(templateQuery);
        if (deletedTemplate) {
          return mapper.responseMapping(
            adminConst.CODE.Success,
            adminConst.MESSAGE.TemplateDeleted
          );
        } else {
          return mapper.responseMapping(
            adminConst.CODE.INTRNLSRVR,
            adminConst.MESSAGE.internalServerError
          );
        }
      } else {
        return mapper.responseMapping(
          adminConst.CODE.ReqTimeOut,
          adminConst.MESSAGE.TemplateNotFound
        );
      }
    } else {
      return mapper.responseMapping(
        adminConst.CODE.DataNotFound,
        adminConst.MESSAGE.DATANOTFOUND
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

async function getUsers(key, skip, limit) {
  try {
    const aggregateQuery = [{ $sort: { userName: 1 } }];
    aggregateQuery.push({ $match: { $or: [{ role: "user" }] } });
    if (key) {
      aggregateQuery.push({
        $match: {
          $or: [
            { userName: { $regex: key } },
            { email: { $regex: key } },
            { gender: { $regex: key } },
          ],
        },
      });
    }

    aggregateQuery.push(
      { $skip: skip ? parseInt(skip) : 0 },
      { $limit: limit ? parseInt(limit) : 10 }
    );
    const aggregatedResult = await dao.getAllUserDetailsByQuery(aggregateQuery);
    // return mapper.filterUsersDetails(aggregated);
    if (aggregatedResult.length > 0) {
      let total = aggregatedResult.length;

      let responseObj = {
        totalRecords: total,
        records: aggregatedResult,
      };
      return mapper.responseMappingWithData(
        adminConst.CODE.Success,
        adminConst.MESSAGE.Success,
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
        adminConst.CODE.Success,
        adminConst.MESSAGE.Success,
        responseObj
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

async function getOneUser(userId) {
  try {
    let query = {
      _id: userId,
    };
    let user = await dao.getUserDetails(query);
    // console.log("user",user)
    // console.log("template" , template);

    if (user) {
      let filteredDetails = mapper.filteredUserFields(user);
      return mapper.responseMappingWithData(
        adminConst.CODE.Success,
        adminConst.MESSAGE.Success,
        filteredDetails
      );
    } else {
      return mapper.responseMapping(
        adminConst.CODE.DataNotFound,
        adminConst.MESSAGE.TemplateNotFound
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

async function getAllTemplates() {
  try {
    let allTemplate = await dao.getAllTemplates();
    if (allTemplate && allTemplate.length > 0) {
      return allTemplate;
    } else {
      return mapper.responseMapping(
        adminConst.CODE.DataNotFound,
        adminConst.MESSAGE.DATANOTFOUND
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

async function getOneTemplate(templateId) {
  try {
    let templateQuery = {
      _id: templateId,
    };
    let template = await dao.getTemplateDetails(templateQuery);
    // console.log("template" , template);
    if (template) {
      return mapper.responseMappingWithData(
        adminConst.CODE.Success,
        adminConst.MESSAGE.Success,
        template
      );
    } else {
      return mapper.responseMapping(
        adminConst.CODE.DataNotFound,
        adminConst.MESSAGE.TemplateNotFound
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

async function editUser(email, details) {
  try {
    let query = {
      email: email,
    };
    let userDetails = await dao.getUserDetails(query);
    if (userDetails) {
      let updateObj = {
        status: details.status,
        role: details.role,
        isOTPVerified: details.isOTPVerified,
        userName: details.userName,
        updatedAt:new Date()
      };
      let updatedUser = await dao.updateProfile(query, updateObj);
      if (updatedUser) {
        return mapper.responseMapping(
          adminConst.CODE.INTRNLSRVR,
          adminConst.MESSAGE.Success
        );
      } else {
        return mapper.responseMapping(
          adminConst.CODE.INTRNLSRVR,
          adminConst.MESSAGE.InvalidDetails
        );
      }
    } else {
      return mapper.responseMapping(
        adminConst.CODE.INTRNLSRVR,
        adminConst.MESSAGE.DATANOTFOUND
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

async function activeOrInactive(details) {
  try {
    let query = {
      email: details.email,
    };
    
    let updateObj = {
      status: details.status,
    };
    let updatedUser = await dao.updateProfile(query, updateObj);
    if (updatedUser) {
      return mapper.responseMapping(
        adminConst.CODE.Success,
        adminConst.MESSAGE.Success
      );
    } else {
      return mapper.responseMapping(
        adminConst.CODE.INTRNLSRVR,
        adminConst.MESSAGE.DATANOTFOUND
      );
    }
  } catch (error) {
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

async function getUserFriends(request) {
  try {
    let aggregateQuery = [{ $sort: { userName: 1 } }];
    aggregateQuery.push({ $match: { role: constants.USER_TYPE.USER } });

    if (request.userId) {
      console.log(
        "indide else.................................................................."
      );
      aggregateQuery.push(
        {
          $match: {
            _id: ObjectId(request.userId),
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
          adminConst.CODE.Success,
          adminConst.MESSAGE.Success,
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
          adminConst.CODE.Success,
          adminConst.MESSAGE.Success,
          responseObj
        );
      }
    }
  } catch (error) {
    console.log(error);
    return mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    );
  }
}

module.exports = {
  createTemplate,
  sendCode,
  login,
  verifySecurityCode,
  updateTemplate,
  getUsers,
  getAllTemplates,
  editUser,
  activeOrInactive,
  getOneTemplate,
  getOneUser,
  deleteTemplate,
  getUserFriends
};
