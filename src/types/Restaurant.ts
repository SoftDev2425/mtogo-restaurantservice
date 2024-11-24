export interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  categories: Category[];
}

interface Category {
  title: string;
}
