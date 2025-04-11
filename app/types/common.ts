export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface IAutoCompleteState {
  inputValue?: string;
  filteredOptions?: any[];
  visibleIndex?: number;
  willLoadMore?: boolean;
}
