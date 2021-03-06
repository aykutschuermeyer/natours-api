const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

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
    minlength: 8,
    select: false
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
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = function(candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfterToken = function(tokenTimestamp) {
  if (this.passwordChangedAt) {
    if (
      tokenTimestamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    ) {
      return true;
    }
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
