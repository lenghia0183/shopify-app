export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface IAutoCompleteState {
  inputValue?: string;
  filteredOptions?: any[];
  visibleIndex?: number;
  willLoadMore?: boolean;
}
