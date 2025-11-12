import User, { UserDocument } from "../models/User";
import { IUser, IUserCreateInput, IUserUpdateInput } from "../types/User";

const createNewUser = async (data: IUserCreateInput): Promise<string> => {
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
const getAllUser = (): Promise<IUser[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await User.find({}).lean();
      resolve(users as unknown as IUser[]);
    } catch (e) {
      reject(e);
    }
  });
};

// Get user by ID
const getUserInfoById = (userId: string): Promise<IUser | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId).lean();
      if (user) {
        resolve(user as unknown as IUser);
      } else {
        resolve(null);
      }
    } catch (e) {
      reject(e);
    }
  });
};

// Update user
const updateUser = (data: IUserUpdateInput): Promise<IUser[] | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(data.id);
      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        await user.save();

        // Get all users after update
        const allUsers = await User.find({}).lean();
        resolve(allUsers as unknown as IUser[]);
      } else {
        resolve(null);
      }
    } catch (e) {
      reject(e);
    }
  });
};

// Delete user by ID
const deleteUserById = (userId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      await User.findByIdAndDelete(userId);
      resolve("User deleted successfully");
    } catch (e) {
      reject(e);
    }
  });
};

export {
  createNewUser,
  getAllUser,
  getUserInfoById,
  updateUser,
  deleteUserById,
};
