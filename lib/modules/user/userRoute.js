// const multer = require("multer")
const router = require("express").Router();
const service = require("./userService");
const validators = require("./userValidators");
const userConstants = require("./userConstants");
const mapper = require("./userMapper");
const fileUtils = require("../../middleware/multer");
const appUtils = require("../../appUtils");

router
  .route("/register")
  .post([validators.checkRegisterRequest], (req, res) => {
    let details = req.body;
    service
      .registerUser(details)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/sendCode")
  .post([validators.checkSendCodeRequest], (req, res) => {
    let details = req.body;
    service
      .sendCode(details)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/verifySecurityCode/:id")
  .post([validators.checkSecurityCodeVerificationRequest], (req, res) => {
    let { id } = req.params;
    let { OTP } = req.body;
    service
      .verifySecurityCode(id, OTP)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router.route("/login").post([validators.checkLoginRequest], (req, res) => {
  let details = req.body;
  service
    .login(details)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log({ err });
      res.send(
        mapper.responseMapping(
          userConstants.CODE.INTRNLSRVR,
          userConstants.MESSAGE.internalServerError
        )
      );
    });
});

router
  .route("/changePassword/:id")
  .post([validators.checkToken], (req, res) => {
    let { id } = req.params;
    let details = req.body;

    service
      .changePassword(id, details)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/forgotPassword/")
  .post([validators.checkForgotPasswordRequest], (req, res) => {
    let { email } = req.body;
    service
      .forgotPassword(email)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/setNewPassword/:token")
  .post([validators.checkSetNewPasswordRequest], (req, res) => {
    let { token } = req.params;
    let { password } = req.body;
    let tokenData = req.tokenPayload;
    service
      .setNewPassword(token, password, tokenData)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log({ err });
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/sendRequest")
  .put([validators.checkAddToFriendRequest], (req, res) => {
    let { from, to } = req.body;
    service
      .sendRequest(from, to)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/acceptFriendRequest")
  .put([validators.checkAcceptFriendRequest], (req, res) => {
    let details = req.body;
    service
      .acceptFriendRequest(details)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/getAllSuggetions")
  .get([validators.checkTokenWithQuery], (req, res) => {
    let request = req.query;
    // let id = req.body.id;
    console.log("request", request);
    service
      .getAllSuggetions(request)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.log(error);
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/getUserFriends")
  .get([validators.checkTokenWithQuery], (req, res) => {
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
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/getAllUsers")
  .get([validators.checkTokenWithQuery], (req, res) => {
    let queryParams = req.query;
    // let id = req.body.id;

    service
      .getAllUsers(queryParams)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.log(error);
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/getAllPosts")
  .get([validators.checkTokenWithQuery], (req, res) => {
    let { skip, limit, id } = req.query;
    service
      .getAllPosts(skip, limit, id)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.log(error);
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/getAllRequests")
  .get([validators.checkTokenWithQuery], (req, res) => {
    let { key, skip, limit, id } = req.query;
    service
      .getAllRequests(key, skip, limit, id)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.log(error);
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/onTwoFactorAuthToggle/:id")
  .put(
    [validators.checkToken, validators.checkTwoFactorAuthToggle],
    (req, res) => {
      let details = req.body;
      let { id } = req.params;
      service
        .twoFactorAuthToggle(details, id)
        .then((result) => {
          res.send(result);
        })
        .catch((error) => {
          console.log(error);
          res.send(
            mapper.responseMapping(
              userConstants.CODE.INTRNLSRVR,
              userConstants.MESSAGE.internalServerError
            )
          );
        });
    }
  );

router
  .route("/addFeeds/:id")
  .post([validators.checkToken], async (req, res) => {
    // try {
    fileUtils.upload(req, res, async (err) => {
      service
        .addFeeds(req)
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          console.log(err);
          res.send(err);
        });
    });
  });

router.route("/addLike/:id").put([validators.checkToken], async (req, res) => {
  let details = req.body;
  let { id } = req.params;
  service
    .addLike(details, id)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

router
  .route("/dislikePost/:id")
  .put([validators.checkToken], async (req, res) => {
    let details = req.body;
    let { id } = req.params;
    service
      .dislikePost(details, id)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log(err);
      });
  });

router
  .route("/addComment/:id")
  .put([validators.checkToken], async (req, res) => {
    let details = req.body;
    let { id } = req.params;
    service
      .addComment(details, id)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log("err", err);
      });
  });

router
  .route("/addReplyToComment/:id")
  .put(
    [validators.checkToken, validators.checkReplyToComment],
    async (req, res) => {
      let details = req.body;
      let { id } = req.params;
      service
        .replyToComment(details, id)
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          console.log("err", err);
        });
    }
  );

router
  .route("/uploadProfilePhoto/:id")
  .post([validators.checkToken], async (req, res) => {
    try {
      fileUtils.uploadProfilePhoto(req, res, async (err) => {
        service
          .uploadProfilePic(req)
          .then((result) => {
            res.send(result);
          })
          .catch((err) => {
            console.log(err);
            res.send(err);
          });
      });
    } catch (error) {
      res.send(
        mapper.responseMapping(
          userConstants.CODE.INTRNLSRVR,
          userConstants.MESSAGE.internalServerError
        )
      );
    }
  });

router.route("/getOneUser/:id").get([validators.checkToken], (req, res) => {
  let { id } = req.params;
  let { selectedId } = req.query;
  service
    .getOneUser(id, selectedId)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.log(error);
      res.send(
        mapper.responseMapping(
          userConstants.CODE.INTRNLSRVR,
          userConstants.MESSAGE.internalServerError
        )
      );
    });
});

router
  .route("/deleteOnePost/:id/:post_id")
  .put(
    [validators.checkToken, validators.checkDeleteOnePostRequest],
    (req, res) => {
      let { id, post_id } = req.params;
      service
        .deleteOnePost(id, post_id)
        .then((result) => {
          res.send(result);
        })
        .catch((error) => {
          console.log(error);
          res.send(
            mapper.responseMapping(
              userConstants.CODE.INTRNLSRVR,
              userConstants.MESSAGE.internalServerError
            )
          );
        });
    }
  );

router
  .route("/getFriendPosts")
  .get([validators.checkTokenWithQuery], (req, res) => {
    let { id, skip, limit } = req.query;

    service
      .getFriendPosts(id, skip, limit)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.log(error);
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/getSelectedUser")
  .get([validators.checkSelectedUserRequest], (req, res) => {
    details = req.query;
    service
      .selectedUser(details)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log(err);
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/unfriendUser")
  .put([validators.checkUnfriendRequest], (req, res) => {
    details = req.body;
    service
      .unfriendUser(details)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log(err);
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/rejectFriendRequest")
  .put([validators.checkRejectFriendRequest], (req, res) => {
    let details = req.body;
    service
      .rejectFriendRequest(details)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router.route("/getAllComments/:id").get([validators.checkToken], (req, res) => {
  let { skip, limit, postId, postBy } = req.query;
  service
    .getAllComments(skip, limit, postId, postBy)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.log(error);
      res.send(
        mapper.responseMapping(
          userConstants.CODE.INTRNLSRVR,
          userConstants.MESSAGE.internalServerError
        )
      );
    });
});

router.route("/cancelFriendRequest").put((req, res) => {
  let { from, to } = req.body;
  service
    .cancelFriendRequest(from, to)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(
        mapper.responseMapping(
          userConstants.CODE.INTRNLSRVR,
          userConstants.MESSAGE.internalServerError
        )
      );
    });
});

router
  .route("/deleteOneComment/:id")
  .delete([validators.checkToken], (req, res) => {
    // let { from } = req.body;
    let { id } = req.params;
    let { postBy, postId, commentId } = req.body;
    service
      .deleteOneComment(id, postBy, postId, commentId)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/deleteCommentReply/:id")
  .delete([validators.checkToken], (req, res) => {
    // let { from } = req.body;

    let details = req.body;
    service
      .deleteReplyToComment(details)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/newConversation/:id")
  .post([validators.checkToken], (req, res) => {
    let { senderId, receiverId } = req.body;

    service
      .newConversation(senderId, receiverId)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log({ err });
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/getAllConversations/:id")
  .get([validators.checkToken], (req, res) => {
    let { id } = req.params;
    service
      .getAllConversations(id)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log({ err });
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router.route("/newMessage/:id").post([validators.checkToken], (req, res) => {
  let { sender, text, conversationId } = req.body;

  service
    .newMessage(sender, text, conversationId)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log({ err });
      res.send(
        mapper.responseMapping(
          userConstants.CODE.INTRNLSRVR,
          userConstants.MESSAGE.internalServerError
        )
      );
    });
});

router
  .route("/getAllMessages/:id/:conversationId")
  .get([validators.checkToken], (req, res) => {
    let { conversationId } = req.params;
    service
      .getAllMessages(conversationId)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log({ err });
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });

router
  .route("/deleteChatUser/:id/:conversationId")
  .delete([validators.checkToken], (req, res) => {
    let { conversationId } = req.params;

    service
      .deleteChatUser(conversationId)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });


router
  .route("/deletesinglemessage/:id/:messageId")
  .delete([validators.checkToken], (req, res) => {
    let { messageId } = req.params;

    service
      .deletesinglemessage(messageId)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(
          mapper.responseMapping(
            userConstants.CODE.INTRNLSRVR,
            userConstants.MESSAGE.internalServerError
          )
        );
      });
  });


module.exports = router;
