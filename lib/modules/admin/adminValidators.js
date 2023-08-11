const adminConst = require("./adminConstants");
const ObjectId = require("mongoose").Types.ObjectId;
const mapper = require("./adminMapper");
const jwtHandler = require("../../middleware/jwtHandler");
const constants = require("../../constants");
function checkCreateTemplateRequest(req, res, next) {
  let error = [];
  let { id } = req.params;
  let { mailName } = req.body;

  if (!id || !mailName) {
    error.push({
      responseCode: adminConst.CODE.BadRequest,
      responseMessage: adminConst.MESSAGE.InvalidDetails,
    });
  } else {
    let { mailTitle, mailBody, mailSubject } = req.body;

    if (!mailTitle || !mailBody || !mailSubject) {
      error.push({
        responseCode: adminConst.CODE.BadRequest,
        responseMessage: adminConst.MESSAGE.InvalidDetails,
      });
    }
    if (error.length > 0) {
      res.json(
        mapper.responseMapping(
          adminConst.CODE.BadRequest,
          adminConst.MESSAGE.InvalidDetails
        )
      );
    } else {
      next();
    }
  }
}

function checkSendCodeRequest(req, res, next) {
  let error = [];
  let { email } = req.body;
  if (!email) {
    error.push({
      responseCode: adminConst.CODE.BadRequest,
      responseMessage: adminConst.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkLoginRequest(req, res, next) {
  let error = [];
  let { email, password, role, userName } = req.body;
  if ((!email && !userName) || !password || role !== "admin") {
    error.push({
      responseCode: adminConst.CODE.BadRequest,
      responseMessage: adminConst.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
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
      responseCode: adminConst.CODE.BadRequest,
      responseMessage: adminConst.MESSAGE.InvalidDetails,
    });
  }

  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkUpdateTemplateRequest(req, res, next) {
  let error = [];
  let { id, templateId } = req.params;
  let templateDetails = req.body;

  if (
    !id ||
    !templateDetails ||
    !templateId ||
    !ObjectId.isValid(id) ||
    !ObjectId.isValid(templateId) ||
    Object.keys(templateDetails).length == 0
  ) {
    error.push({
      responseCode: adminConst.CODE.BadRequest,
      responseMessage: adminConst.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkDeleteTemplateRequest(req, res, next) {
  let error = [];
  let { id, templateId } = req.params;

  if (
    !id ||
    !templateId ||
    !ObjectId.isValid(id) ||
    !ObjectId.isValid(templateId)
  ) {
    error.push({
      responseCode: adminConst.CODE.BadRequest,
      responseMessage: adminConst.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkActiveOrDeactiveUser(req, res, next) {
  let error = [];

  let { status, email } = req.body;
  if (
    !status ||
    !email ||
    status !== constants.STATUS.ACTIVE &&
    status !== constants.STATUS.INACTIVE
  ) {
    error.push({
      responseCode: adminConst.CODE.BadRequest,
      responseMessage: adminConst.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkeditUserRequest(req, res, next) {
  let error = [];
  let details = req.body;
  let email = req.body.email;
  if (!details || !email) {
    error.push({
      responseCode: adminConst.CODE.BadRequest,
      responseMessage: adminConst.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      )
    );
  } else {
    next();
  }
}

function checkToken(req, res, next) {
  let token = req.headers["authorization"];
  let { id } = req.params;
  if (!token) {
    res.send(
      mapper.responseMapping(
        adminConst.CODE.FRBDN,
        adminConst.MESSAGE.TOKEN_NOT_PROVIDED
      )
    );
  } else {
    return jwtHandler.verifyAdminToken(token).then((result) => {
      if (result && result._id == id) {
        req.tokenPayload = result;
        next();
      } else {
        res.send(
          mapper.responseMapping(
            adminConst.CODE.FRBDN,
            adminConst.MESSAGE.TOKEN_NOT_PROVIDED
          )
        );
      }
    });
  }
}

function checkTokenWithQuery(req, res, next) {
  // let { token } = req.params;
  let token = req.headers["authorization"];
  let { id } = req.query;
  let error = [];
  if (!token || !ObjectId.isValid(id)) {
    error.push({
      responseCode: adminConst.CODE.BadRequest,
      responseMessage: adminConst.MESSAGE.InvalidDetails,
    });
  }
  if (error.length > 0) {
    res.json(
      mapper.responseMapping(
        adminConst.CODE.BadRequest,
        adminConst.MESSAGE.InvalidDetails
      )
    );
  } else {
    return jwtHandler.verifyAdminToken(token).then((result) => {
      if (result && result._id == id) {
        req.tokenPayload = result;
        next();
      } else {
        res.send(
          mapper.responseMapping(
            adminConst.CODE.FRBDN,
            adminConst.MESSAGE.InvalidToken
          )
        );
      }
    });
  }
}

module.exports = {
  checkCreateTemplateRequest,
  checkSendCodeRequest,
  checkLoginRequest,
  checkSecurityCodeVerificationRequest,
  checkUpdateTemplateRequest,
  checkeditUserRequest,
  checkActiveOrDeactiveUser,
  checkDeleteTemplateRequest,
  checkToken,
  checkTokenWithQuery,
};
