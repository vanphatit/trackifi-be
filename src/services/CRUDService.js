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

      // Create new user (password will be hashed automatically by beforeSave hook)
      const newUser = await User.create({
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
      let users = await User.findAll({
        attributes: {
          exclude: [
            "password",
            "refreshToken",
            "emailVerificationToken",
            "passwordResetToken",
          ],
        },
      });
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
      let user = await User.findByPk(userId, {
        attributes: {
          exclude: [
            "password",
            "refreshToken",
            "emailVerificationToken",
            "passwordResetToken",
          ],
        },
      });
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
      let user = await User.findByPk(data.id);
      if (user) {
        await user.update({
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
        });

        // Get all users after update
        let allUsers = await User.findAll({
          attributes: {
            exclude: [
              "password",
              "refreshToken",
              "emailVerificationToken",
              "passwordResetToken",
            ],
          },
        });
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
      await User.destroy({ where: { id: userId } });
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
