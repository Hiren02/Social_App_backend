const mongoose = require('mongoose');
const constants = require('../constants');


const Schema = mongoose.Schema({
    userName : {type : String , require : true , unique:true , trim:true} , 
    profilePhoto :{type:String},
    email: {type : String , lowercase :true , unique:true,trim:true},
    password : {type : String , require : true , trim:true},
    status: { type: String, enum: [constants.STATUS.ACTIVE, constants.STATUS.INACTIVE], default: constants.STATUS.ACTIVE },
	dob :{type : Date},
	gender :{type:String , enum:[constants.GENDER.MALE,constants.GENDER.FEMALE , constants.GENDER.CUSTOM]},
    role: { type: String, enum: [constants.USER_TYPE.SUPER_ADMIN, constants.USER_TYPE.ADMIN,constants.USER_TYPE.USER], default: constants.USER_TYPE.USER},
	forgotPasswordToken: {type : String ,unique:true},
	tokenExpiryTime:{type : Date},
    OTP: { type: Number },
	OTPExpiryTime:{type:Date},
    twoFactorAuthentication: { type: Boolean, default: true },
	isOTPVerified: { type: Boolean, default: false },
	createdAt: { type: Date },
	updatedAt: { type: Date },
    resendOTP:{type:Boolean},
    loginActivity: [{
		device: { type: String }, 
		browser: { type: String },
		ipaddress: { type: String },
		country: { type: String },
		state: { type: String },
	}],
	friends :[{_id : {type : mongoose.Types.ObjectId }}],
	requests : [{_id : {type : mongoose.Types.ObjectId}}],
	posts:[{
    
        userName:{type:String},
        description:{type:String},
        imageURL:{type:String},
        likesBy:[{userName:{type:String}}],
        likesCount:{type:Number , default:0},
        createdAt :{type:Date},
        comments:[{
            userName:{type:String},
            description:{type:String},
            createdAt:{type :Date},
            commentReplies:[{from:{type:String} , to:{type:String} , reply:{type :String},  createdAt :{type:Date},}]
        }]
    }] 
	
})

const User = mongoose.model(process.env.USER_COLLECTION_NAME, Schema);
module.exports = User;