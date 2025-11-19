import connectDB, { sequelize } from "../config/database.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { ROLES } from "../constants/roles.js";
import { slugify } from "../utils/slugify.js";

const seedData = async () => {
  try {
    await connectDB();
    await sequelize.sync({ force: true });

    const users = [
      {
        email: "admin@trackifi.com",
        password: "admin123",
        firstName: "Alice",
        lastName: "Admin",
        address: "123 Admin Street, District 1, HCM",
        phoneNumber: "+84901234567",
        gender: true,
        roleId: ROLES.ADMIN,
        positionId: "manager",
        isEmailVerified: true,
      },
      {
        email: "support@trackifi.com",
        password: "support123",
        firstName: "Sam",
        lastName: "Supporter",
        address: "456 Support Ave, Da Nang",
        phoneNumber: "+84876543210",
        gender: true,
        roleId: ROLES.SUPPORTER,
        positionId: "specialist",
        isEmailVerified: true,
      },
      {
        email: "customer@trackifi.com",
        password: "customer123",
        firstName: "Chris",
        lastName: "Customer",
        address: "789 Customer Road, Ha Noi",
        phoneNumber: "+84777888999",
        gender: false,
        roleId: ROLES.CUSTOMER,
        positionId: null,
        isEmailVerified: true,
      },
    ];

    await User.bulkCreate(users, { individualHooks: true });
    console.log(`Seeded ${users.length} users`);

    const categoriesData = [
      {
        name: "Gaming Laptops",
        description: "Laptop cấu hình cao cho game thủ và nhà sáng tạo.",
      },
      {
        name: "Ultrabook & Office",
        description: "Nhẹ, mỏng, phù hợp văn phòng và di chuyển.",
      },
      {
        name: "Workstation",
        description: "Máy trạm di động cho nhu cầu đồ họa nặng.",
      },
    ].map((category) => ({
      ...category,
      slug: slugify(category.name),
    }));

    const categories = await Category.bulkCreate(categoriesData, {
      returning: true,
    });

    console.log(`Seeded ${categories.length} categories`);

    const categoryMap = categories.reduce((acc, category) => {
      acc[category.slug] = category.id;
      return acc;
    }, {});

    const products = [
      {
        name: "ASUS ROG Strix G18 2024",
        brand: "ASUS",
        price: 59990000,
        discountPercent: 5,
        stock: 25,
        shortDescription: "i9-14900HX | RTX 4070 8GB | RAM 32GB | SSD 1TB",
        description:
          "Laptop gaming 18 inch với tản nhiệt buồng hơi mới, bàn phím full-size và dải LED Aura Sync.",
        specs: {
          cpu: "Intel Core i9-14900HX",
          gpu: "NVIDIA GeForce RTX 4070 8GB",
          ram: "32GB DDR5 5600MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: "18\" QHD+ 240Hz",
          weight: "3 kg",
        },
        images: [
          "https://placehold.co/800x600?text=ROG+Strix+G18",
          "https://placehold.co/800x600?text=ROG+Rear",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },
      {
        name: "Dell XPS 15 9530 OLED",
        brand: "Dell",
        price: 52990000,
        discountPercent: 0,
        stock: 15,
        shortDescription: "i7-13700H | RTX 4070 | RAM 32GB | SSD 1TB",
        description:
          "Ultrabook cao cấp với màn hình OLED 3.5K, khung nhôm nguyên khối, bàn phím Edge-to-Edge.",
        specs: {
          cpu: "Intel Core i7-13700H",
          gpu: "NVIDIA GeForce RTX 4070 8GB",
          ram: "32GB DDR5 5200MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: "15.6\" 3.5K OLED Touch",
          weight: "1.86 kg",
        },
        images: [
          "https://placehold.co/800x600?text=Dell+XPS+15+Front",
          "https://placehold.co/800x600?text=Dell+XPS+15+Side",
        ],
        categoryId: categoryMap["ultrabook-office"],
      },
      {
        name: "Lenovo ThinkPad P16 Gen2",
        brand: "Lenovo",
        price: 67990000,
        discountPercent: 7,
        stock: 10,
        shortDescription: "Xeon W-11855M | RTX A3000 | RAM 64GB | SSD 2TB",
        description:
          "Máy trạm di động đạt chứng nhận ISV, bàn phím ThinkPad, MIL-STD 810H.",
        specs: {
          cpu: "Intel Xeon W-11855M",
          gpu: "NVIDIA RTX A3000 12GB",
          ram: "64GB DDR5 4800MHz",
          storage: "2TB PCIe 4.0 SSD",
          display: "16\" WQUXGA 600 nits",
          weight: "2.95 kg",
        },
        images: [
          "https://placehold.co/800x600?text=ThinkPad+P16",
          "https://placehold.co/800x600?text=ThinkPad+Keyboard",
        ],
        categoryId: categoryMap["workstation"],
      },
    ].map((product, index) => ({
      ...product,
      slug: slugify(product.name),
      sku: `LAP-SEED-${index + 1}`,
    }));

    await Product.bulkCreate(products);
    console.log(`Seeded ${products.length} products`);

    console.log("Seed data created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
