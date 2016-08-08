module.exports = function(sequelize, DataTypes){
  return sequelize.define('item', {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 250]
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2
    },
    due: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    }
  });
};
