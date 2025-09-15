import mongoose from 'mongoose';
import { Product } from '@shared/schema';

export class MongoStorage {
  async connect(uri: string) {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connection established');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async getProducts() {
    return await Product.find();
  }

  async getProduct(id: string) {
    return await Product.findById(id);
  }

  async createProduct(data: any) {
    const product = new Product(data);
    return await product.save();
  }

  async updateProduct(id: string, data: any) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteProduct(id: string) {
    const result = await Product.findByIdAndDelete(id);
    return result !== null;
  }
}

export const storage = new MongoStorage();
