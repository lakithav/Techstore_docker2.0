import mongoose from 'mongoose';
import { z } from 'zod';

// MongoDB Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  specifications: { type: String },
  category: { type: String, required: true, default: 'electronics' }
}, {
  timestamps: true
});

export const Product = mongoose.model('Product', productSchema);

// Zod Schema for validation
export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  stockQuantity: z.number().int().min(0),
  specifications: z.string().optional(),
  category: z.enum(['electronics', 'laptops', 'smartphones', 'accessories', 'tablets'])
});

// Types
export type ProductDocument = mongoose.Document & {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  specifications?: string;
  category: string;
};


export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;