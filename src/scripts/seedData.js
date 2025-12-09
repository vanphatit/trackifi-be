import connectDB, { sequelize } from "../config/database.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import { ROLES } from "../constants/roles.js";
import { slugify } from "../utils/slugify.js";

const seedData = async () => {
  try {
    await connectDB();
    // Drop and recreate all tables without FK conflicts during seeding
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    try {
      await sequelize.sync({ force: true });
    } finally {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    }

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
      // Gaming Laptops (10 products)
      {
        name: "ASUS ROG Strix G18 2024",
        brand: "ASUS",
        price: 59990000,
        discountPercent: 5,
        stock: 25,
        soldCount: 45,
        shortDescription: "i9-14900HX | RTX 4070 8GB | RAM 32GB | SSD 1TB",
        description:
          "Laptop gaming 18 inch với tản nhiệt buồng hơi mới, bàn phím full-size và dải LED Aura Sync.",
        specs: {
          cpu: "Intel Core i9-14900HX",
          gpu: "NVIDIA GeForce RTX 4070 8GB",
          ram: "32GB DDR5 5600MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: '18" QHD+ 240Hz',
          weight: "3 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },
      {
        name: "MSI Raider GE78HX 13V",
        brand: "MSI",
        price: 75990000,
        discountPercent: 10,
        stock: 18,
        soldCount: 32,
        shortDescription: "i9-13980HX | RTX 4090 16GB | RAM 64GB | SSD 2TB",
        description:
          "Laptop gaming cao cấp với RGB Mystic Light, màn hình Mini LED 240Hz.",
        specs: {
          cpu: "Intel Core i9-13980HX",
          gpu: "NVIDIA GeForce RTX 4090 16GB",
          ram: "64GB DDR5 5600MHz",
          storage: "2TB PCIe 4.0 SSD",
          display: '17.3" QHD 240Hz Mini LED',
          weight: "3.1 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },
      {
        name: "Acer Predator Helios 18",
        brand: "Acer",
        price: 64990000,
        discountPercent: 8,
        stock: 20,
        soldCount: 28,
        shortDescription: "i9-14900HX | RTX 4080 12GB | RAM 32GB | SSD 1TB",
        description:
          "Gaming laptop với tản nhiệt AeroBlade 3D Gen 6, RGB PredatorSense.",
        specs: {
          cpu: "Intel Core i9-14900HX",
          gpu: "NVIDIA GeForce RTX 4080 12GB",
          ram: "32GB DDR5 5600MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: '18" WQXGA 250Hz',
          weight: "3.2 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800",
          "https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=800",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },
      {
        name: "Gigabyte AORUS 17X",
        brand: "Gigabyte",
        price: 69990000,
        discountPercent: 12,
        stock: 15,
        soldCount: 22,
        shortDescription: "i9-13950HX | RTX 4090 16GB | RAM 32GB | SSD 2TB",
        description:
          "Gaming laptop cao cấp với màn hình 360Hz, bàn phím cơ AORUS.",
        specs: {
          cpu: "Intel Core i9-13950HX",
          gpu: "NVIDIA GeForce RTX 4090 16GB",
          ram: "32GB DDR5 5600MHz",
          storage: "2TB PCIe 4.0 SSD",
          display: '17.3" FHD 360Hz',
          weight: "2.8 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
          "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },
      {
        name: "Razer Blade 16 2024",
        brand: "Razer",
        price: 82990000,
        discountPercent: 5,
        stock: 12,
        soldCount: 18,
        shortDescription: "i9-14900HX | RTX 4080 | RAM 32GB | SSD 1TB",
        description:
          "Gaming laptop siêu mỏng với màn hình Mini LED 240Hz, khung nhôm CNC.",
        specs: {
          cpu: "Intel Core i9-14900HX",
          gpu: "NVIDIA GeForce RTX 4080 12GB",
          ram: "32GB DDR5 5600MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: '16" QHD+ 240Hz Mini LED',
          weight: "2.45 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },
      {
        name: "Alienware m18 R2",
        brand: "Dell",
        price: 89990000,
        discountPercent: 7,
        stock: 10,
        soldCount: 15,
        shortDescription: "i9-14900HX | RTX 4090 | RAM 64GB | SSD 4TB",
        description: "Gaming laptop flagship với AlienFX RGB, màn hình 480Hz.",
        specs: {
          cpu: "Intel Core i9-14900HX",
          gpu: "NVIDIA GeForce RTX 4090 16GB",
          ram: "64GB DDR5 5600MHz",
          storage: "4TB PCIe 4.0 SSD",
          display: '18" FHD 480Hz',
          weight: "3.7 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800",
          "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=800",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },
      {
        name: "Lenovo Legion Pro 7i Gen 9",
        brand: "Lenovo",
        price: 72990000,
        discountPercent: 9,
        stock: 22,
        soldCount: 35,
        shortDescription: "i9-14900HX | RTX 4080 | RAM 32GB | SSD 1TB",
        description:
          "Gaming laptop với Legion Coldfront 5.0, màn hình Mini LED.",
        specs: {
          cpu: "Intel Core i9-14900HX",
          gpu: "NVIDIA GeForce RTX 4080 12GB",
          ram: "32GB DDR5 5600MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: '16" WQXGA 240Hz Mini LED',
          weight: "2.55 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=800",
          "https://images.unsplash.com/photo-1605300276725-e5c0c46c42c9?w=800",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },
      {
        name: "HP Omen 17 2024",
        brand: "HP",
        price: 54990000,
        discountPercent: 6,
        stock: 28,
        soldCount: 42,
        shortDescription: "i7-14700HX | RTX 4070 | RAM 32GB | SSD 1TB",
        description:
          "Gaming laptop với Omen Tempest Cooling, Bang & Olufsen audio.",
        specs: {
          cpu: "Intel Core i7-14700HX",
          gpu: "NVIDIA GeForce RTX 4070 8GB",
          ram: "32GB DDR5 5600MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: '17.3" QHD 165Hz',
          weight: "2.78 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
          "https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },
      {
        name: "ASUS TUF Gaming A17",
        brand: "ASUS",
        price: 38990000,
        discountPercent: 15,
        stock: 35,
        soldCount: 68,
        shortDescription: "Ryzen 9 7940HS | RTX 4060 | RAM 16GB | SSD 512GB",
        description:
          "Gaming laptop giá rẻ với độ bền MIL-STD-810H, tản nhiệt Arc Flow.",
        specs: {
          cpu: "AMD Ryzen 9 7940HS",
          gpu: "NVIDIA GeForce RTX 4060 8GB",
          ram: "16GB DDR5 4800MHz",
          storage: "512GB PCIe 4.0 SSD",
          display: '17.3" FHD 144Hz',
          weight: "2.6 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },
      {
        name: "MSI Cyborg 15",
        brand: "MSI",
        price: 29990000,
        discountPercent: 10,
        stock: 40,
        soldCount: 85,
        shortDescription: "i7-13620H | RTX 4050 | RAM 16GB | SSD 512GB",
        description:
          "Gaming laptop entry-level với thiết kế trong suốt độc đáo.",
        specs: {
          cpu: "Intel Core i7-13620H",
          gpu: "NVIDIA GeForce RTX 4050 6GB",
          ram: "16GB DDR5 4800MHz",
          storage: "512GB PCIe 4.0 SSD",
          display: '15.6" FHD 144Hz',
          weight: "1.98 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
        ],
        categoryId: categoryMap["gaming-laptops"],
      },

      // Ultrabook & Office (7 products)
      {
        name: "Dell XPS 15 9530 OLED",
        brand: "Dell",
        price: 52990000,
        discountPercent: 0,
        stock: 15,
        soldCount: 38,
        shortDescription: "i7-13700H | RTX 4070 | RAM 32GB | SSD 1TB",
        description:
          "Ultrabook cao cấp với màn hình OLED 3.5K, khung nhôm nguyên khối.",
        specs: {
          cpu: "Intel Core i7-13700H",
          gpu: "NVIDIA GeForce RTX 4070 8GB",
          ram: "32GB DDR5 5200MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: '15.6" 3.5K OLED Touch',
          weight: "1.86 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
          "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800",
        ],
        categoryId: categoryMap["ultrabook-office"],
      },
      {
        name: "MacBook Air M3 15-inch",
        brand: "Apple",
        price: 42990000,
        discountPercent: 5,
        stock: 30,
        soldCount: 95,
        shortDescription: "M3 8-core | 10-core GPU | RAM 16GB | SSD 512GB",
        description: "Ultrabook siêu mỏng với chip Apple M3, pin 18 giờ.",
        specs: {
          cpu: "Apple M3 8-core",
          gpu: "Apple M3 10-core GPU",
          ram: "16GB Unified Memory",
          storage: "512GB SSD",
          display: '15.3" Liquid Retina 2880x1864',
          weight: "1.51 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
        ],
        categoryId: categoryMap["ultrabook-office"],
      },
      {
        name: "LG Gram 17 2024",
        brand: "LG",
        price: 48990000,
        discountPercent: 8,
        stock: 22,
        soldCount: 29,
        shortDescription: "i7-1360P | Iris Xe | RAM 16GB | SSD 1TB",
        description:
          "Ultrabook siêu nhẹ 1.35kg với màn hình 17 inch, pin 20 giờ.",
        specs: {
          cpu: "Intel Core i7-1360P",
          gpu: "Intel Iris Xe Graphics",
          ram: "16GB LPDDR5 6000MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: '17" WQXGA IPS',
          weight: "1.35 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
        ],
        categoryId: categoryMap["ultrabook-office"],
      },
      {
        name: "Lenovo ThinkPad X1 Carbon Gen 12",
        brand: "Lenovo",
        price: 54990000,
        discountPercent: 3,
        stock: 18,
        soldCount: 33,
        shortDescription: "i7-1365U | Iris Xe | RAM 32GB | SSD 1TB",
        description:
          "Business ultrabook với bàn phím TrackPoint, MIL-STD-810H.",
        specs: {
          cpu: "Intel Core i7-1365U",
          gpu: "Intel Iris Xe Graphics",
          ram: "32GB LPDDR5 6400MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: '14" WUXGA IPS Touch',
          weight: "1.12 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=800",
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
        ],
        categoryId: categoryMap["ultrabook-office"],
      },
      {
        name: "HP Spectre x360 14",
        brand: "HP",
        price: 47990000,
        discountPercent: 6,
        stock: 20,
        soldCount: 27,
        shortDescription: "i7-1355U | Iris Xe | RAM 16GB | SSD 1TB",
        description: "Ultrabook 2-in-1 với màn hình OLED 3K, bút HP Pen.",
        specs: {
          cpu: "Intel Core i7-1355U",
          gpu: "Intel Iris Xe Graphics",
          ram: "16GB LPDDR4x 4266MHz",
          storage: "1TB PCIe 4.0 SSD",
          display: '13.5" 3K2K OLED Touch',
          weight: "1.39 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
          "https://images.unsplash.com/photo-1515343480029-43cdfe6b6aae?w=800",
        ],
        categoryId: categoryMap["ultrabook-office"],
      },
      {
        name: "ASUS Zenbook 14 OLED",
        brand: "ASUS",
        price: 32990000,
        discountPercent: 12,
        stock: 35,
        soldCount: 58,
        shortDescription: "Ryzen 7 7730U | Radeon | RAM 16GB | SSD 512GB",
        description: "Ultrabook giá tốt với màn hình OLED 2.8K, pin 15 giờ.",
        specs: {
          cpu: "AMD Ryzen 7 7730U",
          gpu: "AMD Radeon Graphics",
          ram: "16GB LPDDR4x 4266MHz",
          storage: "512GB PCIe 3.0 SSD",
          display: '14" 2.8K OLED',
          weight: "1.39 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
          "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=800",
        ],
        categoryId: categoryMap["ultrabook-office"],
      },
      {
        name: "Microsoft Surface Laptop 5",
        brand: "Microsoft",
        price: 38990000,
        discountPercent: 7,
        stock: 25,
        soldCount: 44,
        shortDescription: "i7-1255U | Iris Xe | RAM 16GB | SSD 512GB",
        description: "Ultrabook với màn hình PixelSense Touch 2256x1504.",
        specs: {
          cpu: "Intel Core i7-1255U",
          gpu: "Intel Iris Xe Graphics",
          ram: "16GB LPDDR5x 5200MHz",
          storage: "512GB PCIe 4.0 SSD",
          display: '13.5" PixelSense Touch',
          weight: "1.27 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        ],
        categoryId: categoryMap["ultrabook-office"],
      },

      // Workstation (5 products)
      {
        name: "Lenovo ThinkPad P16 Gen2",
        brand: "Lenovo",
        price: 67990000,
        discountPercent: 7,
        stock: 10,
        soldCount: 12,
        shortDescription: "Xeon W-11855M | RTX A3000 | RAM 64GB | SSD 2TB",
        description: "Máy trạm di động đạt chứng nhận ISV, bàn phím ThinkPad.",
        specs: {
          cpu: "Intel Xeon W-11855M",
          gpu: "NVIDIA RTX A3000 12GB",
          ram: "64GB DDR5 4800MHz",
          storage: "2TB PCIe 4.0 SSD",
          display: '16" WQUXGA 600 nits',
          weight: "2.95 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=800",
          "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800",
        ],
        categoryId: categoryMap["workstation"],
      },
      {
        name: "Dell Precision 7780",
        brand: "Dell",
        price: 85990000,
        discountPercent: 5,
        stock: 8,
        soldCount: 9,
        shortDescription: "i9-13950HX | RTX 5000 Ada | RAM 128GB | SSD 4TB",
        description: "Workstation cao cấp với chứng nhận ISV, bàn phím số.",
        specs: {
          cpu: "Intel Core i9-13950HX",
          gpu: "NVIDIA RTX 5000 Ada 16GB",
          ram: "128GB DDR5 5600MHz",
          storage: "4TB PCIe 4.0 SSD",
          display: '17.3" UHD+ 500 nits',
          weight: "3.37 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1587202372634-32fa0c60c10c?w=800",
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
        ],
        categoryId: categoryMap["workstation"],
      },
      {
        name: "HP ZBook Fury 16 G10",
        brand: "HP",
        price: 92990000,
        discountPercent: 4,
        stock: 6,
        soldCount: 7,
        shortDescription: "i9-13950HX | RTX 5000 Ada | RAM 128GB | SSD 4TB",
        description:
          "Workstation flagship với DreamColor display, MIL-STD-810H.",
        specs: {
          cpu: "Intel Core i9-13950HX",
          gpu: "NVIDIA RTX 5000 Ada 16GB",
          ram: "128GB DDR5 5600MHz",
          storage: "4TB PCIe 4.0 SSD",
          display: '16" UHD+ DreamColor 1000 nits',
          weight: "2.65 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
        ],
        categoryId: categoryMap["workstation"],
      },
      {
        name: "MSI CreatorPro Z17 HX Studio",
        brand: "MSI",
        price: 78990000,
        discountPercent: 6,
        stock: 7,
        soldCount: 8,
        shortDescription: "i9-13950HX | RTX 4000 Ada | RAM 64GB | SSD 2TB",
        description: "Workstation creator với màn hình Mini LED 4K 120Hz.",
        specs: {
          cpu: "Intel Core i9-13950HX",
          gpu: "NVIDIA RTX 4000 Ada 8GB",
          ram: "64GB DDR5 5600MHz",
          storage: "2TB PCIe 4.0 SSD",
          display: '17" UHD 120Hz Mini LED',
          weight: "2.49 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800",
          "https://images.unsplash.com/photo-1587202372634-32fa0c60c10c?w=800",
        ],
        categoryId: categoryMap["workstation"],
      },
      {
        name: "ASUS ProArt Studiobook 16 OLED",
        brand: "ASUS",
        price: 69990000,
        discountPercent: 8,
        stock: 12,
        soldCount: 15,
        shortDescription: "i9-13980HX | RTX 4070 | RAM 64GB | SSD 2TB",
        description:
          "Workstation creator với màn hình OLED 4K Pantone Validated.",
        specs: {
          cpu: "Intel Core i9-13980HX",
          gpu: "NVIDIA GeForce RTX 4070 8GB",
          ram: "64GB DDR5 4800MHz",
          storage: "2TB PCIe 4.0 SSD",
          display: '16" UHD OLED Pantone',
          weight: "2.4 kg",
        },
        images: [
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
          "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=800",
        ],
        categoryId: categoryMap["workstation"],
      },
    ].map((product, index) => ({
      ...product,
      slug: slugify(product.name),
      sku: `LAP-SEED-${String(index + 1).padStart(3, "0")}`,
    }));

    const createdProducts = await Product.bulkCreate(products, {
      returning: true,
    });
    console.log(`Seeded ${createdProducts.length} products`);

    // Create orders (25+ orders)
    const customerUser = await User.findOne({
      where: { roleId: ROLES.CUSTOMER },
    });

    const orderStatuses = [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "COMPLETED",
      "CANCELLED",
    ];
    const paymentMethods = ["COD", "BANK_TRANSFER"];
    const addresses = [
      "123 Nguyễn Văn Linh, Q7, TP.HCM",
      "456 Lê Lợi, Q1, TP.HCM",
      "789 Trần Hưng Đạo, Q5, TP.HCM",
      "321 Võ Văn Tần, Q3, TP.HCM",
      "654 Nguyễn Thị Minh Khai, Q1, TP.HCM",
      "987 Hai Bà Trưng, Q1, TP.HCM",
      "147 Phan Xích Long, Phú Nhuận, TP.HCM",
      "258 Hoàng Văn Thụ, Tân Bình, TP.HCM",
      "369 Cộng Hòa, Tân Bình, TP.HCM",
      "741 Lý Thường Kiệt, Q10, TP.HCM",
    ];

    const orders = [];
    const orderItems = [];

    for (let i = 0; i < 30; i++) {
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const orderProducts = [];
      let subtotal = 0;

      // Select random products for this order
      for (let j = 0; j < numItems; j++) {
        const randomProduct =
          createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
        const discountMultiplier =
          1 - Number(randomProduct.discountPercent || 0) / 100;
        const unitPrice = Number(randomProduct.price) * discountMultiplier;
        const totalPrice = unitPrice * quantity;

        subtotal += totalPrice;
        orderProducts.push({
          productId: randomProduct.id,
          productName: randomProduct.name,
          quantity,
          unitPrice,
          totalPrice,
        });
      }

      const shippingFee = subtotal >= 20000000 ? 0 : 50000;
      const totalAmount = subtotal + shippingFee;
      const status =
        orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

      // Create dates in the past 3 months
      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      orders.push({
        userId: customerUser.id,
        status,
        subtotal,
        shippingFee,
        totalAmount,
        recipientName: `Khách hàng ${i + 1}`,
        shippingAddress: addresses[i % addresses.length],
        contactPhone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
        paymentMethod:
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        notes: i % 3 === 0 ? "Giao giờ hành chính" : null,
        createdAt,
        updatedAt: createdAt,
        products: orderProducts,
      });
    }

    // Create orders with items
    for (const orderData of orders) {
      const { products: orderProducts, ...orderFields } = orderData;
      const order = await Order.create(orderFields);

      const items = orderProducts.map((item) => ({
        ...item,
        orderId: order.id,
      }));

      await OrderItem.bulkCreate(items);
    }

    console.log(`Seeded ${orders.length} orders`);

    console.log("Seed data created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
