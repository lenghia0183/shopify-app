// routes/api.search-products.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const query = String(formData.get("query") || "");
  const cursor = formData.get("cursor")?.toString();
  const direction = formData.get("direction")?.toString();

  const paginationArg =
    direction === "prev" && cursor
      ? `last: 12, before: "${cursor}"`
      : direction === "next" && cursor
        ? `first: 12, after: "${cursor}"`
        : `first: 12`;

  const response = await admin.graphql(
    `query collectionList($query: String!) {
      collections(${paginationArg}, query: $query) {
        edges {
          node {
            id
            image {
              url
              altText
            }
            title
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
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
