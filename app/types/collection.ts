import { type IPageInfo } from "./common";

export interface ICollection {
  id: string;
  title: string;
  image: {
    url: string;
    altText: string;
  };
  productsCount: {
    count: number;
  };
}
export interface ICollectionOptions {
  value: string;
  label: string;
  url?: string;
  altText?: string;
  productsCount?: number;
}
export interface ICollectionListResponse {
  collections: {
    edges: {
      node: ICollection;
    }[];

    pageInfo: IPageInfo;
  };
}
