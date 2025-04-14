import { useCallback } from "react";
import {
  Page,
  IndexTable,
  LegacyCard,
  Text,
  Badge,
  useIndexResourceState,
} from "@shopify/polaris";
import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import prisma from "../db.server";
import {
  APPLY_TO_OPTIONS_LABEL,
  type IPricingRuleStatus,
  PRICE_DISCOUNT_TYPE_LABEL,
  PRICING_RULE_STATUS,
  PRICING_RULE_STATUS_LABEL,
} from "app/constants/pricingRule";
import {
  type PricingRule,
  type IGetPricingRulesResponse,
} from "app/types/pricingRule";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const totalRules = await prisma.pricingRule.count();
  const totalPages = Math.ceil(totalRules / pageSize);

  const pricingRules = await prisma.pricingRule.findMany({
    orderBy: {
      priority: "asc",
    },
    take: pageSize,
    skip: skip,
  });

  return json<IGetPricingRulesResponse>({
    success: true,
    message: "Success",
    data: {
      pricingRules: pricingRules as PricingRule[],
    },
    meta: {
      totalRules,
      currentPage: page,
      totalPages,
      pageSize,
    },
  });
};

export default function PricingRulesPage() {
  const { data, meta } = useLoaderData<IGetPricingRulesResponse>();
  const { pricingRules } = data;
  const { totalRules, currentPage, totalPages, pageSize } = meta;
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const resourceName = {
    singular: "pricing rule",
    plural: "pricing rules",
  };

  const renderBadgeForStatus = (status: IPricingRuleStatus) => {
    if (status === PRICING_RULE_STATUS.ENABLE) {
      return <Badge tone="success">{PRICING_RULE_STATUS_LABEL[status]}</Badge>;
    } else {
      return <Badge tone="warning">{PRICING_RULE_STATUS_LABEL[status]}</Badge>;
    }
  };

  const handleCreateRule = useCallback(() => {
    navigate("/app/pricing_rule");
  }, [navigate]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setSearchParams({ page: (currentPage - 1).toString() });
    }
  }, [currentPage, setSearchParams]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setSearchParams({ page: (currentPage + 1).toString() });
    }
  }, [currentPage, totalPages, setSearchParams]);

  const pagination = {
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
    onNext: handleNextPage,
    onPrevious: handlePreviousPage,
    label: `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalRules)} of ${totalRules} pricing rules`,
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(pricingRules);

  const bulkActions = [
    {
      destructive: true,
      content: "Remove",
      onAction: () => console.log("Xóa các rule đã chọn", selectedResources),
    },
  ];

  const rowMarkup = pricingRules.map((rule, index) => {
    const { id } = rule;
    const priceTypeLabel =
      PRICE_DISCOUNT_TYPE_LABEL[
        rule.priceType as keyof typeof PRICE_DISCOUNT_TYPE_LABEL
      ];
    const labelApplyTo =
      APPLY_TO_OPTIONS_LABEL[
        rule.applyTo as keyof typeof APPLY_TO_OPTIONS_LABEL
      ];

    return (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
        onClick={() => navigate(`/app/pricing_rule/${id}`)}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {rule.name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{rule.priority}</IndexTable.Cell>
        <IndexTable.Cell>{labelApplyTo}</IndexTable.Cell>
        <IndexTable.Cell>{priceTypeLabel}</IndexTable.Cell>
        <IndexTable.Cell>{rule.priceValue}</IndexTable.Cell>
        <IndexTable.Cell>{renderBadgeForStatus(rule.status)}</IndexTable.Cell>
        <IndexTable.Cell>
          {new Date(rule.createdAt).toLocaleString()}
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page
      title="Pricing Rules"
      primaryAction={{
        content: "Create new rule",
        onAction: handleCreateRule,
      }}
    >
      <LegacyCard>
        <IndexTable
          resourceName={resourceName}
          itemCount={pricingRules.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Name" },
            { title: "Priority" },
            { title: "Apply to" },
            { title: "Price Type" },
            { title: "Value" },
            { title: "Status" },
            { title: "Created" },
          ]}
          bulkActions={bulkActions}
          pagination={pagination}
          selectable
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>
    </Page>
  );
}
