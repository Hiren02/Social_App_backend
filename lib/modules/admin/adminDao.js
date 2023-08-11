const mongoose = require("mongoose");
let BaseDao = require("../../dao/BaseDao");
const User = require("../../models/userModel");
const Template = require("../../models/EmailTemplateModel");
const templateDao = new BaseDao(Template);
const usrDao = new BaseDao(User);

function getAdminDetails(query) {
  return usrDao.findOne(query);
}

function getUserDetails(query) {
  return usrDao.findOne(query);
}

async function createTemplate(obj) {
  let tempObj = new Template(obj);
  let check = await templateDao.save(tempObj);
  return templateDao.save(tempObj);
}

function getTemplateDetails(query) {
  return templateDao.findOne(query);
}
function getAllTemplates() {
  return templateDao.find();
}

function updateProfile(query, updateObj) {
  let options = {
    new: true,
  };
  return usrDao.findOneAndUpdate(query, updateObj, options);
}

function updateTemplate(query, updateObj) {
  let update = {};
  update["$set"] = updateObj;
  let options = {
    new: true,
  };
  return templateDao.findOneAndUpdate(query, update, options);
}

function getAllUserDetailsByQuery(query) {
  return usrDao.aggregate(query);
}

function deleteTemplate(query) {
  return templateDao.findByIdAndRemove(query);
}

module.exports = {
  createTemplate,
  getAdminDetails,
  getTemplateDetails,
  updateProfile,
  updateTemplate,
  getAllUserDetailsByQuery,
  getAllTemplates,
  getUserDetails,
  deleteTemplate,
};
