'use strict';

//===============================Load Modules Start========================

const express = require('express')
	
	
const morgan = require('morgan');
const cors = require('cors');


module.exports = function (app) {

	app.use(cors());
	
    app.use(express.json());
	app.use(morgan('dev'));


};
