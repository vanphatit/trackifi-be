import User from "../models/User.js"; // import User model

let createNewUser = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(data.email);
      if (existingUser) {
        reject(new Error("User with this email already exists"));
        return;
      }

      // Create new user (password will be hashed automatically by pre-save middleware)
      const newUser = new User({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        phoneNumber: data.phoneNumber,
        gender: data.gender === "1" ? true : false,
        roleId: data.roleId,
        positionId: data.positionId,
      });

      await newUser.save();
      resolve("OK create a new user successful!");
    } catch (e) {
      reject(e);
    }
  });
};

// Get all users
let getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await User.find({}).lean(); // .lean() returns plain JavaScript objects
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

// Get user by ID
let getUserInfoById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findById(userId).lean();
      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
    } catch (e) {
      reject(e);
    }
  });
};

// Update user
let updateUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findById(data.id);
      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        await user.save();

        // Get all users after update
        let allUsers = await User.find({}).lean();
        resolve(allUsers);
      } else {
        resolve(null);
      }
    } catch (e) {
      reject(e);
    }
  });
};

// Delete user by ID
let deleteUserById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      await User.findByIdAndDelete(userId);
      resolve("User deleted successfully");
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createNewUser: createNewUser,
  getAllUser: getAllUser,
  getUserInfoById: getUserInfoById,
  updateUser: updateUser,
  deleteUserById: deleteUserById,
};
