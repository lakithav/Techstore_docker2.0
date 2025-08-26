import { Header } from "@/components/layout/header";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { cart, updateQuantity, removeFromCart, openCart, closeCart } = useCart();
  const { toast } = useToast();

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    toast({
      title: message,
      variant: type === 'error' ? 'destructive' : 'default',
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
        isAdminMode={true}
        onToggleAdmin={() => {}} // Not used in admin page
        cartItemCount={cart.itemCount}
        onOpenCart={openCart}
      />
      
      <main>
        <AdminTabs onShowToast={showToast} />
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
