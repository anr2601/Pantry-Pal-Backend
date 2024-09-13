const User = require('../models/User'); // Assuming you have a User model
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
  const { username, password } = req.body;

  try {

    console.log("Logging in....");
    const user = await User.findOne({ username });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      console.log("Password incorrect");
      return res.status(401).json({ message: 'Incorrect password' });
    }

    console.log("User found!")
    const us = {username:user.username, password:user.password};
    const accessToken = jwt.sign(us, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });


    return res.status(200).json({ message: 'Login successful', accessToken });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred' });
  }
};

const signup = async (req, res) => {
  const { username, password } = req.body;

  try {

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      console.log("User already exists")
      return res.status(409).json({ message: 'Username already exists' });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    console.log("Signup Successful");
    return res.status(201).json({ message: 'User created', user: newUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
};

module.exports = { login, signup };
