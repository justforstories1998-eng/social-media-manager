# Tracker Expansion — 8 Features

## Scope
Expand WonderMedia's Inventory Tracker with 8 new features to make it a full sales & inventory analytics platform.

## Features

### 1. Sales Analytics Charts
- Revenue Trend (LineChart), Sales vs Returns (BarChart), Profit Trend (AreaChart), Top Products by Revenue (horizontal BarChart)
- Use recharts (already installed), responsive, purple/pink/green palette
- Filtered by date range

### 2. Date Range Filtering
- Date range picker (From/To) on dashboard filter bar and detail page history tabs
- Quick buttons: This Month, Last 30 Days, Last 90 Days, All Time
- Default: last 30 days
- Applies to: stat cards, charts, history tables, export CSV
- Backend already supports dateFrom/dateTo on most routes

### 3. Transaction History Page
- New page: /tracker/transactions
- Unified feed of all sales + stock movements merged by date
- Columns: Date, Type, Product, Quantity, Amount, Customer, Notes
- Color-coded type badges, search, date filter, product filter, export CSV
- Add to Sidebar and MobileNav

### 4. Stock Adjustment Modal
- Backend: expose existing adjustStock() via POST /tracker/adjust
- DTO: trackerProductId, quantity (signed), notes
- Modal: product selector, current stock display, adjustment amount, notes
- Validation: cannot reduce below 0

### 5. Reorder Alerts & Notifications
- Low Stock alert banner (amber) with count + "View All" link
- Out of Stock alert banner (red)
- Reorder Suggestions table: Product, Current Stock, Threshold, Reorder Qty, Supplier Contact

### 6. Bulk Actions
- Checkbox column on product rows/cards
- Select All checkbox in header
- Bulk Action Bar: Bulk Record Sale, Bulk Export, Bulk Archive, Bulk Add Stock

### 7. Profit Margin Breakdown
- Profit Margin by Product (horizontal BarChart)
- Cost vs Revenue Breakdown (PieChart or StackedBar)
- Margin stat card on detail page already exists

### 8. Sales by Customer
- Customer Leaderboard table: top customers by total spent, orders, last purchase
- Customer Insights card: unique customers, repeat rate, avg order value
- Sales by Customer Chart (BarChart) — top 10 by revenue

## Files
- backend/src/tracker/tracker.controller.ts — add POST /tracker/adjust
- backend/src/tracker/tracker.service.ts — expose adjustStock, add getCustomerAnalytics, date filtering on getTransactions
- backend/src/tracker/dto/create-adjustment.dto.ts — new DTO
- frontend/app/(authenticated)/tracker/page.tsx — major rebuild
- frontend/app/(authenticated)/tracker/[id]/page.tsx — date filtering
- frontend/app/(authenticated)/tracker/transactions/page.tsx — new page
- frontend/components/DateRangeFilter.tsx — reusable component
- frontend/components/StockAdjustmentModal.tsx — reusable component
- frontend/components/Sidebar.tsx — add Transactions link
- frontend/components/MobileNav.tsx — add Transactions link
