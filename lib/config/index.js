const path = require('path');
const mongoDBConfig = require('./mongoDBConfig');
const expressConfig = require('./expressConfig');

var defaultMongoDBConfig = {
	environment: process.env.NODE_ENV || 'development',
	ip: 'localhost',
	port: process.env.PORT,
	protocol: 'http',
	TAG: process.env.NODE_ENV,
	uploadDir: path.resolve('./uploads'),
	mongo: {
		dbName: process.env.dbName,
		dbUrl: process.env.dbUrl ,
		options: {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	},
	swagger_port: 80
};

//Export config module
module.exports = {
	defaultMongoDBConfig,
	mongoDBConfig,
	expressConfig
};
