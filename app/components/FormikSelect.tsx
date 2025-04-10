import { Select } from "@shopify/polaris";
import type { SelectProps } from "@shopify/polaris";
import { useField } from "formik";

type FormikSelectProps = Omit<
  SelectProps,
  "value" | "onChange" | "onBlur" | "error"
> & {
  name: string;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
};

export default function FormikSelect({
  name,
  onChange,
  onBlur,
  ...rest
}: FormikSelectProps) {
  const [field, meta, helpers] = useField(name);

  const handleChange = (value: string) => {
    helpers.setValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLSelectElement>) => {
    field.onBlur(event);
    if (onBlur) {
      onBlur(event);
    }
  };

  return (
    <Select
      {...rest}
      name={name}
      value={field.value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={meta.touched && meta.error ? meta.error : undefined}
    />
  );
}
