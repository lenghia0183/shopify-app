import type {
  IApplyToOption,
  IPriceDiscountType,
  IPricingRuleStatus,
} from "app/constants/pricingRule";
import { type IAutoCompleteState } from "./common";
import { type ICollectionOptions } from "./collection";
import { type IProduct } from "./product";

export interface PricingRule {
  id: string;
  name: string;
  priority: number;
  status: IPricingRuleStatus;
  applyTo: IApplyToOption;
  priceType: IPriceDiscountType;
  priceValue: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPricingRuleFormValues {
  name: string;
  priority: number;
  status: IPricingRuleStatus;
  applyTo: IApplyToOption[];
  priceType: IPriceDiscountType[];
  priceValue: string;
  productTags: string[];
  productTagsState: IAutoCompleteState;
  selectedProducts: IProduct[];
  searchSpecificProducts?: string;
  collections?: ICollectionOptions[];
}

export interface ICreatePricingRuleBody {
  [key: string]: any;
  name: string;
  priority: number;
  status: IPricingRuleStatus;
  applyTo: IApplyToOption;
  priceType: IPriceDiscountType;
  priceValue: string;
  productTags: string[];
  selectedProducts: string[];
  collections: string[];
}

export interface IGetPricingRulesResponse {
  success: boolean;
  message: any;
  data: {
    pricingRules: PricingRule[];
  };
  meta: {
    totalRules: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
}
