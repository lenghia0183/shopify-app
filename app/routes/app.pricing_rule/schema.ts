import * as yup from "yup";
import { APPLY_TO_OPTIONS } from "app/constants/pricingRule";

export const schema = yup.object().shape({
  name: yup.string().required("Rule name is required"),
  priority: yup.number().required("Priority is required"),
  status: yup.string().required("Status is required"),
  applyTo: yup.array().of(yup.string()).required("Apply to is required"),
  collections: yup.array().of(yup.object()),
  collectionsInput: yup.string().when("applyTo", {
    is: (value: string[]) =>
      value?.includes(APPLY_TO_OPTIONS.PRODUCT_COLLECTIONS),
    then: (schema) =>
      schema.test(
        "check-collections",
        "Please select at least one collection",
        function (value) {
          const collections = this.parent?.collections;
          return !!(collections && collections.length > 0);
        },
      ),
    otherwise: (schema) => schema,
  }),
  productTagsInput: yup.string().when("applyTo", {
    is: (value: string[]) => value?.includes(APPLY_TO_OPTIONS.PRODUCT_TAGS),
    then: (schema) =>
      schema.test(
        "check-productTags",
        "Please select at least one tag",
        function (value) {
          const productTags = this.parent?.productTags;
          return !!(productTags && productTags.length > 0);
        },
      ),
    otherwise: (schema) => schema,
  }),
  searchSpecificProducts: yup.string().when("applyTo", {
    is: (value: string[]) =>
      value?.includes(APPLY_TO_OPTIONS.SPECIFIC_PRODUCTS),
    then: (schema) =>
      schema.test(
        "check-selectedProducts",
        "Please select at least one product",
        function (value) {
          const selectedProducts = this.parent?.selectedProducts;
          return !!(selectedProducts && selectedProducts.length > 0);
        },
      ),
    otherwise: (schema) => schema,
  }),
  searchCollection: yup.string(),
});
