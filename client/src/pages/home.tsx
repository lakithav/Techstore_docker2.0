import { useState } from "react";
import { Header } from "@/components/layout/header";
import { ProductGrid } from "@/components/product/product-grid";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function Home() {
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
    <div className="min-h-screen bg-background">
      <Header
        isAdminMode={false}
        onToggleAdmin={() => {}} // Not used in home page
        cartItemCount={cart.itemCount}
        onOpenCart={openCart}
      />
      
      <main>
        <ProductGrid
          onAddToCart={handleAddToCart}
          onShowToast={showToast}
        />
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
  );
}
