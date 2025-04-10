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
import {
  type Collection,
  type CollectionListResponse,
} from "app/types/collection";

import { useEffect, useState } from "react";

export interface CollectionSelectModalProps {
  collectionModalOpen: boolean;
  setCollectionModalOpen: any;
  handleProductSelect: any;
}

const CollectionSelectModal = ({
  collectionModalOpen,
  setCollectionModalOpen,
  handleProductSelect,
}: CollectionSelectModalProps) => {
  const fetcher = useFetcher<CollectionListResponse>();
  const [products, setProducts] = useState<Collection[]>([]);

  useEffect(() => {
    if (collectionModalOpen && fetcher.state === "idle" && !fetcher.data) {
      fetcher.load("/api/collection");
    }

    if (fetcher?.data?.collections?.edges?.length) {
      const fetchedProducts = fetcher.data.collections.edges.map((edge) => {
        return edge.node;
      });
      setProducts(fetchedProducts);
    }
  }, [fetcher, collectionModalOpen]);

  return (
    <Modal
      open={collectionModalOpen}
      onHide={() => {
        setCollectionModalOpen(false);
      }}
    >
      <TitleBar title="Select Collections">
        <button onClick={() => setCollectionModalOpen(false)}>Đóng</button>
        <button variant="primary">Ok</button>
      </TitleBar>
      <Card>
        {fetcher.state === "loading" || fetcher.state === "submitting" ? (
          <BlockStack align="center" inlineAlign="center">
            <Spinner />
          </BlockStack>
        ) : (
          <ResourceList
            resourceName={{ singular: "collection", plural: "collection" }}
            items={products}
            renderItem={(item) => {
              const { title, image, id } = item;
              const media = (
                <Thumbnail source={image?.url || ""} alt={image?.altText} />
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

export default CollectionSelectModal;
