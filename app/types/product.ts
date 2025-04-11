import { type IPageInfo } from "./common";

export interface IProduct {
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

export interface IProductListResponse {
  products: {
    edges: {
      node: IProduct;
      cursor: string;
    }[];
    pageInfo: IPageInfo;
  };
}

export type ProductTag = string;
export interface IProductTagOption {
  value: ProductTag;
  label: ProductTag;
}

export interface IProductTagListResponse {
  productTags: {
    edges: {
      node: ProductTag;
    }[];
    pageInfo: IPageInfo;
  };
}
