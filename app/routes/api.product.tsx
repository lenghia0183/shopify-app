import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rawSearch = formData.get("search")?.toString() || "";
  const cursor = formData.get("cursor")?.toString();
  const direction = formData.get("direction")?.toString();

  const search = rawSearch.trim();
  const { admin } = await authenticate.admin(request);

  const paginationArg =
    direction === "prev" && cursor
      ? `last: 5, before: "${cursor}"`
      : direction === "next" && cursor
        ? `first: 5, after: "${cursor}"`
        : `first: 5`;

  const response = await admin.graphql(
    `query productList($query: String) {
      products(${paginationArg}, query: $query) {
        edges {
          cursor
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
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }`,
    {
      variables: {
        query: search ? `title:*${search}*` : undefined,
      },
    },
  );

  const data = await response.json();
  return data.data;
}
