const mapper = require("./userMapper");
const userConstants = require("./userConstants");
const appUtils = require("../../appUtils");
const ObjectId = require("mongoose").Types.ObjectId;
const jwtHandler = require("../../middleware/jwtHandler");

function checkRegisterRequest(req, res, next) {
  let error = [];
  let details = req.body;
  if (!details || Object.keys(details).length == 0) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  } else {
    let { email, userName, password, dob, gender } = details;
    if (!email || !userName || !password || !dob || !gender) {
      error.push({
        responseCode: userConstants.CODE.BadRequest,
        responseMessage: userConstants.MESSAGE.InvalidDetails,
      });
    }
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    let { email } = details;
    let isValidEmail = appUtils.isValidEmail(email);
    if (isValidEmail) {
      next();
    } else {
      res.json(
        mapper.responseMapping(
          userConstants.CODE.BadRequest,
          userConstants.MESSAGE.InavalidEmailAddress
        )
      );
    }
  }
}

function checkSendCodeRequest(req, res, next) {
  let error = [];

  let { email, userName } = req.body;

  if (!email && !userName) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkLoginRequest(req, res, next) {
  let error = [];
  let {
    email,
    password,
    device,
    browser,
    ipaddress,
    country,
    state,
    userName,
    role,
  } = req.body;
  if (
    (!email && !userName) ||
    !password ||
    !device ||
    !browser ||
    !ipaddress ||
    !country ||
    !state ||
    role !== "user"
  ) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkSecurityCodeVerificationRequest(req, res, next) {
  let error = [];
  let { id } = req.params;
  let { OTP } = req.body;
  if (!id || !ObjectId.isValid(id) || !OTP) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }

  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkAcceptFriendRequest(req, res, next) {
  let details = req.body;
  let token = req.headers["authorization"];
  let error = [];
  if (
    !details ||
    !token ||
    Object.keys(details).length == 0 ||
    !details.acceptersId ||
    !details.reqMakersId ||
    !ObjectId.isValid(details.reqMakersId) ||
    !ObjectId.isValid(details.acceptersId)
  ) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    return jwtHandler.verifyUserToken(token).then((result) => {
      if (result && result._id == details.acceptersId) {
        req.tokenPayload = result;
        next();
      } else {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.FRBDN,
            userConstants.MESSAGE.InvalidToken
          )
        );
      }
    });
  }
}

function checkAddToFriendRequest(req, res, next) {
  let { from, to } = req.body;
  // let { token } = req.params;
  let token = req.headers["authorization"];
  let error = [];
  if (
    !from ||
    !to ||
    !ObjectId.isValid(from) ||
    !ObjectId.isValid(to) ||
    !token
  ) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    return jwtHandler.verifyUserToken(token).then((result) => {
      
      if (result && result._id == from) {
        req.tokenPayload = result;

        next();
      } else {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.FRBDN,
            userConstants.MESSAGE.InvalidToken
          )
        );
      }
    });
  }
}

function checkForgotPasswordRequest(req, res, next) {
  let error = [];
  let { email } = req.body;

  if (!email || !appUtils.isValidEmail(email)) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }

  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkToken(req, res, next) {
  let { id } = req.params;
  let token = req.headers["authorization"];
  if (!token || !id || !ObjectId.isValid(id)) {
    res.send(
      mapper.responseMapping(
        userConstants.CODE.FRBDN,
        userConstants.MESSAGE.TOKEN_NOT_PROVIDED
      )
    );
  } else {
    return jwtHandler.verifyUserToken(token).then((result) => {
      
      if (result && result._id == id) {
        req.tokenPayload = result;
        next();
      } else {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.FRBDN,
            userConstants.MESSAGE.InvalidToken
          )
        );
      }
    });
  }
}

