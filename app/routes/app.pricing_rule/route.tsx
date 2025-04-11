import {
  Layout,
  Page,
  LegacyCard,
  FormLayout,
  Thumbnail,
  InlineStack,
  Box,
  BlockStack,
  Button,
  Text,
  Icon,
} from "@shopify/polaris";
import { PlusCircleIcon, SearchIcon, XIcon } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { Form, Formik } from "formik";
import FormikTextField from "app/components/FormikTextField";
import FormikSelect from "app/components/FormikSelect";
import FormikChoiceList from "app/components/FormikChoiceList";
import ProductSelectModal from "./ProductSelectModal";

import FormikAutocomplete from "app/components/AutoComplete";
import { useFetcher } from "@remix-run/react";
import {
  type ICollectionListResponse,
  type ICollectionOptions,
} from "app/types/collection";
import toTitleCase from "app/utils/toTitleCase";
import {
  type IProductTagListResponse,
  type IProductTagOption,
} from "app/types/product";
import { type IPricingRuleFormValues } from "app/types/pricingRule";
import {
  APPLY_TO_OPTIONS,
  PRICE_DISCOUNT_TYPE,
  PRICING_RULE_STATUS,
} from "app/constants/pricingRule";

export default function PricingRulePage() {
  const [productModalOpen, setProductModalOpen] = useState(false);

  const fetcher = useFetcher<IProductTagListResponse>({
    key: "getProductTagList",
  });
  const collectionFetcher = useFetcher<ICollectionListResponse>({
    key: "getCollectionList",
  });

  const fetcherAddProductTag = useFetcher({
    key: "addProductTag",
  });

  const statusOptions = [
    { label: "Enable", value: PRICING_RULE_STATUS.ENABLE },
    { label: "Disable", value: PRICING_RULE_STATUS.DISABLE },
  ];

  const applyToOptions = (values: any) => {
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

  const customPricesOptions = [
    {
      label: "Apply a price to selected products",
      value: PRICE_DISCOUNT_TYPE.SET_NEW_PRICE,
    },
    {
      label:
        "Decrease a fixed amount of the original prices of selected products",
      value: PRICE_DISCOUNT_TYPE.DISCOUNT_FIXED_AMOUNT,
    },
    {
      label:
        "Decrease the original prices of selected products by a percentage (%)",
      value: PRICE_DISCOUNT_TYPE.DISCOUNT_PERCENTAGE,
    },
  ];

  const toggleProductModal = () => {
    return setProductModalOpen((open) => {
      return !open;
    });
  };

  const renderSpecificChildren = (values: IPricingRuleFormValues) => {
    if (values.applyTo.includes(APPLY_TO_OPTIONS.SPECIFIC_PRODUCTS)) {
      return (
        <Box paddingBlockEnd="200">
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
                placeholder="Click to select products"
                autoComplete="off"
              />
            </Box>
            <Button
              onClick={toggleProductModal}
              // icon={PlusCircleIcon}
              accessibilityLabel="Browse"
            >
              Browse
            </Button>
          </InlineStack>
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
            asyncRequest={(value) => {
              const formData = new FormData();
              formData.append("query", value ? `title:*${value}*` : "");
              collectionFetcher.submit(formData, {
                method: "post",
                action: "/api/collection",
              });
            }}
            asyncRequestHelper={(data): ICollectionOptions[] => {
              return (
                data?.collections?.edges?.map((collection) => {
                  return {
                    value: collection.node.id,
                    label: collection.node.title,
                    url: collection.node.image?.url,
                    altText: collection.node.image?.altText,
                  };
                }) ?? []
              );
            }}
            fetcher={collectionFetcher}
            renderSelectedTags={(removeTag) => {
              const collectionSelectedList = values.collections;
              return (
                <BlockStack gap="200">
                  {collectionSelectedList?.map((option: ICollectionOptions) => {
                    return (
                      <Box
                        key={option.value}
                        padding="300"
                        background="bg-fill-brand-disabled"
                        borderRadius="100"
                      >
                        <InlineStack align="space-between" blockAlign="center">
                          <InlineStack gap="400" blockAlign="center">
                            <Thumbnail
                              source={option?.url || ""}
                              alt={option?.altText || ""}
                              size="large"
                            />
                            <Text variant="bodyMd" fontWeight="regular" as="p">
                              {toTitleCase(option?.label || "")}
                            </Text>
                          </InlineStack>
                          {/* @ts-expect-error: onClick expects () => unknown, but we return void */}
                          <Button icon={XIcon} onClick={removeTag(option)} />
                        </InlineStack>
                      </Box>
                    );
                  })}
                </BlockStack>
              );
            }}
          />
        </Box>
      );
    }
  };

  const initialValues: IPricingRuleFormValues = {
    name: "",
    priority: "",
    status: PRICING_RULE_STATUS.ENABLE,
    applyTo: [],
    priceType: "",
    priceValue: "",
    productTags: [],
    productTagsState: {},
    selectedProducts: [],
    collections: [],
  };

  return (
    <Page>
      <TitleBar title="New Pricing Rule" />
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {}}
        enableReinitialize
      >
        {({ values }) => {
          return (
            <Form>
              <Layout>
                {/* GENERAL INFO */}
                <Layout.Section>
                  <LegacyCard title="General Information" sectioned>
                    <FormLayout>
                      <FormikTextField
                        label="Name"
                        name="name"
                        autoComplete="off"
                      />
                      <FormikTextField
                        name="priority"
                        label="Priority"
                        type="number"
                        helpText="Please enter an integer from 0 to 99. 0 is the highest priority."
                        autoComplete=""
                      />
                      <FormikSelect
                        label="Status"
                        name="status"
                        options={statusOptions}
                      />
                    </FormLayout>
                  </LegacyCard>
                </Layout.Section>

                {/* APPLY TO PRODUCTS */}
                <Layout.Section>
                  <LegacyCard title="Apply to Products" sectioned>
                    <FormLayout>
                      <FormikChoiceList
                        title=""
                        name="applyTo"
                        choices={applyToOptions(values)}
                      />
                    </FormLayout>
                  </LegacyCard>
                </Layout.Section>

                {/* CUSTOM PRICES */}
                <Layout.Section>
                  <LegacyCard title="Custom Prices" sectioned>
                    <FormLayout>
                      <FormikChoiceList
                        title=""
                        name="priceType"
                        choices={customPricesOptions}
                      />
                      <FormikTextField
                        name="priceValue"
                        label="Amount"
                        type="number"
                        autoComplete=""
                      />
                    </FormLayout>

                    {/* PRODUCT SELECT MODAL */}
                    <ProductSelectModal
                      productModalOpen={productModalOpen}
                      setProductModalOpen={setProductModalOpen}
                    />
                  </LegacyCard>
                </Layout.Section>
              </Layout>
            </Form>
          );
        }}
      </Formik>
    </Page>
  );
}
