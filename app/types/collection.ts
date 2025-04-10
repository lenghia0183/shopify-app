import { type PageInfo } from "./common";

export interface Collection {
  id: string;
  image: {
    url: string;
    altText: string;
  };
  title: string;
}
export interface CollectionOptions {
  value: string;
  label: string;
  url?: string;
}
export interface CollectionListResponse {
  collections: {
    edges: {
      node: Collection;
    }[];
    pageInfo: PageInfo;
  };
}
