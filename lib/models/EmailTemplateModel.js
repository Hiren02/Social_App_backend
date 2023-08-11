const mongoose = require('mongoose');
const constants = require("../constants")


const Schema = mongoose.Schema({
mailName : {
    type:String,
    require:true,
    enum:[
        constants.EMAIL_TEMPLATES.NEW_VERIFICATION_CODE,
        constants.EMAIL_TEMPLATES.NEW_RESEND_CODE,
        constants.EMAIL_TEMPLATES.USER_RESET_PASSWORD,
        constants.EMAIL_TEMPLATES.USER_FORGOT_PASSWORD,
        constants.EMAIL_TEMPLATES.TEST_NAME,
    ],
},
mailTitle :{type : String , require : true},
mailBody :{type : String , require :true},
mailSubject :{type : String , require :true},
createdAt: { type: Date },
editedAt: { type: Date },
editedBy:{type:mongoose.Types.ObjectId},
createdBy:{type:String}

}

)


const EmailTemplate = mongoose.model(process.env.EMAIL_COLLECTION_NAME, Schema);
module.exports = EmailTemplate;