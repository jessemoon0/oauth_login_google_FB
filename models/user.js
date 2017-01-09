//We define here the schema of mongoDB
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
    local: {
      username: String,
      password: String
    },
    facebook: {
      id: String,
      token: String,
      email: String,
      name: String
    },
    google: {
      id: String,
      token: String,
      email: String,
      name: String
    }
});

//Add password encryption
userSchema.methods.generateHash = function(password){
  //Takes our password and add a random string, making the password unique
  return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

//To compare if input password = to the one on DB. We do in passport.js
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
}

//User is the name of the model
module.exports = mongoose.model('User', userSchema);
