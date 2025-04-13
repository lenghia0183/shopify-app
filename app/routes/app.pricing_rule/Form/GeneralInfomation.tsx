import { LegacyCard, FormLayout } from "@shopify/polaris";
import FormikTextField from "app/components/FormikTextField";
import FormikSelect from "app/components/FormikSelect";
import { PRICING_RULE_STATUS } from "app/constants/pricingRule";

export default function GeneralInformation() {
  const statusOptions = [
    { label: "Enable", value: PRICING_RULE_STATUS.ENABLE },
    { label: "Disable", value: PRICING_RULE_STATUS.DISABLE },
  ];

  return (
    <LegacyCard title="General Information" sectioned>
      <FormLayout>
        <FormikTextField label="Name" name="name" autoComplete="off" />
        <FormikTextField
          name="priority"
          label="Priority"
          type="number"
          min={0}
          helpText="Please enter an integer from 0 to 99. 0 is the highest priority."
          autoComplete=""
        />
        <FormikSelect label="Status" name="status" options={statusOptions} />
      </FormLayout>
    </LegacyCard>
  );
}
