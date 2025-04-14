// Status
export const PRICING_RULE_STATUS = {
  ENABLE: "enable",
  DISABLE: "disable",
} as const;

export type IPricingRuleStatus =
  (typeof PRICING_RULE_STATUS)[keyof typeof PRICING_RULE_STATUS];

export const PRICING_RULE_STATUS_LABEL = {
  [PRICING_RULE_STATUS.ENABLE]: "Enable",
  [PRICING_RULE_STATUS.DISABLE]: "Disable",
} as const;

// Apply to
export const APPLY_TO_OPTIONS = {
  ALL: "all",
  SPECIFIC_PRODUCTS: "specificProducts",
  PRODUCT_COLLECTIONS: "productCollections",
  PRODUCT_TAGS: "productTags",
} as const;

export type IApplyToOption =
  (typeof APPLY_TO_OPTIONS)[keyof typeof APPLY_TO_OPTIONS];

export const APPLY_TO_OPTIONS_LABEL = {
  [APPLY_TO_OPTIONS.ALL]: "All products",
  [APPLY_TO_OPTIONS.SPECIFIC_PRODUCTS]: "Specific Products",
  [APPLY_TO_OPTIONS.PRODUCT_COLLECTIONS]: "Product Collections",
  [APPLY_TO_OPTIONS.PRODUCT_TAGS]: "Product Tags",
} as const;

// Price type
export const PRICE_DISCOUNT_TYPE = {
  SET_NEW_PRICE: "setNewPrice",
  DISCOUNT_FIXED_AMOUNT: "discountFixed",
  DISCOUNT_PERCENTAGE: "discountPercent",
} as const;

export const PRICE_DISCOUNT_TYPE_LABEL = {
  [PRICE_DISCOUNT_TYPE.SET_NEW_PRICE]: "Set Price",
  [PRICE_DISCOUNT_TYPE.DISCOUNT_FIXED_AMOUNT]: "Apply discount fixed amount",
  [PRICE_DISCOUNT_TYPE.DISCOUNT_PERCENTAGE]: "Apply discount percentage",
} as const;

export type IPriceDiscountType =
  (typeof PRICE_DISCOUNT_TYPE)[keyof typeof PRICE_DISCOUNT_TYPE];
