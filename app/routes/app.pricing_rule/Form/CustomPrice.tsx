import { LegacyCard, FormLayout } from "@shopify/polaris";
import FormikChoiceList from "app/components/FormikChoiceList";
import FormikTextField from "app/components/FormikTextField";
import { PRICE_DISCOUNT_TYPE } from "app/constants/pricingRule";
import { useFormikContext } from "formik";
import { type IPricingRuleFormValues } from "./../../../types/pricingRule";

export default function CustomPrices() {
  const { values, setFieldValue } = useFormikContext<IPricingRuleFormValues>();
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
          onChange={() => {
            setFieldValue("priceValue", 0);
          }}
        />
        <FormikTextField
          name="priceValue"
          label="Amount"
          type="number"
          autoComplete=""
          min={0}
          {...(values.priceType[0] ===
            PRICE_DISCOUNT_TYPE.DISCOUNT_PERCENTAGE && {
            max: 100,
          })}
          suffix={
            values.priceType[0] === PRICE_DISCOUNT_TYPE.DISCOUNT_PERCENTAGE
              ? "%"
              : ""
          }
        />
      </FormLayout>
    </LegacyCard>
  );
}
