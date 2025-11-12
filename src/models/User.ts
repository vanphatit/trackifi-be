import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, IUserMethods, IUserStatics } from "../types/User";

type UserDocument = Document & IUser & IUserMethods;
type UserModel = Model<UserDocument> & IUserStatics;

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    gender: {
      type: Boolean,
      default: true, // true for male, false for female
    },
    image: {
      type: String,
      default: null,
    },
    roleId: {
      type: String,
      default: "user",
    },
    positionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields automatically
  }
);

// Hash password before saving
userSchema.pre<UserDocument>("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to get full name
userSchema.methods.getFullName = function (this: UserDocument): string {
  return `${this.firstName} ${this.lastName}`;
};

// Static method to find user by email
userSchema.static("findByEmail", function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
});

const User = mongoose.model<UserDocument, UserModel>("User", userSchema);

export default User;
export { UserDocument, UserModel };
