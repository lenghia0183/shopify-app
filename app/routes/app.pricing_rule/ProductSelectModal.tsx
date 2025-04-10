import { useFetcher } from "@remix-run/react";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Card,
  Checkbox,
  ResourceItem,
  ResourceList,
  Spinner,
  Thumbnail,
} from "@shopify/polaris";
import { type ProductListResponse } from "app/types/product";
import { useEffect, useState } from "react";

export interface ProductSelectModalProps {
  productModalOpen: boolean;
  setProductModalOpen: any;
  handleProductSelect: any;
}

const ProductSelectModal = ({
  productModalOpen,
  setProductModalOpen,
  handleProductSelect,
}: ProductSelectModalProps) => {
  const fetcher = useFetcher<ProductListResponse>();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (productModalOpen && fetcher.state === "idle" && !fetcher.data) {
      fetcher.load("/api/product");
    }

    if (fetcher?.data?.products?.edges?.length) {
      const fetchedProducts = fetcher.data.products.edges.map((edge: any) => {
        return edge.node;
      });
      setProducts(fetchedProducts);
    }
  }, [fetcher, productModalOpen]);

  return (
    <Modal
      open={productModalOpen}
      id="my-modal"
      onHide={() => {
        setProductModalOpen(false);
      }}
    >
      <TitleBar title="Select Products">
        <button onClick={() => setProductModalOpen(false)}>Đóng</button>
        <button variant="primary">Ok</button>
      </TitleBar>
      <Card>
        {fetcher.state === "loading" || fetcher.state === "submitting" ? (
          <BlockStack align="center" inlineAlign="center">
            <Spinner />
          </BlockStack>
        ) : (
          <ResourceList
            resourceName={{ singular: "product", plural: "products" }}
            items={products}
            renderItem={(item) => {
              const { id, title, images } = item;
              const media = (
                <Thumbnail
                  source={images?.edges[0]?.node?.originalSrc || ""}
                  alt={title}
                />
              );
              return (
                <ResourceItem onClick={() => {}} id={id} media={media}>
                  <Checkbox
                    label={title}
                    onChange={() => handleProductSelect(id)}
                  />
                </ResourceItem>
              );
            }}
          />
        )}
      </Card>
    </Modal>
  );
};

export default ProductSelectModal;
