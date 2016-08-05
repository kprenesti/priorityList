var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname +'priority-list-db.sqlite'
});
var db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

//======Models==========
db.item = sequelize.import(__dirname + 'models/items.js');



module.exports = db;
