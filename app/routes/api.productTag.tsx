// routes/api/search-products.tsx

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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

export async function action({ request }: ActionFunctionArgs) {
  console.log("action productTagList");
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();

  const tags = formData.get("tags")?.toString() || "";
  const id =
    formData.get("id")?.toString() || "gid://shopify/Product/8402732023964";

  const response = await admin.graphql(
    `#graphql
    mutation addTags($id: ID!, $tags: [String!]!) {
      tagsAdd(id: $id, tags: $tags) {
        node {
          id
        }
      }
    }`,
    {
      variables: {
        id,
        tags: tags.split(",").map((t) => t.trim()),
      },
    },
  );

  const data = await response.json();
  console.log("data", data);
  return data;
}
