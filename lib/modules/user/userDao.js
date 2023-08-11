let BaseDao = require("../../dao/BaseDao");

const User = require("../../models/userModel");
const userDao = new BaseDao(User);

const Conversation = require("../../models/conversationModel");
const conversationDao = new BaseDao(Conversation);

const Message = require("../../models/messageModel");
const messageDao = new BaseDao(Message);

const Template = require("../../models/EmailTemplateModel");
const templateDao = new BaseDao(Template);

function getUserDetails(query) {
  return userDao.findOne(query);
}

function getFrinedsDetails(query) {
  return userDao.find(query);
}

function getAllUserDetails(query) {
  return userDao.aggregate(query);
}

function updateProfile(query, updateObj) {
  let options = {
    new: true,
  };
  return userDao.findOneAndUpdate(query, updateObj, options);
}

function updateConversation(query, updateObj) {
  let options = {
    new: true,
  };
  return conversationDao.findOneAndUpdate(query, updateObj, options);
}

function update(query, updateObj) {
  let options = {
    new: true,
  };
  return userDao.update(query, updateObj, options);
}

function createUser(obj) {
  let userObj = new User(obj);
  return userDao.save(userObj);
}

function createMessage(obj) {
  let messageObj = new Message(obj);
  return messageDao.save(messageObj);
}

function getAllMessagesDetails(query) {
  return messageDao.find(query);
}

function createConversation(obj) {
  let conversationObj = new Conversation(obj);
  return conversationDao.save(conversationObj);
}

function getConversationDetails(query) {
  return conversationDao.findOne(query);
}

function deleteConversation(query) {
  return conversationDao.deleteOne(query);
}

function deleteMessages(query) {
  return messageDao.deleteMany(query);
}

function getSingleMessage(query) {
  return messageDao.findOne(query);
}

function deletesinglemessage(query) {
  return messageDao.deleteOne(query);
}

function getAllConversationsDetails(query) {
  let condition = { updatedAt: -1 };
  return conversationDao.customFind(query, condition);
}

function getTemplateDetails(query) {
  return templateDao.findOne(query);
}

function getAllUserDetailsByQuery(query) {
  return userDao.aggregate(query);
}
module.exports = {
  getUserDetails,
  getFrinedsDetails,
  getAllUserDetails,
  createUser,
  createMessage,
  getAllMessagesDetails,
  createConversation,
  getConversationDetails,
  deleteConversation,
  deleteMessages,
  getSingleMessage,
  deletesinglemessage,
  getAllConversationsDetails,
  getTemplateDetails,
  updateProfile,
  updateConversation,
  getAllUserDetailsByQuery,
  update,
};
