import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertProductSchema, type Product, type InsertProduct } from "@shared/schema";

interface ProductFormProps {
  product?: Product | null;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onSuccess?: () => void;
}

// Modify the form schema to handle the price as a string in the form
const formSchema = insertProductSchema.extend({
  price: insertProductSchema.shape.price,
  stockQuantity: insertProductSchema.shape.stockQuantity,
});

export function ProductForm({ product, onShowToast, onSuccess }: ProductFormProps) {
  const isEditing = !!product;

  const form = useForm<InsertProduct>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      imageUrl: product?.imageUrl || "",
      stockQuantity: product?.stockQuantity || 0,
      specifications: product?.specifications || "",
      category: product?.category || "electronics",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      // Convert price to number before sending to API
      const formattedData = {
        ...data,
        price: Number(data.price),
        stockQuantity: Number(data.stockQuantity)
      };
      await apiRequest("POST", "/api/products", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onShowToast(
        "Product created successfully",
        "success"
      );
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      onShowToast("Failed to create product", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      if (!product) return;
      
      // Convert price to number before sending to API
      const formattedData = {
        ...data,
        price: Number(data.price),
        stockQuantity: Number(data.stockQuantity)
      };
      
      // Use _id for MongoDB if it exists, otherwise fall back to id
      const productId = product._id || product.id;
      await apiRequest("PUT", `/api/products/${productId}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onShowToast(
        "Product updated successfully",
        "success"
      );
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      onShowToast("Failed to update product", "error");
    },
  });

  const onSubmit = (data: InsertProduct) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6" data-testid="form-product">
      <h3 className="text-lg font-semibold text-foreground mb-6" data-testid="text-form-title">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter product name" 
                      {...field} 
                      data-testid="input-product-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      value={field.value}
                      data-testid="input-product-price"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    rows={3} 
                    placeholder="Enter product description" 
                    {...field}
                    data-testid="input-product-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="https://example.com/image.jpg" 
                      {...field}
                      data-testid="input-product-image-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      data-testid="input-product-stock"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-product-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="laptops">Laptops</SelectItem>
                    <SelectItem value="smartphones">Smartphones</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="tablets">Tablets</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="specifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technical Specifications</FormLabel>
                <FormControl>
                  <Textarea 
                    rows={4} 
                    placeholder="Enter detailed specifications (separate with commas)" 
                    {...field}
                    data-testid="input-product-specifications"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              data-testid="button-submit-product"
            >
              {isLoading ? "Saving..." : (isEditing ? "Update Product" : "Add Product")}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => form.reset()}
              data-testid="button-clear-form"
            >
              Clear Form
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
