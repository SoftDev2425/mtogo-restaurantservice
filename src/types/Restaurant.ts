export interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  categories: Category[];
}

interface Category {
  title: string;
}

interface Address {
  street: string;
  city: string;
  zip: string;
  x: Float32Array;
  y: Float32Array;
}
