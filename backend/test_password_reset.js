const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mobiloitte', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function testPasswordReset() {
  try {
    // Create a test user
    const email = 'test@example.com';
    const password = 'TestPass123';
    
    // Delete user if exists
    await User.deleteOne({ email });
    
    // Create new user
    const user = await User.create({
      email,
      password,
      name: 'Test User',
      mobile: '+1234567890',
      role: 'employee'
    });
    
    console.log('Created user with hashed password:', user.password);
    
    // Verify password works for login
    const isMatch = await user.comparePassword(password);
    console.log('Original password matches:', isMatch);
    
    // Simulate password reset (like in changePassword function)
    const newPassword = 'NewPass456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password using findByIdAndUpdate (bypasses middleware)
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    
    // Fetch updated user
    const updatedUser = await User.findById(user._id);
    console.log('Updated password:', updatedUser.password);
    
    // Verify new password works
    const isNewMatch = await updatedUser.comparePassword(newPassword);
    console.log('New password matches:', isNewMatch);
    
    // Verify old password doesn't work
    const isOldMatch = await updatedUser.comparePassword(password);
    console.log('Old password matches:', isOldMatch);
    
    // Clean up
    await User.deleteOne({ email });
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPasswordReset();