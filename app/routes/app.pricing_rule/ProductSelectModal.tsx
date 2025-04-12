import { useFetcher } from "@remix-run/react";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Card,
  Icon,
  ResourceItem,
  ResourceList,
  Spinner,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import FormikTextField from "app/components/FormikTextField";
import { useDebounce } from "app/hooks/useDebounce";
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
    if (direction === "next" && fetcher.data?.products.pageInfo.endCursor) {
      formData.append("cursor", fetcher.data.products.pageInfo.endCursor);
      formData.append("direction", "next");
    } else if (
      direction === "prev" &&
      fetcher.data?.products.pageInfo.startCursor
    ) {
      formData.append("cursor", fetcher.data.products.pageInfo.startCursor);
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
            autoFocus={true}
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
              onSelectionChange={(values) =>
                setFieldValue("selectedProducts", values)
              }
              promotedBulkActions={promotedBulkActions}
              resolveItemId={({ id }) => id}
              renderItem={renderProductItem}
              {...(products.length > 0 && {
                pagination: {
                  hasNext: fetcher.data?.products.pageInfo.hasNextPage,
                  hasPrevious: fetcher.data?.products.pageInfo.hasPreviousPage,
                  onNext: () => handlePagination("next"),
                  onPrevious: () => handlePagination("prev"),
                },
              })}
              emptyState={
                <BlockStack align="center" inlineAlign="center" gap="200">
                  <Icon source={SearchIcon} tone="subdued" />
                  <Text as="p" tone="subdued">
                    No products found matching your search.
                  </Text>
                </BlockStack>
              }
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
