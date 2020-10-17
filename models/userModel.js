const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
// const validator = require('validator');

const validateEmail = email => {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name must be provided']
  },
  email: {
    type: String,
    required: [true, 'Email must be provided'],
    unique: true,
    lowercase: true,
    validate: [validateEmail, 'Not a valid email address']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Password must be provided'],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Repeat password'],
    validate: {
      // This only works on SAVE!
      validator: function(rep) {
        return rep == this.password;
      },
      message: 'Passwords do not match'
    }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
