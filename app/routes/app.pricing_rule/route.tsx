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
} from "@shopify/polaris";
import { PlusCircleIcon, XIcon } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { Form, Formik } from "formik";
import FormikTextField from "app/components/FormikTextField";
import FormikSelect from "app/components/FormikSelect";
import FormikChoiceList from "app/components/FormikChoiceList";
import ProductSelectModal from "./ProductSelectModal";

import TagAutocomplete from "app/components/AutoComplete";
import { useFetcher } from "@remix-run/react";
import {
  type CollectionListResponse,
  type CollectionOptions,
} from "app/types/collection";
import toTitleCase from "app/utils/toTitleCase";
import {
  type ProductTagListResponse,
  type ProductTagOption,
} from "app/types/product";

export default function PricingRulePage() {
  const [productModalOpen, setProductModalOpen] = useState(false);

  const fetcher = useFetcher<ProductTagListResponse>({
    key: "getProductTagList",
  });
  const collectionFetcher = useFetcher<CollectionListResponse>({
    key: "getCollectionList",
  });

  const [, setSelectedProducts] = useState<string[]>([]);

  const statusOptions = [
    { label: "Enable", value: "enable" },
    { label: "Disable", value: "disable" },
  ];

  const applyToOptions = (values: any) => {
    return [
      { label: "All products", value: "all" },
      {
        label: "Specific products",
        value: "specificProducts",
        renderChildren: () => renderSpecificChildren(values),
      },
      {
        label: "Product collection",
        value: "productCollections",
        renderChildren: () => renderCollectionChildren(values),
      },
      {
        label: "Product Tags",
        value: "productTags",
        renderChildren: () => renderTagChildren(values),
      },
    ];
  };

  const customPricesOptions = [
    {
      label: "Apply a price to selected products",
      value: "apply",
    },
    {
      label:
        "Decrease a fixed amount of the original prices of selected products",
      value: "decreaseFixed",
    },
    {
      label:
        "Decrease the original prices of selected products by a percentage (%)",
      value: "decreasePercent",
    },
  ];

  const toggleProductModal = () => {
    return setProductModalOpen((open) => {
      return !open;
    });
  };

  const handleProductSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const renderSpecificChildren = (values: any) => {
    if (values.applyTo.includes("specificProducts")) {
      return (
        <FormikTextField
          name="searchSpecificProducts"
          label="Search and select products"
          labelHidden
          onFocus={toggleProductModal}
          placeholder="Click to select products"
          autoComplete="off"
        />
      );
    }
  };

  const renderTagChildren = (values: any) => {
    if (values.applyTo.includes("productTags")) {
      return (
        <TagAutocomplete
          options={[]}
          name="productTags"
          asyncRequest={() => {
            fetcher.load("/api/productTag");
          }}
          asyncRequestHelper={(
            data: ProductTagListResponse,
          ): ProductTagOption[] => {
            return (
              data?.productTags?.edges?.map((tag: any) => ({
                value: tag.node,
                label: tag.node,
              })) ?? []
            );
          }}
          fetcher={fetcher}
          actionBefore={{
            accessibilityLabel: "Action label",
            content: "Add",
            helpText: "Add new tag",
            icon: PlusCircleIcon,
            wrapOverflow: true,
            onAction: () => {
              console.log("actionBefore clicked!");
            },
          }}
        />
      );
    }
  };

  const renderCollectionChildren = (values: any) => {
    if (values.applyTo.includes("productCollections")) {
      return (
        <TagAutocomplete
          options={[]}
          name="collections"
          asyncRequest={() => {
            collectionFetcher.load("/api/collection");
          }}
          asyncRequestHelper={(data): CollectionOptions[] => {
            return (
              data?.collections?.edges?.map((collection) => {
                return {
                  value: collection.node.id,
                  label: collection.node.title,
                  url: collection.node.image?.url,
                };
              }) ?? []
            );
          }}
          fetcher={collectionFetcher}
          renderSelectedTags={(selectedOptions, options, removeTag) => {
            console.log("removeTag", removeTag);

            return (
              <BlockStack gap="200">
                {selectedOptions.map((option: string) => {
                  const selectedOption = options.find(
                    (opt) => opt.value === option,
                  );

                  return (
                    <Box
                      key={option}
                      padding="300"
                      background="bg-fill-brand-disabled"
                      borderRadius="100"
                    >
                      <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="400" blockAlign="center">
                          <Thumbnail
                            source={selectedOption?.url || ""}
                            alt={selectedOption?.label || ""}
                            size="large"
                          />
                          <Text variant="bodyMd" fontWeight="regular" as="p">
                            {toTitleCase(selectedOption?.label || "")}
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
      );
    }
  };

  return (
    <Page>
      <TitleBar title="New Pricing Rule" />
      <Formik
        initialValues={{
          name: "",
          priority: "",
          status: "disable",
          applyTo: ["none"],
          priceType: "",
          priceValue: "",
          productTags: [],
        }}
        onSubmit={(values) => {}}
        enableReinitialize
      >
        {({ values }) => {
          // console.log("values", values);
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
                  </LegacyCard>
                </Layout.Section>
              </Layout>
            </Form>
          );
        }}
      </Formik>

      {/* PRODUCT SELECT MODAL */}
      <ProductSelectModal
        productModalOpen={productModalOpen}
        setProductModalOpen={setProductModalOpen}
        handleProductSelect={handleProductSelect}
      />
    </Page>
  );
}
