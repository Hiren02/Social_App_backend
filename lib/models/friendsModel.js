const mongoose = require('mongoose');
const constants = require("../constants")


const Schema = mongoose.Schema({
  userId : {type: mongoose.Types.ObjectId,ref: constants.DB_MODEL_REF.USERS},
  friendId : {type: mongoose.Types.ObjectId,ref: constants.DB_MODEL_REF.USERS}
})


const Friend = mongoose.model(process.env.FRIEND_COLLECTION_NAME, Schema);
module.exports = Friend;