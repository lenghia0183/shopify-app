import type {
  IApplyToOption,
  IPriceDiscountType,
  IPricingRuleStatus,
} from "app/constants/pricingRule";
import { type IAutoCompleteState } from "./common";
import { type ICollectionOptions } from "./collection";

export interface IPricingRuleFormValues {
  name: string;
  priority: number;
  status: IPricingRuleStatus;
  applyTo: IApplyToOption[];
  priceType: IPriceDiscountType[];
  priceValue: string;
  productTags: string[];
  productTagsState: IAutoCompleteState;
  selectedProducts: string[];
  searchSpecificProducts?: string;
  collections?: ICollectionOptions[];
}
