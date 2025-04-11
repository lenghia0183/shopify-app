import { type IPageInfo } from "./common";

export interface ICollection {
  id: string;
  image: {
    url: string;
    altText: string;
  };
  title: string;
}
export interface ICollectionOptions {
  value: string;
  label: string;
  url?: string;
  altText?: string;
}
export interface ICollectionListResponse {
  collections: {
    edges: {
      node: ICollection;
    }[];
    pageInfo: IPageInfo;
  };
}
