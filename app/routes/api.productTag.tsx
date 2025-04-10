// routes/api/search-products.tsx

import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `query productTagList{
        productTags (first: 10){
          edges {
            node 
          }
        }
      }`,
  );
  const data = await response.json();
  return data.data;
}
