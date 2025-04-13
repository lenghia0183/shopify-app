import { Box, Button, InlineStack, Layout, Page } from "@shopify/polaris";

import { SaveBar, TitleBar, useAppBridge } from "@shopify/app-bridge-react";

import { Form, Formik, type FormikProps } from "formik";

import { type IPricingRuleFormValues } from "app/types/pricingRule";
import {
  APPLY_TO_OPTIONS,
  PRICE_DISCOUNT_TYPE,
  PRICING_RULE_STATUS,
} from "app/constants/pricingRule";
import GeneralInformation from "./Form/GeneralInfomation";
import ApplyToProducts from "./Form/ApplyToProducts";
import CustomPrices from "./Form/CustomPrice";
import { useRef, useState, useEffect } from "react";

import { type ActionFunction, json } from "@remix-run/node";
import prisma from "../../db.server";
import { useFetcher, useNavigate } from "@remix-run/react";

type ActionResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData.entries());

  try {
    const data = {
      name: values.name as string,
      priority: parseInt(values.priority as string),
      status: values.status as string,
      applyTo: JSON.parse(values.applyTo as string),
      priceType: JSON.parse(values.priceType as string),
      priceValue: values.priceValue as string,
      productTags: values.productTags
        ? JSON.parse(values.productTags as string)
        : [],
      productTagsState: values.productTagsState
        ? JSON.parse(values.productTagsState as string)
        : { filteredOptions: [] },
      selectedProducts: values.selectedProducts
        ? JSON.parse(values.selectedProducts as string)
        : [],
      collections: values.collections
        ? JSON.parse(values.collections as string)
        : [],
    };

    const id = crypto.randomUUID();

    await prisma.$executeRawUnsafe(`
      INSERT INTO "PricingRule" (
        id, name, priority, status, applyTo, priceType, priceValue, 
        productTags, selectedProducts, collections, createdAt, updatedAt
      ) 
      VALUES (
        '${id}', 
        '${data.name}', 
        ${data.priority}, 
        '${data.status}', 
        '${JSON.stringify(data.applyTo)}', 
        '${JSON.stringify(data.priceType)}', 
        '${data.priceValue}', 
        ${data.productTags?.length ? `'${JSON.stringify(data.productTags)}'` : "null"}, 
        ${data.selectedProducts?.length ? `'${JSON.stringify(data.selectedProducts)}'` : "null"}, 
        ${data.collections?.length ? `'${JSON.stringify(data.collections)}'` : "null"}, 
        '${new Date().toISOString()}', 
        '${new Date().toISOString()}'
      )
    `);

    const response: ActionResponse = {
      success: true,
      data: {
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    return json(response);
  } catch (error: any) {
    const response: ActionResponse = {
      success: false,
      error: error.message,
    };

    return json(response, { status: 400 });
  }
};

export default function PricingRulePage() {
  const formRef = useRef<FormikProps<IPricingRuleFormValues> | null>(null);
  const [, setValues] = useState<IPricingRuleFormValues>();
  const shopify = useAppBridge();

  const fetcher = useFetcher<ActionResponse>();
  const navigate = useNavigate();
  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data) {
      const result = fetcher.data;

      if (result.success) {
        shopify.toast.show("Pricing rule created successfully!");

        setTimeout(() => {}, 1000);
      } else if (result.error) {
        shopify.toast.show(`Failed to create pricing rule: ${result.error}`, {
          isError: true,
        });
      }
    }
  }, [fetcher.data, navigate, shopify]);

  const initialValues: IPricingRuleFormValues = {
    name: "",
    priority: 0,
    status: PRICING_RULE_STATUS.ENABLE,
    applyTo: [APPLY_TO_OPTIONS.ALL],
    priceType: [PRICE_DISCOUNT_TYPE.SET_NEW_PRICE],
    priceValue: "",
    productTags: [],
    productTagsState: {
      filteredOptions: [],
    },
    selectedProducts: [],
    collections: [],
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  const handleDiscard = () => {
    formRef.current?.resetForm();
  };

  return (
    <Page>
      <SaveBar open={formRef?.current?.dirty}>
        <button variant="primary" onClick={handleSave}></button>
        <button onClick={handleDiscard}></button>
      </SaveBar>
      <TitleBar title="New Pricing Rule" />

      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          const formData = new FormData();
          Object.entries(values).forEach(([key, value]) => {
            if (typeof value === "object" && value !== null) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          });

          fetcher.submit(formData, { method: "post" });
        }}
        innerRef={(ref) => {
          formRef.current = ref;
          setValues(ref?.values);
        }}
        enableReinitialize
      >
        {({ values }) => {
          return (
            <Form method="post">
              <Layout>
                {/* GENERAL INFO */}
                <Layout.Section>
                  <GeneralInformation />
                </Layout.Section>

                {/* APPLY TO PRODUCTS */}
                <Layout.Section>
                  <ApplyToProducts />
                </Layout.Section>

                {/* CUSTOM PRICES */}
                <Layout.Section>
                  <CustomPrices />
                </Layout.Section>
              </Layout>
            </Form>
          );
        }}
      </Formik>
      <Box paddingBlockStart="300">
        <InlineStack align="end">
          <Button variant="primary" onClick={handleSave} loading={isSubmitting}>
            Save
          </Button>
        </InlineStack>
      </Box>
    </Page>
  );
}
