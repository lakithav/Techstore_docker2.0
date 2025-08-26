import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger modal if clicking on add to cart button
    if ((e.target as HTMLElement).closest('[data-testid="button-add-to-cart"]')) {
      return;
    }
    onViewDetails(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div 
      className="product-card bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
      data-testid={`card-product-${product.id}`}
    >
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          data-testid={`img-product-${product.id}`}
        />
      </div>
      <div className="p-4">
        <h3 
          className="font-semibold text-foreground mb-1 truncate" 
          data-testid={`text-product-name-${product.id}`}
        >
          {product.name}
        </h3>
        <p 
          className="text-sm text-muted-foreground mb-2 line-clamp-2" 
          data-testid={`text-product-description-${product.id}`}
        >
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span 
            className="text-lg font-bold text-foreground" 
            data-testid={`text-product-price-${product.id}`}
          >
            ${product.price}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            data-testid="button-add-to-cart"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
