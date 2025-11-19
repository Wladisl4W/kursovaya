export interface User {
  id: number;
  email: string;
}

export interface Store {
  id: number;
  userId: number;
  type: string; // "wb" или "ozon"
  apiToken: string;
}

export interface Product {
  id: number;
  storeId: number;
  externalId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ProductMapping {
  id: number;
  product1Id: number;
  product2Id: number;
  userId: number;
}