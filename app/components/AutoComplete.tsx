import { type FetcherWithComponents } from "@remix-run/react";
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
import toTitleCase from "app/utils/toTitleCase";
import { useField, useFormikContext } from "formik";
import { useEffect, useMemo, useState, useCallback } from "react";

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
  paginationInterval = 10,
  asyncRequest,
  asyncRequestHelper,
  fetcher,
  label = "",
  placeholder = "Search...",
  options: _ignored,
  renderSelectedTags,
  searchAsync = true,
  ...rest
}: FormikAutocompleteProps<T, O>) {
  const [field, meta, helpers] = useField(name);
  const { setFieldValue } = useFormikContext<any>();

  const selectedOptions = useMemo(() => field.value || [], [field.value]);

  const [finalOptions, setFinalOptions] = useState<O[]>(deselectedOptions);
  const [originOptions, setOriginOptions] = useState<O[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [visibleOptionIndex, setVisibleOptionIndex] =
    useState(paginationInterval);
  const [isLoading, setIsLoading] = useState(false);
  const debounceInputValue = useDebounce(inputValue);
  useEffect(() => {
    if (asyncRequest && searchAsync) {
      asyncRequest(debounceInputValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceInputValue]);

  useEffect(() => {
    if (asyncRequest) {
      asyncRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (asyncRequestHelper && fetcher?.data) {
      setFinalOptions(asyncRequestHelper(fetcher.data));
      setOriginOptions(asyncRequestHelper(fetcher.data));
    }
  }, [fetcher?.data, asyncRequestHelper]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return finalOptions;
    return finalOptions.filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase()),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, []);

  useEffect(() => {
    setVisibleOptionIndex(paginationInterval);
  }, [inputValue, paginationInterval]);

  const handleLoadMoreResults = useCallback(() => {
    if (!willLoadMoreResults) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleOptionIndex((prev) =>
        Math.min(prev + paginationInterval, filteredOptions.length),
      );
      setIsLoading(false);
    }, 300);
  }, [willLoadMoreResults, paginationInterval, filteredOptions.length]);

  const removeTag = useCallback(
    (tag: string) => () => {
      helpers.setValue(
        selectedOptions.filter((item: any) => item.value !== tag),
      );
    },
    [selectedOptions, helpers],
  );

  const renderedTags =
    selectedOptions.length > 0 ? (
      renderSelectedTags ? (
        renderSelectedTags(removeTag)
      ) : (
        <LegacyStack spacing="extraTight" alignment="center">
          {selectedOptions.map((option: any) => (
            <Tag key={option.value} onRemove={removeTag(option.value)}>
              {toTitleCase(option?.label?.replace(/_/g, " "))}
            </Tag>
          ))}
        </LegacyStack>
      )
    ) : null;

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label={label}
      value={inputValue}
      placeholder={placeholder}
      verticalContent={selectedTagPosition === "top" ? renderedTags : null}
      autoComplete="off"
      prefix={<Icon source={SearchIcon} tone="base" />}
      error={meta.touched && meta.error ? meta.error : undefined}
    />
  );

  const emptyState = (
    <>
      <Icon source={SearchIcon} />
      <div style={{ textAlign: "center" }}>
        <TextContainer>Could not find any results</TextContainer>
      </div>
    </>
  );

  useEffect(() => {
    setFieldValue(`${name}State`, {
      inputValue,
      displayedOptions: displayedOptions,
      visibleIndex: visibleOptionIndex,
      willLoadMore: willLoadMoreResults,
      filteredOptions: filteredOptions,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, visibleOptionIndex, willLoadMoreResults, name]);

  return (
    <LegacyStack vertical>
      <Autocomplete
        {...rest}
        allowMultiple
        options={displayedOptions}
        selected={selectedOptions.map((item: any) => item?.value)}
        textField={textField}
        onSelect={(newSelected) => {
          const newSelectedOptions = originOptions.filter((item) =>
            newSelected.includes(item.value),
          );

          helpers.setValue(newSelectedOptions);
        }}
        loading={
          isLoading ||
          fetcher?.state === "submitting" ||
          fetcher?.state === "loading"
        }
        onLoadMoreResults={handleLoadMoreResults}
        willLoadMoreResults={willLoadMoreResults}
        emptyState={emptyState}
      />
      {selectedTagPosition === "bottom" && renderedTags}
    </LegacyStack>
  );
}
