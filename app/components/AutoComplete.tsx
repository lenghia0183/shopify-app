import { useFetcher, type FetcherWithComponents } from "@remix-run/react";
import {
  Autocomplete,
  Tag,
  LegacyStack,
  type AutocompleteProps,
  Icon,
  TextContainer,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useDebounce } from "app/hooks/useDebounce";
import { type IPageInfo } from "app/types/common";
import toTitleCase from "app/utils/toTitleCase";
import { useField, useFormikContext } from "formik";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";

type Option = { value: string; label: string };

type FormikAutocompleteProps<T, O extends Option = Option> = Omit<
  AutocompleteProps,
  "selected" | "onSelect" | "loading" | "textField"
> & {
  name: string;
  deselectedOptions?: O[];
  selectedTagPosition?: "top" | "bottom";
  paginationInterval?: number;
  asyncRequest?: (value?: string) => void;
  asyncRequestHelper?: (data: T) => O[];
  asyncRequestPageInfo?: (data: T) => IPageInfo;
  fetcher?: FetcherWithComponents<T>;
  label?: string;
  placeholder?: string;
  renderSelectedTags?: (removeTag: (tag: string) => void) => React.ReactNode;
  searchAsync?: boolean;
};

export default function FormikAutocomplete<T, O extends Option = Option>({
  name,
  deselectedOptions = [],
  selectedTagPosition = "bottom",
  paginationInterval = 12,
  asyncRequest,
  asyncRequestHelper,
  asyncRequestPageInfo = () => ({
    hasNextPage: false,
    endCursor: null,
    hasPreviousPage: false,
    startCursor: null,
  }),
  fetcher,
  label = "",
  placeholder = "Search...",
  renderSelectedTags,
  searchAsync = true,
  ...rest
}: FormikAutocompleteProps<T, O>) {
  const [field, meta, helpers] = useField(name);
  const [inputField, inputMeta] = useField(`${name}Input`);
  const { setFieldValue } = useFormikContext<any>();
  const [inputValue, setInputValue] = useState("");
  const debounceInputValue = useDebounce(inputValue);

  const selectedOptions = useMemo(() => field.value || [], [field.value]);
  const [finalOptions, setFinalOptions] = useState<O[]>(deselectedOptions);
  const [originOptions, setOriginOptions] = useState<O[]>([]);
  const [visibleOptionIndex, setVisibleOptionIndex] =
    useState(paginationInterval);
  const pageInfoRef = useRef<IPageInfo>();
  const fetcherLoadMore = useFetcher<T>();
  const [fetcherForm, setFetcherForm] = useState<{
    action: string | undefined;
    method: string;
  }>();

  const mergeUniqueOptions = (prev: O[], next: O[]) => {
    const map = new Map<string, O>();
    [...prev, ...next].forEach((item) => map.set(item.value, item));
    return Array.from(map.values());
  };

  useEffect(() => {
    if (asyncRequest && searchAsync) asyncRequest(debounceInputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceInputValue]);

  useEffect(() => {
    if (asyncRequest) asyncRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fetcher?.data && asyncRequestHelper && !fetcherLoadMore.data) {
      const newOptions = asyncRequestHelper(fetcher.data as T);
      pageInfoRef.current = asyncRequestPageInfo(fetcher.data);
      setFinalOptions(newOptions);
      setOriginOptions(newOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.data]);

  useEffect(() => {
    if (fetcher?.state === "submitting" || fetcher?.state === "loading") {
      setFetcherForm({
        action: fetcher.formAction,
        method: fetcher.formMethod as "POST",
      });
    }
  }, [fetcher]);

  useEffect(() => {
    if (fetcherLoadMore?.data && asyncRequestHelper) {
      const newOptions = asyncRequestHelper(fetcherLoadMore.data as T);
      pageInfoRef.current = asyncRequestPageInfo(fetcherLoadMore.data as T);

      setFinalOptions((prev) => mergeUniqueOptions(prev, newOptions));
      setOriginOptions((prev) => mergeUniqueOptions(prev, newOptions));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcherLoadMore.data]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return finalOptions;
    return finalOptions.filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [inputValue, finalOptions]);

  const displayedOptions = useMemo(
    () => filteredOptions.slice(0, visibleOptionIndex),
    [filteredOptions, visibleOptionIndex],
  );

  const willLoadMoreResults = useMemo(
    () => filteredOptions.length > visibleOptionIndex,
    [filteredOptions, visibleOptionIndex],
  );

  const updateText = useCallback((value: string) => {
    setInputValue(value);
    inputField.onChange(value);
  }, []);

  useEffect(() => {
    setVisibleOptionIndex(paginationInterval);
  }, [paginationInterval]);

  const handleLoadMoreResults = useCallback(() => {
    if (pageInfoRef.current?.hasNextPage && fetcherLoadMore.state === "idle") {
      const formData = new FormData();
      formData.append("cursor", pageInfoRef.current.endCursor ?? "");
      formData.append("direction", "next");
      if (fetcherForm) {
        fetcherLoadMore.submit(formData, {
          action: fetcherForm.action,
          method: fetcherForm.method as "POST",
        });
        setVisibleOptionIndex((prev) => prev + paginationInterval);
      }
    }
  }, [fetcherForm, fetcherLoadMore, paginationInterval]);

  const removeTag = useCallback(
    (tag: string) => () => {
      helpers.setValue(selectedOptions.filter((item: O) => item.value !== tag));
    },
    [selectedOptions, helpers],
  );

  const renderedTags =
    selectedOptions.length > 0 ? (
      renderSelectedTags ? (
        renderSelectedTags(removeTag)
      ) : (
        <LegacyStack spacing="extraTight" alignment="center">
          {selectedOptions.map((option: O) => (
            <Tag key={option.value} onRemove={removeTag(option.value)}>
              {toTitleCase(option.label.replace(/_/g, " "))}
            </Tag>
          ))}
        </LegacyStack>
      )
    ) : null;

  console.log("meta.error", meta.error);

  const textField = (
    <Autocomplete.TextField
      {...inputField}
      name={`${name}Input`}
      onChange={updateText}
      label={label}
      value={inputValue}
      placeholder={placeholder}
      verticalContent={selectedTagPosition === "top" ? renderedTags : null}
      autoComplete="off"
      prefix={<Icon source={SearchIcon} tone="base" />}
      error={inputMeta.error ? inputMeta.error : undefined}
    />
  );

  const emptyState = (
    <div style={{ textAlign: "center" }}>
      <Icon source={SearchIcon} />
      <TextContainer>Could not find any results</TextContainer>
    </div>
  );

  useEffect(() => {
    setFieldValue(`${name}State`, {
      inputValue,
      displayedOptions,
      visibleIndex: visibleOptionIndex,
      willLoadMore: willLoadMoreResults,
      filteredOptions,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, filteredOptions, visibleOptionIndex, willLoadMoreResults]);

  return (
    <LegacyStack vertical>
      <Autocomplete
        {...rest}
        allowMultiple
        options={displayedOptions}
        selected={selectedOptions.map((item: O) => item.value)}
        textField={textField}
        onSelect={(newSelected) => {
          const newSelectedOptions = originOptions.filter((item) =>
            newSelected.includes(item.value),
          );
          helpers.setValue(newSelectedOptions);
        }}
        loading={fetcherLoadMore.state !== "idle" || fetcher?.state !== "idle"}
        onLoadMoreResults={handleLoadMoreResults}
        willLoadMoreResults={pageInfoRef.current?.hasNextPage}
        emptyState={emptyState}
      />
      {selectedTagPosition === "bottom" && renderedTags}
    </LegacyStack>
  );
}
