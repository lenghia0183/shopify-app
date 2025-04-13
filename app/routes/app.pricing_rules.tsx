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
  PRICE_DISCOUNT_TYPE,
  PRICING_RULE_STATUS,
} from "app/constants/pricingRule";

type PricingRule = {
  id: string;
  name: string;
  priority: number;
  status: string;
  applyTo: string;
  priceType: string;
  priceValue: string;
  createdAt: Date;
  updatedAt: Date;
};

type LoaderData = {
  pricingRules: PricingRule[];
  totalRules: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = 10; // Số lượng items trên mỗi trang
  const skip = (page - 1) * pageSize;

  // Đếm tổng số rules
  const totalRules = await prisma.pricingRule.count();
  const totalPages = Math.ceil(totalRules / pageSize);

  const pricingRules = await prisma.pricingRule.findMany({
    orderBy: {
      priority: "asc",
    },
    take: pageSize,
    skip: skip,
  });

  return json<LoaderData>({
    pricingRules,
    totalRules,
    currentPage: page,
    totalPages,
    pageSize,
  });
};

export default function PricingRulesPage() {
  const { pricingRules, totalRules, currentPage, totalPages, pageSize } =
    useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const resourceName = {
    singular: "pricing rule",
    plural: "pricing rules",
  };

  const renderBadgeForStatus = (status: string) => {
    if (status === PRICING_RULE_STATUS.ENABLE) {
      return <Badge tone="success">Active</Badge>;
    } else {
      return <Badge tone="warning">Disabled</Badge>;
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
    const priceType = JSON.parse(rule.priceType);
    const priceTypeLabel =
      priceType[0] === PRICE_DISCOUNT_TYPE.SET_NEW_PRICE
        ? "Set Price"
        : "Apply Discount";

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
