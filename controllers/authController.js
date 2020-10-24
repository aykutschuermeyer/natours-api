const jwt = require('jsonwebtoken');

const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Email and password needed', 400));
  }

  const user = await User.findOne({ email: email }).select('+password');

  // console.log(user);
  // console.log(await user.correctPassword(password, user.password));
  // console.log(
  //   await (!user || !(await user.correctPassword(password, user.password)))
  // );
  // console.log(new AppError('Incorrect E-mail or password', 401));

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect E-mail or password', 401));
  }

  console.log('User found and password correct');

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token: token
  });
});
