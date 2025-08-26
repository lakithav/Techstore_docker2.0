export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  itemCount: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  quantity: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
