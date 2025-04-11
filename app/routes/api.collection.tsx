// routes/api.search-products.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const query = String(formData.get("query") || "");

  const response = await admin.graphql(
    `query collectionList($query: String!) {
      collections(first: 10, query: $query) {
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
    {
      variables: { query },
    },
  );

  const data = await response.json();
  return json(data.data);
}
