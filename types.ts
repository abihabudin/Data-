export enum Category {
  ELECTRONICS = 'Electronics',
  FURNITURE = 'Furniture',
  CLOTHING = 'Clothing',
  OFFICE = 'Office Supplies',
  OTHER = 'Other'
}

export enum Status {
  IN_STOCK = 'In Stock',
  LOW_STOCK = 'Low Stock',
  OUT_OF_STOCK = 'Out of Stock',
  DISCONTINUED = 'Discontinued'
}

export interface DataRecord {
  id: string;
  productName: string;
  category: Category;
  quantity: number;
  price: number;
  dateAdded: string; // ISO Date string
  status: Status;
  notes?: string;
}

export type ViewState = 'dashboard' | 'entry' | 'list';