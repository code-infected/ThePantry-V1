// types.ts
export interface PantryItem {
    id: string;
    userId: string;
    name: string;
    quantity: string;
    category: string;
    expDate: string;
    unit: string;
    imageUrl?: string; // Optional
  }
  