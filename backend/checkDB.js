const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully!');
    const user = await User.findOne({ email: 'd978975@gmail.com' });
    if (user) {
      console.log('Admin User Found:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Has Password:', !!user.password);
    } else {
      console.log('Admin User NOT found in database!');
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Connection error:', err);
  });
