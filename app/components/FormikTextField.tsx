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
};

export default function FormikTextField({
  name,
  onChange,
  onBlur,
  ...rest
}: FormikTextFieldProps) {
  const [field, meta, helpers] = useField(name);

  const handleChange = (value: string) => {
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
