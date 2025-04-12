import { Layout, Page } from "@shopify/polaris";

import { TitleBar } from "@shopify/app-bridge-react";

import { Form, Formik } from "formik";

import { type IPricingRuleFormValues } from "app/types/pricingRule";
import { PRICING_RULE_STATUS } from "app/constants/pricingRule";
import GeneralInformation from "./Form/GeneralInfomation";
import ApplyToProducts from "./Form/ApplyToProducts";
import CustomPrices from "./Form/CustomPrice";

export default function PricingRulePage() {
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
    </Page>
  );
}
