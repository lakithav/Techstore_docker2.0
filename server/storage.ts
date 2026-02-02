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
    try {
      console.log("Storage: Deleting product with ID:", id);
      // Check if ID is valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error("Invalid MongoDB ObjectId:", id);
        return false;
      }

      const result = await Product.findByIdAndDelete(id);
      console.log("Delete result:", result);
      return result !== null;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }
}

export const storage = new MongoStorage();
