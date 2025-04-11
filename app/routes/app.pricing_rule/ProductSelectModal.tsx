import { useFetcher } from "@remix-run/react";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Card,
  Icon,
  ResourceItem,
  ResourceList,
  Spinner,
  Thumbnail,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import FormikTextField from "app/components/FormikTextField";
import { useDebounce } from "app/hooks/useDebounce";
import { type IPageInfo } from "app/types/common";
import { type IPricingRuleFormValues } from "app/types/pricingRule";
import { type IProductListResponse } from "app/types/product";
import { useFormikContext } from "formik";
import { useEffect, useState } from "react";

export interface ProductSelectModalProps {
  productModalOpen: boolean;
  setProductModalOpen: (open: boolean) => void;
}

const ProductSelectModal = ({
  productModalOpen,
  setProductModalOpen,
}: ProductSelectModalProps) => {
  const fetcher = useFetcher<IProductListResponse>();
  const [products, setProducts] = useState<any[]>([]);
  const [cursors, setCursors] = useState<IPageInfo>({
    startCursor: null,
    endCursor: null,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const { setFieldValue, values } = useFormikContext<IPricingRuleFormValues>();
  const debouncedSearchProduct = useDebounce(
    values.searchSpecificProducts || "",
  );

  useEffect(() => {
    if (productModalOpen && fetcher.state === "idle") {
      const formData = new FormData();
      formData.append("search", debouncedSearchProduct);
      fetcher.submit(formData, {
        method: "post",
        action: "/api/product",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productModalOpen, debouncedSearchProduct]);

  useEffect(() => {
    const edges = fetcher.data?.products?.edges;

    if (edges && edges.length > 0) {
      const fetchedProducts = edges.map((edge) => edge.node);
      setProducts(fetchedProducts);
      setCursors({
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
        hasNextPage: fetcher?.data?.products?.pageInfo?.hasNextPage || false,
        hasPreviousPage:
          fetcher?.data?.products?.pageInfo?.hasPreviousPage || false,
      });
    } else {
      setProducts([]);
      setCursors({
        startCursor: null,
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    }
  }, [fetcher.data]);

  const handleConfirm = () => {
    setProductModalOpen(false);
  };

  const promotedBulkActions = [
    {
      content: "Edit customers",
      onAction: () => console.log("Todo: implement bulk edit"),
    },
  ];

  const handlePagination = (direction: "next" | "prev") => {
    const formData = new FormData();
    formData.append("search", debouncedSearchProduct);
    if (direction === "next" && cursors.endCursor) {
      formData.append("cursor", cursors.endCursor);
      formData.append("direction", "next");
    } else if (direction === "prev" && cursors.startCursor) {
      formData.append("cursor", cursors.startCursor);
      formData.append("direction", "prev");
    }

    fetcher.submit(formData, {
      method: "post",
      action: "/api/product",
    });
  };

  return (
    <Modal open={productModalOpen} onHide={() => setProductModalOpen(false)}>
      <TitleBar title="Select Products">
        <button onClick={() => setProductModalOpen(false)}>Đóng</button>
        <button onClick={handleConfirm}>Ok</button>
      </TitleBar>

      <Card>
        <BlockStack gap="300">
          <FormikTextField
            name="searchSpecificProducts"
            label="Search and select products"
            labelHidden
            placeholder="Click to select products"
            autoComplete="off"
            autoFocus
            prefix={<Icon source={SearchIcon} tone="base" />}
          />

          {fetcher.state === "loading" || fetcher.state === "submitting" ? (
            <BlockStack align="center" inlineAlign="center">
              <Spinner />
            </BlockStack>
          ) : (
            <ResourceList
              items={products}
              selectedItems={values.selectedProducts}
              onSelectionChange={(values) => {
                return setFieldValue("selectedProducts", values);
              }}
              promotedBulkActions={promotedBulkActions}
              resolveItemId={({ id }) => id}
              renderItem={renderProductItem}
              pagination={{
                hasNext: cursors.hasNextPage,
                hasPrevious: cursors.hasPreviousPage,
                onNext: () => handlePagination("next"),
                onPrevious: () => handlePagination("prev"),
              }}
            />
          )}
        </BlockStack>
      </Card>
    </Modal>
  );
};

function renderProductItem(item: any) {
  const { id, title, images } = item;
  const media = (
    <Thumbnail
      source={images?.edges?.[0]?.node?.originalSrc || ""}
      alt={title}
    />
  );

  return (
    <ResourceItem id={id} media={media} onClick={() => {}}>
      {title}
    </ResourceItem>
  );
}

export default ProductSelectModal;
