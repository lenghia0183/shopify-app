import { type PageInfo } from "./common";

export interface Product {
  id: string;
  title: string;
  handle?: string;
  status?: string;
  totalInventory?: number;
  variants?: {
    edges: {
      node: {
        id: string;
        title: string;
        price: string;
      };
    }[];
  };
  images?: {
    edges: {
      node: {
        originalSrc: string;
        altText?: string;
      };
    }[];
  };
}

export interface ProductListResponse {
  products: {
    edges: {
      node: Product;
    }[];
    pageInfo: PageInfo;
  };
}

export type ProductTag = string;

export interface ProductTagListResponse {
  productTags: {
    edges: {
      node: ProductTag;
    }[];
    pageInfo: PageInfo;
  };
}
