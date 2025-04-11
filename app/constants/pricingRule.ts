// Status
export const PRICING_RULE_STATUS = {
  ENABLE: "enable",
  DISABLE: "disable",
} as const;

export type IPricingRuleStatus =
  (typeof PRICING_RULE_STATUS)[keyof typeof PRICING_RULE_STATUS];

// Apply to
export const APPLY_TO_OPTIONS = {
  ALL: "all",
  SPECIFIC_PRODUCTS: "specificProducts",
  PRODUCT_COLLECTIONS: "productCollections",
  PRODUCT_TAGS: "productTags",
} as const;

export type IApplyToOption =
  (typeof APPLY_TO_OPTIONS)[keyof typeof APPLY_TO_OPTIONS];

// Price type
export const PRICE_DISCOUNT_TYPE = {
  SET_NEW_PRICE: "setNewPrice",
  DISCOUNT_FIXED_AMOUNT: "discountFixed",
  DISCOUNT_PERCENTAGE: "discountPercent",
} as const;

export type IPriceDiscountType =
  (typeof PRICE_DISCOUNT_TYPE)[keyof typeof PRICE_DISCOUNT_TYPE];
