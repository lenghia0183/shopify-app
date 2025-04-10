// routes/api/search-products.tsx

import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `query productList {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            variants(first: 3) {
              edges {
                node {
                  id
                  title
                  price
                }
              }
            }
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
          }
        }
      }
    }`,
  );
  const data = await response.json();

  return data.data;
}
// const Test = () => {
//   return <div>Test</div>;
// };

// export default Test;
