import { X, ShoppingCart, Heart, Truck, RotateCcw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    onClose();
  };

  const parseSpecifications = (specs: string | null) => {
    if (!specs) return [];
    
    return specs.split(', ').map(spec => {
      const [key, value] = spec.split(': ');
      return { key: key || spec, value: value || '' };
    });
  };

  const specifications = parseSpecifications(product.specifications);

  return (
    <div 
      className="fixed inset-0 bg-black/50 modal-backdrop z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      data-testid="modal-product-detail"
    >
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square">
              <img 
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                data-testid="img-modal-product"
              />
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h2 
                  className="text-2xl font-bold text-foreground mb-2"
                  data-testid="text-modal-product-name"
                >
                  {product.name}
                </h2>
                <p 
                  className="text-3xl font-bold text-primary"
                  data-testid="text-modal-product-price"
                >
                  ${product.price}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                <p 
                  className="text-muted-foreground"
                  data-testid="text-modal-product-description"
                >
                  {product.description}
                </p>
              </div>
              
              {specifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Specifications</h3>
                  <div className="space-y-2 text-sm" data-testid="specs-modal-product">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-muted-foreground">{spec.key}:</span>
                        <span className="text-foreground">{spec.value || spec.key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  data-testid="button-modal-add-to-cart"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  data-testid="button-favorite"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center">
                  <Truck className="mr-2 h-4 w-4" />
                  Free shipping on orders over $500
                </p>
                <p className="flex items-center">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  30-day return policy
                </p>
                <p className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  2-year warranty included
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
