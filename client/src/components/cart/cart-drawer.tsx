import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/lib/types";

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  total: number;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ 
  isOpen, 
  items, 
  total, 
  onClose, 
  onUpdateQuantity, 
  onRemoveItem,
  onCheckout 
}: CartDrawerProps) {
  return (
    <div 
      className={`cart-drawer fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card shadow-xl border-l border-border ${isOpen ? 'open' : ''}`}
      data-testid="drawer-cart"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground" data-testid="text-cart-title">
            Shopping Cart
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            data-testid="button-close-cart"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4" data-testid="list-cart-items">
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-8" data-testid="empty-cart">
                <ShoppingCart className="mx-auto h-12 w-12 mb-2" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              items.map(item => (
                <div 
                  key={item.id} 
                  className="border border-border rounded-lg p-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                      data-testid={`img-cart-item-${item.id}`}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="text-sm font-medium text-foreground truncate"
                        data-testid={`text-cart-item-name-${item.id}`}
                      >
                        {item.name}
                      </h4>
                      <p 
                        className="text-sm text-muted-foreground"
                        data-testid={`text-cart-item-price-${item.id}`}
                      >
                        {item.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        data-testid={`button-decrease-quantity-${item.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span 
                        className="w-8 text-center text-sm"
                        data-testid={`text-cart-item-quantity-${item.id}`}
                      >
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        data-testid={`button-increase-quantity-${item.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-border p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">Total:</span>
            <span 
              className="text-lg font-bold text-foreground"
              data-testid="text-cart-total"
            >
              ${total.toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full"
            disabled={items.length === 0}
            onClick={onCheckout}
            data-testid="button-checkout"
          >
            Checkout
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Checkout is a placeholder for demo purposes
          </p>
        </div>
      </div>
    </div>
  );
}
