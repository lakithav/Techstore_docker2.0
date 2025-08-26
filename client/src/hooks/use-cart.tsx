import { useState, useCallback, useEffect } from "react";
import type { CartItem, CartState } from "@/lib/types";

export function useCart() {
  const [cart, setCart] = useState<CartState>({
    items: [],
    isOpen: false,
    total: 0,
    itemCount: 0,
  });

  const calculateTotal = useCallback((items: CartItem[]) => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return sum + (price * item.quantity);
    }, 0);
  }, []);

  const calculateItemCount = useCallback((items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, []);

  useEffect(() => {
    setCart(prev => ({
      ...prev,
      total: calculateTotal(prev.items),
      itemCount: calculateItemCount(prev.items),
    }));
  }, [cart.items, calculateTotal, calculateItemCount]);

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.id === product.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = prev.items.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prev.items, { ...product, quantity: 1 }];
      }
      
      return {
        ...prev,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    });
  }, [calculateTotal, calculateItemCount]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.id !== productId);
      return {
        ...prev,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    });
  }, [calculateTotal, calculateItemCount]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => {
      const newItems = prev.items.map(item =>
        item.id === productId 
          ? { ...item, quantity }
          : item
      );
      return {
        ...prev,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    });
  }, [calculateTotal, calculateItemCount, removeFromCart]);

  const openCart = useCallback(() => {
    setCart(prev => ({ ...prev, isOpen: true }));
  }, []);

  const closeCart = useCallback(() => {
    setCart(prev => ({ ...prev, isOpen: false }));
  }, []);

  const clearCart = useCallback(() => {
    setCart(prev => ({
      ...prev,
      items: [],
      total: 0,
      itemCount: 0,
    }));
  }, []);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    openCart,
    closeCart,
    clearCart,
  };
}
