var Sequelize = require('sequelize');
var sequelize;

var env = process.env.NODE_ENV || 'development';
if (env === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/priority-list-db.sqlite'
	});
}

var db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

//======Models==========
db.items = sequelize.import(__dirname + '/models/items.js');
db.user = sequelize.import(__dirname + '/models/user.js');


module.exports = db;
