import { TextField } from "@shopify/polaris";
import type { TextFieldProps } from "@shopify/polaris";
import { useField } from "formik";

type FormikTextFieldProps = Omit<
  TextFieldProps,
  "value" | "onChange" | "onBlur" | "error"
> & {
  name: string;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
};

export default function FormikTextField({
  name,
  onChange,
  onBlur,
  min,
  max,
  ...rest
}: FormikTextFieldProps) {
  const [field, meta, helpers] = useField(name);

  const handleChange = (value: string) => {
    if (value === "") {
      helpers.setValue(value);
      if (onChange) {
        onChange(value);
      }
      return;
    }

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      if (min !== undefined && numericValue < min) {
        value = min.toString();
      } else if (max !== undefined && numericValue > max) {
        value = max.toString();
      }
    }

    helpers.setValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    field.onBlur(event);
    if (onBlur) {
      onBlur(event);
    }
  };

  return (
    <TextField
      {...rest}
      name={name}
      value={field.value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={meta.touched && meta.error ? meta.error : undefined}
    />
  );
}
