import { LegacyCard, FormLayout } from "@shopify/polaris";
import FormikChoiceList from "app/components/FormikChoiceList";
import FormikTextField from "app/components/FormikTextField";
import { PRICE_DISCOUNT_TYPE } from "app/constants/pricingRule";

export default function CustomPrices() {
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

  return (
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
  );
}
