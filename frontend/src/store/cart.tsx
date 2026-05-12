import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product, CartItem, ProductVariant, BoxType, CardPackage, Occasion } from "@/types";

interface CartContextType {
  items: CartItem[];
  // Legacy support
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  // NEW: Flexible Framework
  addVariant: (
    variant: ProductVariant,
    customization?: CartItem["customization"],
    quantity?: number
  ) => void;
  removeVariant: (variantId: number) => void;
  updateVariantQuantity: (variantId: number, quantity: number) => void;
  updateCustomization: (variantId: number, customization: CartItem["customization"]) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  // Selected configuration (for configurator)
  selectedBoxType: BoxType | null;
  setSelectedBoxType: (boxType: BoxType | null) => void;
  selectedCardPackage: CardPackage | null;
  setSelectedCardPackage: (cardPackage: CardPackage | null) => void;
  selectedOccasion: Occasion | null;
  setSelectedOccasion: (occasion: Occasion | null) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // NEW: Configurator state
  const [selectedBoxType, setSelectedBoxTypeState] = useState<BoxType | null>(null);
  const [selectedCardPackage, setSelectedCardPackageState] = useState<CardPackage | null>(null);
  const [selectedOccasion, setSelectedOccasionState] = useState<Occasion | null>(null);

  // Legacy support
  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  // NEW: Flexible Framework functions
  const addVariant = useCallback((
    variant: ProductVariant,
    customization?: CartItem["customization"],
    quantity = 1
  ) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.variant?.id === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variant?.id === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        product: { id: variant.id, name: variant.name, price: variant.calculated_price } as Product,
        variant,
        box_type: variant.box_type,
        card_package: variant.card_package,
        occasion: variant.occasion || undefined,
        customization,
        quantity
      }];
    });
  }, []);

  const removeVariant = useCallback((variantId: number) => {
    setItems((prev) => prev.filter((item) => item.variant?.id !== variantId));
  }, []);

  const updateVariantQuantity = useCallback((variantId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.variant?.id !== variantId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.variant?.id === variantId ? { ...item, quantity } : item
      )
    );
  }, []);

  const updateCustomization = useCallback((
    variantId: number,
    customization: CartItem["customization"]
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.variant?.id === variantId ? { ...item, customization } : item
      )
    );
  }, []);

  const setSelectedBoxType = useCallback((boxType: BoxType | null) => {
    setSelectedBoxTypeState(boxType);
  }, []);

  const setSelectedCardPackage = useCallback((cardPackage: CardPackage | null) => {
    setSelectedCardPackageState(cardPackage);
  }, []);

  const setSelectedOccasion = useCallback((occasion: Occasion | null) => {
    setSelectedOccasionState(occasion);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedBoxTypeState(null);
    setSelectedCardPackageState(null);
    setSelectedOccasionState(null);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(
      item.variant?.calculated_price || item.product.price
    ) * item.quantity,
    0
  );

  return (
    <CartContext value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      addVariant,
      removeVariant,
      updateVariantQuantity,
      updateCustomization,
      clearCart,
      totalItems,
      totalPrice,
      selectedBoxType,
      setSelectedBoxType,
      selectedCardPackage,
      setSelectedCardPackage,
      selectedOccasion,
      setSelectedOccasion,
    }}>
      {children}
    </CartContext>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
