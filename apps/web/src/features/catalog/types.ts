import type { CartItem, Product } from '@/api/types';

export interface ProductCardProps {
  product: Product;
  item?: CartItem;
  busy: boolean;
  onSetQuantity: (quantity: number) => void;
  onRemove: () => void;
}
