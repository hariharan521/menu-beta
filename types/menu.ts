export interface CafeSettings {
  cafeName: string;
  logoText: string;
  status: 'Open Now' | 'Closed';
  openingHours: string;
  phone: string;
  address: string;
  themeColor: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  badge?: 'Best Seller' | 'Chef Special' | 'New' | 'Spicy' | string;
}

export interface MenuData {
  cafeSettings: CafeSettings;
  categories: Category[];
  items: MenuItem[];
}
