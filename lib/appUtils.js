'use strict';



// var promise = require('bluebird');
var bcrypt = require('bcryptjs');
let cloudinary = require("./clodinary")



/**
 * returns if email is valid or not
 * @returns {boolean}
 */
function isValidEmail(email) {
	/* eslint-disable-next-line */
	var pattern = /(([a-zA-Z0-9\-?\.?]+)@(([a-zA-Z0-9\-_]+\.)+)([a-z]{2,3}))+$/;
	// console.log("new RegExp(pattern).test(email)",new RegExp(pattern).test(email));
	return new RegExp(pattern).test(email);
}

async function uploadImage(file){
	let myFile = file;
	const result = await cloudinary.uploader.upload(myFile.path);
	// console.log("result",result);
	return result;
}


async function convertPass(password) {
	let pass = await bcrypt.hash(password, 10);
	// req.body.password = pass;
	return pass;
}

function verifyPassword(user, isExist) {
	return bcrypt.compare(user, isExist);
}

module.exports = {

	verifyPassword,

	isValidEmail,

	convertPass,
	uploadImage
};
