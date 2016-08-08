module.exports = function(sequelize, DataTypes){
  return sequelize.define('user',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [2, 50]
        }
      }, //end name
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      }, //end email
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 25]
        }
      } //end password

    },
    {
      hooks: {
        beforeValidate: function(user, option){
          if(typeof user.email === 'string'){
            user.email = user.email.toLowerCase();
          } // end if for email
          if(typeof user.name === 'string'){
            user.name = user.name.trim();
          }
        } //end beforeValidate
      } //end hooks
    } //end outer-hooks object
  ); //end sequelize.define
}; //end module.exports
