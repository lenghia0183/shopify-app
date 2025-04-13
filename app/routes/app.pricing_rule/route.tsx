import { Box, Button, InlineStack, Layout, Page } from "@shopify/polaris";

import { SaveBar, TitleBar } from "@shopify/app-bridge-react";

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
import { useRef, useState } from "react";

export default function PricingRulePage() {
  const formRef = useRef<FormikProps<IPricingRuleFormValues> | null>(null);
  const [, setValues] = useState<IPricingRuleFormValues>();

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
    console.log("test");
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  const handleDiscard = () => {
    formRef.current?.resetForm();
  };

  console.log("formikRef", formRef);

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
          console.log("Submitting values:", values);
        }}
        innerRef={(ref) => {
          formRef.current = ref;
          setValues(ref?.values);
        }}
        enableReinitialize
      >
        {({ values }) => {
          return (
            <Form>
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
          <Button variant="primary">Save</Button>
        </InlineStack>
      </Box>
    </Page>
  );
}
