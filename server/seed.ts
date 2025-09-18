import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { Product } from '@shared/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sampleProducts = [
  {
    name: "Gaming Laptop",
    description: "High-performance gaming laptop featuring the latest Intel i9 processor, RTX 4080 graphics card, and 32GB of DDR5 RAM. Perfect for gaming, content creation, and professional work.",
    price: 2499.00,
    imageUrl: "https://tse4.mm.bing.net/th/id/OIP.x6nTz4XiTSZRGnt-gkcPvgHaE7?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    stockQuantity: 25,
    specifications: "Intel Core i9-13900H, NVIDIA RTX 4080, 32GB DDR5, 1TB NVMe SSD, 15.6\" 165Hz QHD Display",
    category: "laptops"
  },
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone with A17 Pro chip and advanced camera system",
    price: 999.00,
    imageUrl: "https://static1.pocketnowimages.com/wordpress/wp-content/uploads/2023/09/pbi-iphone-15-pro-max.png",
    stockQuantity: 50,
    specifications: "A17 Pro chip, 6.1\" Super Retina XDR, Pro camera system, USB-C",
    category: "smartphones"
  },
  {
    name: "4K Gaming Monitor",
    description: "Professional 27-inch 4K monitor with HDR support",
    price: 699.00,
    imageUrl: "https://tse3.mm.bing.net/th/id/OIP.JWAd7uCvanrU28RgzzZvIwHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    stockQuantity: 30,
    specifications: "27\" 4K UHD, 144Hz, 1ms GTG, HDR600, G-SYNC Compatible",
    category: "accessories"
  },
  {
    name: "MacBook Air M2",
    description: "Apple MacBook Air with M2 chip, delivering blazing-fast performance in an ultra-thin design.",
    price: 1199.00,
    imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-config-20220606?wid=820&hei=498&fmt=jpeg&qlt=90&.v=1654122880566",
    stockQuantity: 40,
    specifications: "Apple M2 chip, 8-core CPU, 8-core GPU, 13.6\" Liquid Retina Display, 8GB RAM, 256GB SSD",
    category: "laptops"
  },
  {
    name: "Mechanical Keyboard",
    description: "Durable mechanical keyboard with customizable RGB lighting and tactile switches.",
    price: 129.00,
    imageUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    stockQuantity: 80,
    specifications: "RGB Backlit, Tactile Mechanical Switches, Full-size, USB-C connectivity",
    category: "accessories"
  }
];

export async function seedDatabase() {
  try {
    // Check if products already exist
    const productCount = await Product.countDocuments();
    
    if (productCount > 0) {
      console.log(`Database already has ${productCount} products, skipping seed`);
      console.log('\n🔍 View database contents at: http://localhost:5000/api/debug/db\n');
      return;
    }
    
    console.log('Starting database seed...');
    await Product.insertMany(sampleProducts);
    console.log(`Inserted ${sampleProducts.length} sample products`);
    console.log('\n🔍 View database contents at: http://localhost:5000/api/debug/db\n');
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Self-executing function for the seed script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Special case when running directly as a script
  (async () => {
    try {
      // Use in-memory MongoDB for development when running seed script directly
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      
      try {
        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        
        console.log('Connecting to in-memory MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to in-memory MongoDB');
        
        // Force re-seed by clearing the database first
        console.log('Clearing existing products...');
        await Product.deleteMany({});
        
        await seedDatabase();
        console.log('Seed completed successfully');
        process.exit(0);
      } catch (error) {
        console.error('Failed to start or connect to in-memory MongoDB:', error);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error during seed:', error);
      process.exit(1);
    }
  })();
}