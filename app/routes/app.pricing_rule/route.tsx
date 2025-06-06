import {
  Box,
  Button,
  ButtonGroup,
  InlineStack,
  Layout,
  Page,
} from "@shopify/polaris";

import { SaveBar, TitleBar, useAppBridge } from "@shopify/app-bridge-react";

import { Form, Formik, type FormikProps } from "formik";

import {
  type ICreatePricingRuleBody,
  type IPricingRuleFormValues,
} from "app/types/pricingRule";
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
import { schema } from "./schema";

type ActionResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const values: ICreatePricingRuleBody = await request.json();
  console.log("values", values);

  try {
    const formValues = {
      name: values.name,
      priority: Number(values.priority),
      status: values.status,
      applyTo: values.applyTo,
      priceType: values.priceType,
      priceValue: values.priceValue,
      productTags: values.productTags || [],
      selectedProducts: values.selectedProducts || [],
      collections: values.collections || [],
    };

    const pricingRule = await prisma.pricingRule.create({
      data: formValues,
    });

    const response: ActionResponse = {
      success: true,
      data: pricingRule,
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
          console.log("values", values);
          const convertValues: ICreatePricingRuleBody = {
            name: values.name,
            priority: values.priority,
            status: values.status,
            applyTo: values.applyTo[0],
            priceType: values.priceType[0],
            priceValue: values.priceValue,
            productTags: values.productTags,
            selectedProducts: values.selectedProducts.map((item) => item.id),
            collections: values.collections?.map((item) => item.value) ?? [],
          };

          fetcher.submit(convertValues, {
            method: "post",
            encType: "application/json",
          });
        }}
        validationSchema={schema}
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
          <ButtonGroup>
            <Button variant="secondary" onClick={handleDiscard}>
              Discard
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSubmitting}
            >
              Save
            </Button>
          </ButtonGroup>
        </InlineStack>
      </Box>
    </Page>
  );
}
