import { ChoiceList } from "@shopify/polaris";
import type { ChoiceListProps } from "@shopify/polaris";
import { useField } from "formik";

type FormikChoiceListProps = Omit<
  ChoiceListProps,
  "selected" | "onChange" | "error"
> & {
  name: string;
  onChange?: (value: string[]) => void;
};

export default function FormikChoiceList({
  name,
  onChange,
  ...rest
}: FormikChoiceListProps) {
  const [field, meta, helpers] = useField(name);

  const handleChange = (value: string[]) => {
    helpers.setValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <ChoiceList
      {...rest}
      selected={Array.isArray(field.value) ? field.value : []}
      onChange={handleChange}
      error={meta.touched && meta.error ? meta.error : undefined}
    />
  );
}
