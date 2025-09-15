import { Product } from '@shared/schema';

const sampleProducts = [
  {
    name: "Gaming Laptop Pro",
    description: "High-performance gaming laptop featuring the latest Intel i9 processor, RTX 4080 graphics card, and 32GB of DDR5 RAM. Perfect for gaming, content creation, and professional work.",
    price: 2499.00,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    stockQuantity: 25,
    specifications: "Intel Core i9-13900H, NVIDIA RTX 4080, 32GB DDR5, 1TB NVMe SSD, 15.6\" 165Hz QHD Display",
    category: "laptops"
  },
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone with A17 Pro chip and advanced camera system",
    price: 999.00,
    imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    stockQuantity: 50,
    specifications: "A17 Pro chip, 6.1\" Super Retina XDR, Pro camera system, USB-C",
    category: "smartphones"
  },
  {
    name: "4K Gaming Monitor",
    description: "Professional 27-inch 4K monitor with HDR support",
    price: 699.00,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    stockQuantity: 30,
    specifications: "27\" 4K UHD, 144Hz, 1ms GTG, HDR600, G-SYNC Compatible",
    category: "accessories"
  }
];

export async function seedDatabase() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    
    // Insert sample products
    await Product.insertMany(sampleProducts);
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}