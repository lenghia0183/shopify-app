import type {
  IApplyToOption,
  IPriceDiscountType,
  IPricingRuleStatus,
} from "app/constants/pricingRule";
import { type IAutoCompleteState } from "./common";

export interface IPricingRuleFormValues {
  name: string;
  priority: string;
  status: IPricingRuleStatus;
  applyTo: IApplyToOption[];
  priceType: IPriceDiscountType | "";
  priceValue: string;
  productTags: string[];
  productTagsState: IAutoCompleteState;
  selectedProducts: string[];
  searchSpecificProducts?: string;
  collections?: string[];
}
