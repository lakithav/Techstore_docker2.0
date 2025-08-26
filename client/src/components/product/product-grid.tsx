import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./product-card";
import { ProductModal } from "./product-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ProductGrid({ onAddToCart, onShowToast }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const categories = [
    { id: "all", label: "All Products" },
    { id: "laptops", label: "Laptops" },
    { id: "smartphones", label: "Smartphones" },
    { id: "accessories", label: "Accessories" },
    { id: "tablets", label: "Tablets" }
  ];

  const filteredProducts = categoryFilter === "all" 
    ? products 
    : products.filter(product => product.category === categoryFilter);

  const handleAddToCart = (product: Product) => {
    onAddToCart(product);
    onShowToast(`${product.name} added to cart!`, 'success');
  };

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 bg-muted rounded w-64 mb-2"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-8" data-testid="section-product-catalog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-catalog-title">
              Featured Products
            </h2>
            <p className="text-muted-foreground" data-testid="text-catalog-subtitle">
              Discover the latest in technology and electronics
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8" data-testid="filters-category">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={categoryFilter === category.id ? "default" : "secondary"}
                onClick={() => setCategoryFilter(category.id)}
                data-testid={`button-filter-${category.id}`}
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-products">
              <p className="text-muted-foreground">No products found for this category.</p>
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              data-testid="grid-products"
            >
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}
