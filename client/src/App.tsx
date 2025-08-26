import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { ProductGrid } from "@/components/product/product-grid";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import type { Product } from "@shared/schema";

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { cart, addToCart, updateQuantity, removeFromCart, openCart, closeCart } = useCart();
  const { toast } = useToast();

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    toast({
      title: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: `$${product.price}`,
      imageUrl: product.imageUrl,
    });
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      showToast('Your cart is empty!', 'info');
      return;
    }
    
    showToast('Checkout is a placeholder for demo purposes!', 'info');
    closeCart();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Header
            isAdminMode={isAdminMode}
            onToggleAdmin={() => setIsAdminMode(!isAdminMode)}
            cartItemCount={cart.itemCount}
            onOpenCart={openCart}
          />
          
          <main>
            {isAdminMode ? (
              <AdminTabs onShowToast={showToast} />
            ) : (
              <ProductGrid
                onAddToCart={handleAddToCart}
                onShowToast={showToast}
              />
            )}
          </main>

          <CartDrawer
            isOpen={cart.isOpen}
            items={cart.items}
            total={cart.total}
            onClose={closeCart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckout}
          />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