function checkTwoFactorAuthToggle(req, res, next) {
  let error = [];

  let { email } = req.body;

  if (!email || Object.keys(req.body).length == 1) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkSetNewPasswordRequest(req, res, next) {
  let error = [];
  let { token } = req.params;
  let { password } = req.body;

  if (!token || !password) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    return jwtHandler.verifyUserToken(token).then((result) => {
      
      if (result && result.email) {
        req.tokenPayload = result;
        next();
      } else {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.FRBDN,
            "invalid details provided"
          )
        );
      }
    });
  }
}

function checkReplyToComment(req, res, next) {
  let { post_id, comment_id } = req.body;
  let error = [];
  if (
    !comment_id ||
    !post_id ||
    !ObjectId.isValid(post_id) ||
    !ObjectId.isValid(comment_id)
  ) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkTokenWithQuery(req, res, next) {
  // let { token } = req.params;
  let token = req.headers["authorization"];
  let { id } = req.query;
  let error = [];
  if (!token || !ObjectId.isValid(id)) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    return jwtHandler.verifyUserToken(token).then((result) => {
      if (result && result._id == id) {
        req.tokenPayload = result;
        next();
      } else {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.FRBDN,
            userConstants.MESSAGE.InvalidToken
          )
        );
      }
    });
  }
}

function checkDeleteOnePostRequest(req, res, next) {
  let error = [];
  let { id, post_id } = req.params;

  if (!id || !ObjectId.isValid(id) || !post_id || !ObjectId.isValid(post_id)) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }

  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkSelectedUserRequest(req, res, next) {
  let error = [];
  let { selectedId, userId } = req.query;
  let token = req.headers["authorization"];
  if (
    !token ||
    !ObjectId.isValid(userId) ||
    !ObjectId.isValid(selectedId) ||
    !selectedId ||
    !userId
  ) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    return jwtHandler.verifyUserToken(token).then((result) => {
      if (result && result._id == userId) {
        req.tokenPayload = result;
        next();
      } else {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.FRBDN,
            userConstants.MESSAGE.InvalidToken
          )
        );
      }
    });
  }
}

function checkUnfriendRequest(req, res, next) {
  let details = req.body;
  let token = req.headers["authorization"];
  let error = [];
  if (
    !details ||
    !token ||
    Object.keys(details).length == 0 ||
    !details.removedBy ||
    !details.to ||
    !ObjectId.isValid(details.removedBy) ||
    !ObjectId.isValid(details.to)
  ) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    return jwtHandler.verifyUserToken(token).then((result) => {
      if (result && result._id == details.removedBy) {
        req.tokenPayload = result;
        next();
      } else {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.FRBDN,
            userConstants.MESSAGE.InvalidToken
          )
        );
      }
    });
  }
}

function checkRejectFriendRequest(req, res, next) {
  let details = req.body;
  let token = req.headers["authorization"];
  let error = [];
  if (
    !details ||
    !token ||
    Object.keys(details).length == 0 ||
    !details.rejectorId ||
    !details.reqMakerId ||
    !ObjectId.isValid(details.reqMakerId) ||
    !ObjectId.isValid(details.rejectorId)
  ) {
    error.push({
      responseCode: userConstants.CODE.BadRequest,
      responseMessage: userConstants.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        userConstants.CODE.BadRequest,
        userConstants.MESSAGE.InvalidDetails
      )
    );
  } else {
    return jwtHandler.verifyUserToken(token).then((result) => {
      if (result && result._id == details.rejectorId) {
        req.tokenPayload = result;
        next();
      } else {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.FRBDN,
            userConstants.MESSAGE.InvalidToken
          )
        );
      }
    });
  }
}

module.exports = {
  checkRegisterRequest,
  checkAcceptFriendRequest,
  checkSendCodeRequest,
  checkAddToFriendRequest,
  checkSetNewPasswordRequest,
  checkLoginRequest,
  checkSecurityCodeVerificationRequest,
  checkToken,
  checkForgotPasswordRequest,
  checkTwoFactorAuthToggle,
  checkReplyToComment,
  checkTokenWithQuery,
  checkDeleteOnePostRequest,
  checkSelectedUserRequest,
  checkUnfriendRequest,
  checkRejectFriendRequest,
};
