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
import toTitleCase from "app/utils/toTitleCase";
import { useField } from "formik";
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
  asyncRequest?: () => void;
  asyncRequestHelper?: (data: T) => O[];
  fetcher?: FetcherWithComponents<T>;
  label?: string;
  placeholder?: string;
  renderSelectedTags?: (
    selectedOptions: string[],
    options: O[],
    removeTag: (tag: string) => void,
  ) => React.ReactNode;
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
  ...rest
}: FormikAutocompleteProps<T, O>) {
  const [field, meta, helpers] = useField(name);
  const selectedOptions = useMemo(() => field.value || [], [field.value]);

  const [finalOptions, setFinalOptions] = useState<O[]>(deselectedOptions);
  const [inputValue, setInputValue] = useState("");
  const [visibleOptionIndex, setVisibleOptionIndex] =
    useState(paginationInterval);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (asyncRequest) {
      asyncRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (asyncRequestHelper && fetcher?.data) {
      setFinalOptions(asyncRequestHelper(fetcher.data));
    }
  }, [fetcher?.data, asyncRequestHelper]);

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
      helpers.setValue(selectedOptions.filter((item: string) => item !== tag));
    },
    [selectedOptions, helpers],
  );

  const renderedTags =
    selectedOptions.length > 0 ? (
      renderSelectedTags ? (
        renderSelectedTags(selectedOptions, finalOptions, removeTag)
      ) : (
        <LegacyStack spacing="extraTight" alignment="center">
          {selectedOptions.map((option: string) => (
            <Tag key={option} onRemove={removeTag(option)}>
              {toTitleCase(option.replace(/_/g, " "))}
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

  return (
    <LegacyStack vertical>
      <Autocomplete
        {...rest}
        allowMultiple
        options={displayedOptions}
        selected={selectedOptions}
        textField={textField}
        onSelect={(newSelected) => {
          helpers.setValue(newSelected);
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
