const router = require("express").Router();
const service = require("./adminService");
const validators = require("./adminValidators");
const adminConst = require("./adminConstants");
const mapper = require("./adminMapper");

router.route("/createTemplate/:id").post([validators.checkToken,validators.checkCreateTemplateRequest], (req, res) => {
    let { id } = req.params;
    let templateDetails = req.body;
    service.createTemplate(id, templateDetails).then((result) => {
        res.send(result);
      }).catch((err) => {
        console.log({ err });
        res.send(
          mapper.responseMapping(
            adminConst.CODE.INTRNLSRVR,
            adminConst.MESSAGE.internalServerError
          )
        );
      });
  });

router.route("/sendCode").post([validators.checkSendCodeRequest], (req, res) => {
    let details = req.body;
    service.sendCode(details).then((result) => {
        res.send(result);
      }).catch((err) => {
        res.send(
          mapper.responseMapping(
            adminConst.CODE.INTRNLSRVR,
            adminConst.MESSAGE.internalServerError
          )
        );
      });
  });

router.route("/login").post([validators.checkLoginRequest], (req, res) => {
  let details = req.body;
  service.login(details).then((result) => {
      res.send(result);
    }).catch((err) => {
      res.send(
        mapper.responseMapping(
          adminConst.CODE.INTRNLSRVR,
          adminConst.MESSAGE.internalServerError
        )
      );
    });
});

router.route("/verifySecurityCode/:id").post([validators.checkSecurityCodeVerificationRequest], (req, res) => {
    let { id } = req.params;
    let { OTP } = req.body;
    service.verifySecurityCode(id, OTP).then((result) => {
        res.send(result);
      }).catch((err) => {
        res.send(
          mapper.responseMapping(
            adminConst.CODE.INTRNLSRVR,
            adminConst.MESSAGE.internalServerError
          )
        );
      });
  });

router.route("/updateTemplate/:id/:templateId").put([validators.checkToken,validators.checkUpdateTemplateRequest], (req, res) => {
    let { id, templateId } = req.params;
    let templateUpdateDetails = req.body;
    service.updateTemplate(id, templateId, templateUpdateDetails).then((result) => {
        res.send(result);
      }).catch((error) => {
        res.send(
          mapper.responseMapping(
            adminConst.CODE.INTRNLSRVR,
            adminConst.MESSAGE.internalServerError
          )
        );
      });
  });

  router.route("/deleteTemplate/:id/:templateId").delete([validators.checkToken,validators.checkDeleteTemplateRequest], (req, res) => {
    let { id, templateId } = req.params;

    service.deleteTemplate(id, templateId).then((result) => {
        res.send(result);
      }).catch((error) => {
        res.send(
          mapper.responseMapping(
            adminConst.CODE.INTRNLSRVR,
            adminConst.MESSAGE.internalServerError
          )
        );
      });
  });

router.route("/getAllUsers/:id").get([validators.checkToken],(req,res) => {
    let {key,skip,limit} = req.query;
    service.getUsers(key,skip,limit).then((result)=>{
      res.send(result);
    }).catch((error) =>{
      res.send( mapper.responseMapping(
        adminConst.CODE.INTRNLSRVR,
        adminConst.MESSAGE.internalServerError
      ))
    })
  })

  router.route("/getOneUser/:id/:userId").get([validators.checkToken],(req,res) => {
    let { userId } = req.params;
    service.getOneUser(userId).then((result)=>{
      res.send(result);
    }).catch((error) =>{
      console.log(error);
      res.send( mapper.responseMapping(
        adminConst.CODE.INTRNLSRVR,
        adminConst.MESSAGE.internalServerError
      ))
    })
  })

router.route("/getAllTemplates/:id").get([validators.checkToken],(req,res) => {
    service.getAllTemplates().then((result)=>{
      res.send(result);
    }).catch((error) =>{
      console.log(error);
      res.send( mapper.responseMapping(
        adminConst.CODE.INTRNLSRVR,
        adminConst.MESSAGE.internalServerError
      ))
    })
})

router.route("/getOneTemplate/:id/:templateId").get((req,res) => {
  let { templateId } = req.params;
  service.getOneTemplate(templateId).then((result)=>{
    res.send(result);
  }).catch((error) =>{
    console.log(error);
    res.send( mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    ))
  })
})

router.route("/getUserFriends/:id").get([validators.checkToken],(req, res) => {
  let request = req.query;

  service
    .getUserFriends(request)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.log(error);
      res.send(
        mapper.responseMapping(
          adminConst.CODE.INTRNLSRVR,
          adminConst.MESSAGE.internalServerError
        )
      );
    });
});

router.route("/editUser/:id").put([validators.checkToken,validators.checkeditUserRequest],(req, res) => {
  let email = req.body.email
  let details = req.body;
  service.editUser(email, details).then((result)=>{
    res.send(result);
  }).catch((error) =>{
    console.log(error);
    res.send( mapper.responseMapping(
      adminConst.CODE.INTRNLSRVR,
      adminConst.MESSAGE.internalServerError
    ))
  })
})

router.route("/onActiveOrInactive/:id").put([validators.checkToken,validators.checkActiveOrDeactiveUser],(req,res) => {
  let details = req.body;
    service.activeOrInactive(details).then((result)=>{
      res.send(result);
    }).catch((error) =>{
      console.log(error);
      res.send( mapper.responseMapping(
        adminConst.CODE.INTRNLSRVR,
        adminConst.MESSAGE.internalServerError
      ))
    })
})

module.exports = router;
