import {
  LegacyCard,
  FormLayout,
  Box,
  InlineStack,
  Button,
  BlockStack,
  Thumbnail,
  Text,
  Icon,
} from "@shopify/polaris";
import FormikChoiceList from "app/components/FormikChoiceList";

import { APPLY_TO_OPTIONS } from "app/constants/pricingRule";
import { type IPricingRuleFormValues } from "app/types/pricingRule";
import FormikTextField from "app/components/FormikTextField";
import FormikAutocomplete from "app/components/AutoComplete";
import {
  type IProduct,
  type IProductTagListResponse,
  type IProductTagOption,
} from "app/types/product";
import { PlusCircleIcon, SearchIcon, XIcon } from "@shopify/polaris-icons";
import {
  type ICollectionListResponse,
  type ICollectionOptions,
} from "app/types/collection";
import toTitleCase from "app/utils/toTitleCase";
import ProductSelectModal from "../ProductSelectModal";
import { useState } from "react";
import { useFetcher } from "@remix-run/react";
import { useFormikContext } from "formik";
import { type IPageInfo } from "app/types/common";

export default function ApplyToProducts() {
  const { values, setFieldValue } = useFormikContext<IPricingRuleFormValues>();

  const [productModalOpen, setProductModalOpen] = useState(false);

  const fetcher = useFetcher<IProductTagListResponse>({
    key: "getProductTagList",
  });

  const fetcherAddProductTag = useFetcher({
    key: "addProductTag",
  });

  const collectionFetcher = useFetcher<ICollectionListResponse>({
    key: "getCollectionList",
  });

  const toggleProductModal = () => {
    return setProductModalOpen((open) => {
      return !open;
    });
  };

  const renderSpecificChildren = (values: IPricingRuleFormValues) => {
    if (values.applyTo.includes(APPLY_TO_OPTIONS.SPECIFIC_PRODUCTS)) {
      return (
        <Box paddingBlockEnd="200">
          <BlockStack gap="200">
            <InlineStack
              gap="200"
              blockAlign="center"
              align="space-between"
              wrap={false}
            >
              <Box width="100%">
                <FormikTextField
                  name="searchSpecificProducts"
                  label="Search and select products"
                  labelHidden
                  onChange={() => {
                    setProductModalOpen(true);
                  }}
                  prefix={<Icon source={SearchIcon} tone="base" />}
                  placeholder="Search and select products"
                  autoComplete="off"
                />
              </Box>
              <Button onClick={toggleProductModal} accessibilityLabel="Browse">
                Browse
              </Button>
            </InlineStack>

            {values.selectedProducts?.length > 0 && (
              <Box
                borderRadius="100"
                borderWidth="025"
                borderColor="border-disabled"
              >
                {values?.selectedProducts?.map((option: IProduct, index) => {
                  return (
                    <Box
                      key={option.id}
                      padding="200"
                      borderBlockEndWidth={
                        values.selectedProducts?.length - 1 === index
                          ? "0"
                          : "025"
                      }
                      borderColor="border-disabled"
                    >
                      <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="300" blockAlign="center">
                          <Thumbnail
                            source={
                              option?.images?.edges[0].node.originalSrc || ""
                            }
                            alt={option?.images?.edges[0].node.altText || ""}
                            size="small"
                          />
                          <BlockStack gap="050">
                            <Text variant="bodyMd" as="p">
                              {toTitleCase(option?.title || "")}
                            </Text>
                          </BlockStack>
                        </InlineStack>
                        <Button
                          icon={XIcon}
                          onClick={() => {
                            setFieldValue(
                              "selectedProducts",
                              values.selectedProducts.filter(
                                (item) => item.id !== option.id,
                              ),
                            );
                          }}
                          variant="plain"
                        />
                      </InlineStack>
                    </Box>
                  );
                })}
              </Box>
            )}
          </BlockStack>
        </Box>
      );
    }
  };

  const renderTagChildren = (values: IPricingRuleFormValues) => {
    if (values.applyTo.includes(APPLY_TO_OPTIONS.PRODUCT_TAGS)) {
      return (
        <Box paddingBlockEnd="200">
          <FormikAutocomplete
            options={[]}
            name="productTags"
            searchAsync={false}
            asyncRequest={() => {
              fetcher.load("/api/productTag");
            }}
            asyncRequestHelper={(
              data: IProductTagListResponse,
            ): IProductTagOption[] => {
              return (
                data?.productTags?.edges?.map((tag: any) => ({
                  value: tag.node,
                  label: tag.node,
                })) ?? []
              );
            }}
            fetcher={fetcher}
            {...(values?.productTagsState?.filteredOptions?.length === 0 && {
              actionBefore: {
                accessibilityLabel: "Action label",
                content: "Add",
                helpText: `Add ${values.productTagsState.inputValue}`,
                icon: PlusCircleIcon,
                wrapOverflow: true,
                onAction: () => {
                  const newTag = values.productTagsState.inputValue;

                  const addTagFormData = new FormData();
                  addTagFormData.append("tags", newTag || "");

                  fetcherAddProductTag.submit(addTagFormData, {
                    method: "post",
                    action: "/api/productTag",
                  });
                },
              },
            })}
          />
        </Box>
      );
    }
  };

  const renderCollectionChildren = (values: IPricingRuleFormValues) => {
    if (values.applyTo.includes(APPLY_TO_OPTIONS.PRODUCT_COLLECTIONS)) {
      return (
        <Box paddingBlockEnd="200">
          <FormikAutocomplete
            options={[]}
            name="collections"
            placeholder="Search and select collections"
            asyncRequest={(value) => {
              const formData = new FormData();
              formData.append("query", value ? `title:*${value}*` : "");
              collectionFetcher.submit(formData, {
                method: "post",
                action: "/api/collection",
              });
            }}
            asyncRequestPageInfo={(data): IPageInfo => {
              return data?.collections?.pageInfo;
            }}
            asyncRequestHelper={(data): ICollectionOptions[] => {
              return (
                data?.collections?.edges?.map((collection) => {
                  return {
                    value: collection.node.id,
                    label: collection.node.title,
                    url: collection.node.image?.url,
                    altText: collection.node.image?.altText,
                    productsCount: collection?.node?.productsCount?.count,
                  };
                }) ?? []
              );
            }}
            fetcher={collectionFetcher}
            renderSelectedTags={(removeTag) => {
              const collectionSelectedList = values.collections;
              return (
                <Box
                  borderRadius="100"
                  borderWidth="025"
                  borderColor="border-disabled"
                >
                  {collectionSelectedList?.map(
                    (option: ICollectionOptions, index) => {
                      return (
                        <Box
                          key={option.value}
                          padding="200"
                          borderBlockEndWidth={
                            collectionSelectedList.length - 1 === index
                              ? "0"
                              : "025"
                          }
                          borderColor="border-disabled"
                        >
                          <InlineStack
                            align="space-between"
                            blockAlign="center"
                          >
                            <InlineStack gap="300" blockAlign="center">
                              <Thumbnail
                                source={option?.url || ""}
                                alt={option?.altText || ""}
                                size="small"
                              />
                              <BlockStack gap="050">
                                <Text
                                  variant="bodyMd"
                                  fontWeight="semibold"
                                  as="p"
                                >
                                  {toTitleCase(option?.label || "")}
                                </Text>
                                <Text variant="bodySm" tone="subdued" as="p">
                                  {option.productsCount ?? "1"}{" "}
                                  {option.productsCount === 1
                                    ? "product"
                                    : "products"}
                                </Text>
                              </BlockStack>
                            </InlineStack>
                            <Button
                              icon={XIcon}
                              // @ts-expect-error: onClick expects a function returning unknown, but we don't need return
                              onClick={removeTag(option.value)}
                              variant="plain"
                            />
                          </InlineStack>
                        </Box>
                      );
                    },
                  )}
                </Box>
              );
            }}
          />
        </Box>
      );
    }
  };

  const applyToOptions = (values: IPricingRuleFormValues) => {
    return [
      { label: "All products", value: APPLY_TO_OPTIONS.ALL },
      {
        label: "Specific products",
        value: APPLY_TO_OPTIONS.SPECIFIC_PRODUCTS,
        renderChildren: () => renderSpecificChildren(values),
      },
      {
        label: "Product collection",
        value: APPLY_TO_OPTIONS.PRODUCT_COLLECTIONS,
        renderChildren: () => renderCollectionChildren(values),
      },
      {
        label: "Product Tags",
        value: APPLY_TO_OPTIONS.PRODUCT_TAGS,
        renderChildren: () => renderTagChildren(values),
      },
    ];
  };

  return (
    <>
      <LegacyCard title="Apply to Products" sectioned>
        <FormLayout>
          <FormikChoiceList
            title=""
            name="applyTo"
            choices={applyToOptions(values)}
          />
        </FormLayout>

        <ProductSelectModal
          productModalOpen={productModalOpen}
          setProductModalOpen={setProductModalOpen}
        />
      </LegacyCard>
    </>
  );
}
