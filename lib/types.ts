export interface ProductSpec {
  "Case Size"?: string;
  "Mechanism"?: string;
  "Strap Type"?: string;
  "Color"?: string;
  "Dial"?: string;
  "Gender"?: string;
  "Diamond"?: string;
  "Bracelet"?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  slug: string;
  model: string;
  description: string;
  price: number;
  currency: string;
  spec: ProductSpec;
  images: string[];
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

export interface OrderInput {
  items: CartLine[];
  customer: {
    name: string;
    email: string;
    address: string;
    city: string;
    country: string;
    phone: string;
  };
}
