import connectDB from "../config/database";
import User from "../models/User";
import { IUser } from "../types/User";

const seedUsers = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing users
    await User.deleteMany({});

    // Create sample users
    const users: Partial<IUser>[] = [
      {
        email: "admin@trackifi.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        address: "123 Admin Street",
        phoneNumber: "+1234567890",
        gender: true,
        roleId: "admin",
        positionId: "manager",
      },
      {
        email: "user@trackifi.com",
        password: "user123",
        firstName: "Regular",
        lastName: "User",
        address: "456 User Avenue",
        phoneNumber: "+0987654321",
        gender: false,
        roleId: "user",
        positionId: "employee",
      },
    ];

    // Insert users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.email}`);
    }

    console.log("Seed data created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedUsers();
