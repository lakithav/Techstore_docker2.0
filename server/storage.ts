import { type Product, type InsertProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Product CRUD operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;

  constructor() {
    this.products = new Map();
    
    // Initialize with sample products
    this.initializeProducts();
  }

  private async initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Gaming Laptop Pro",
        description: "High-performance gaming laptop featuring the latest Intel i9 processor, RTX 4080 graphics card, and 32GB of DDR5 RAM. Perfect for gaming, content creation, and professional work.",
        price: "2499.00",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        stockQuantity: 25,
        specifications: "Intel Core i9-13900H, NVIDIA RTX 4080, 32GB DDR5, 1TB NVMe SSD, 15.6\" 165Hz QHD Display",
        category: "laptops"
      },
      {
        name: "iPhone 15 Pro",
        description: "Latest iPhone with A17 Pro chip and advanced camera system",
        price: "999.00",
        imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        stockQuantity: 50,
        specifications: "A17 Pro chip, 6.1\" Super Retina XDR, Pro camera system, USB-C",
        category: "smartphones"
      },
      {
        name: "AirPods Pro 2",
        description: "Premium wireless earbuds with active noise cancellation",
        price: "249.00",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        stockQuantity: 100,
        specifications: "Active Noise Cancellation, Spatial Audio, Up to 30 hours battery life",
        category: "accessories"
      },
      {
        name: "4K Monitor 27\"",
        description: "Professional 4K monitor with IPS panel and HDR support",
        price: "549.00",
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        stockQuantity: 30,
        specifications: "27\" 4K IPS, 144Hz, HDR10, USB-C, Height adjustable",
        category: "accessories"
      },
      {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with premium switches",
        price: "129.00",
        imageUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        stockQuantity: 75,
        specifications: "Cherry MX Blue switches, RGB backlighting, USB-C, Aluminum frame",
        category: "accessories"
      },
      {
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with high precision sensor",
        price: "79.00",
        imageUrl: "https://pixabay.com/get/gc8d86bd126bb30d1339510d73856bec263c385759f6c449e71d9657383609e317a4e46c27ac061f312358ccb75700d1410c2d0da7ee011ab0efb2462a556c6e9_1280.jpg",
        stockQuantity: 120,
        specifications: "12000 DPI sensor, Ergonomic design, 70-hour battery life, USB-C charging",
        category: "accessories"
      },
      {
        name: "iPad Pro 12.9\"",
        description: "Powerful tablet with M2 chip for creative professionals",
        price: "1099.00",
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        stockQuantity: 40,
        specifications: "M2 chip, 12.9\" Liquid Retina XDR, 256GB, WiFi 6E, Apple Pencil support",
        category: "tablets"
      },
      {
        name: "4K Webcam",
        description: "Professional 4K webcam with auto-focus and built-in microphone",
        price: "199.00",
        imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        stockQuantity: 60,
        specifications: "4K 30fps, Auto-focus, Built-in dual microphones, USB 3.0",
        category: "accessories"
      }
    ];

    for (const product of sampleProducts) {
      await this.createProduct(product);
    }
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct: Product = { ...existingProduct, ...updateData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }
}

export const storage = new MemStorage();
