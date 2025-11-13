import connectDB from "../config/database.js";
import User from "../models/User.js";

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing users
    await User.destroy({ where: {}, truncate: true });

    // Create sample users
    const users = [
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
        isEmailVerified: true,
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
        isEmailVerified: true,
      },
      {
        email: "test@trackifi.com",
        password: "test123",
        firstName: "Test",
        lastName: "User",
        address: "789 Test Road",
        phoneNumber: "+1122334455",
        gender: true,
        roleId: "user",
        positionId: "developer",
        isEmailVerified: false,
      },
    ];

    // Insert users using Sequelize
    const createdUsers = await User.bulkCreate(users);

    createdUsers.forEach((user) => {
      console.log(`Created user: ${user.email} (ID: ${user.id})`);
    });

    console.log("Seed data created successfully!");
    console.log(`Total users created: ${createdUsers.length}`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedUsers();
