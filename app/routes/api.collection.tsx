// routes/api/search-products.tsx

import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `query collectionList{
        collections (first: 10){
          edges {
            node {
              id
              image {
                url
                altText
              }
              title
            }
          }
        }
      }`,
  );
  const data = await response.json();
  // console.log("data", data);
  return data.data;
}
