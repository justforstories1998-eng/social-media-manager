import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { UpdateTrackerProductDto } from './dto/update-tracker-product.dto';

@Injectable()
export class TrackerService {
  constructor(private prisma: PrismaService) {}

  async syncProducts(userId: string) {
    const products = await this.prisma.product.findMany({
      where: { userId },
    });

    const existingTrackerProducts = await this.prisma.trackerProduct.findMany({
      where: { userId },
      select: { productId: true },
    });

    const existingProductIds = new Set(existingTrackerProducts.map((tp) => tp.productId));

    const newProducts = products.filter((p) => !existingProductIds.has(p.id));

    if (newProducts.length > 0) {
      await this.prisma.trackerProduct.createMany({
        data: newProducts.map((product) => ({
          userId,
          productId: product.id,
          sku: product.sku || null,
          sellingPrice: product.price || null,
          purchasePrice: null,
        })),
      });
    }

    return this.findAll(userId);
  }

  async findAll(
    userId: string,
    filters?: {
      search?: string;
      category?: string;
      status?: string;
      sortBy?: string;
      sortDir?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const where: any = { userId, isArchived: false };

    if (filters?.search) {
      where.OR = [
        { product: { name: { contains: filters.search, mode: 'insensitive' } } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { product: { category: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters?.category) {
      where.product = { ...where.product, category: filters.category };
    }

    const trackerProducts = await this.prisma.trackerProduct.findMany({
      where,
      include: {
        product: true,
        sales: {
          where: filters?.dateFrom || filters?.dateTo
            ? {
                saleDate: {
                  ...(filters?.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
                  ...(filters?.dateTo ? { lte: new Date(filters.dateTo) } : {}),
                },
              }
            : undefined,
        },
        stockMovements: true,
      },
    });

    const enrichedProducts = trackerProducts.map((tp) => {
      const currentStock = tp.stockMovements.reduce((sum, sm) => sum + sm.quantity, 0);

      const netSales = tp.sales.reduce((sum, sale) => {
        if (sale.isReturn) return sum - sale.quantity;
        return sum + sale.quantity;
      }, 0);

      const revenue = tp.sales.reduce((sum, sale) => {
        const amount = Number(sale.totalPrice);
        if (sale.isReturn) return sum - amount;
        return sum + amount;
      }, 0);

      const purchasePrice = tp.purchasePrice ? Number(tp.purchasePrice) : 0;
      const estimatedProfit = netSales > 0 ? revenue - purchasePrice * netSales : 0;

      let status = 'in_stock';
      if (currentStock <= 0) status = 'out_of_stock';
      else if (currentStock <= tp.lowStockThreshold) status = 'low_stock';

      return {
        ...tp,
        currentStock,
        totalSold: netSales,
        totalRevenue: revenue,
        totalCost: purchasePrice * netSales,
        profit: estimatedProfit,
        currency: tp.currency || tp.product.currency || 'USD',
        status,
      };
    });

    let filtered = enrichedProducts;

    if (filters?.status) {
      switch (filters.status) {
        case 'in_stock':
          filtered = enrichedProducts.filter((p) => p.status === 'in_stock');
          break;
        case 'low_stock':
          filtered = enrichedProducts.filter((p) => p.status === 'low_stock');
          break;
        case 'out_of_stock':
          filtered = enrichedProducts.filter((p) => p.status === 'out_of_stock');
          break;
        case 'best_sellers':
          filtered = [...enrichedProducts].sort((a, b) => b.totalSold - a.totalSold);
          break;
        case 'slow_moving':
          filtered = enrichedProducts.filter((p) => p.totalSold < 5);
          break;
      }
    }

    if (filters?.sortBy) {
      const dir = filters.sortDir === 'asc' ? 1 : -1;
      filtered.sort((a: any, b: any) => {
        if (a[filters.sortBy!] < b[filters.sortBy!]) return -1 * dir;
        if (a[filters.sortBy!] > b[filters.sortBy!]) return 1 * dir;
        return 0;
      });
    }

    return filtered;
  }

  async findOne(userId: string, id: string) {
    const trackerProduct = await this.prisma.trackerProduct.findFirst({
      where: { id, userId },
      include: {
        product: true,
        sales: { orderBy: { saleDate: 'desc' } },
        stockMovements: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!trackerProduct) {
      throw new NotFoundException('Tracker product not found');
    }

    const currentStock = trackerProduct.stockMovements.reduce((sum, sm) => sum + sm.quantity, 0);

    const netSales = trackerProduct.sales.reduce((sum, sale) => {
      if (sale.isReturn) return sum - sale.quantity;
      return sum + sale.quantity;
    }, 0);

    const revenue = trackerProduct.sales.reduce((sum, sale) => {
      const amount = Number(sale.totalPrice);
      if (sale.isReturn) return sum - amount;
      return sum + amount;
    }, 0);

    const purchasePrice = trackerProduct.purchasePrice ? Number(trackerProduct.purchasePrice) : 0;
    const estimatedProfit = netSales > 0 ? revenue - purchasePrice * netSales : 0;

    let status = 'in_stock';
    if (currentStock <= 0) status = 'out_of_stock';
    else if (currentStock <= trackerProduct.lowStockThreshold) status = 'low_stock';

    return {
      ...trackerProduct,
      currentStock,
      totalSold: netSales,
      totalRevenue: revenue,
      totalCost: purchasePrice * netSales,
      profit: estimatedProfit,
      currency: trackerProduct.currency || trackerProduct.product.currency || 'USD',
      status,
    };
  }

  async getDashboard(userId: string, dateFrom?: string, dateTo?: string) {
    const trackerProducts = await this.prisma.trackerProduct.findMany({
      where: { userId, isArchived: false },
      include: {
        product: true,
        sales: {
          where: dateFrom || dateTo
            ? {
                saleDate: {
                  ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                  ...(dateTo ? { lte: new Date(dateTo) } : {}),
                },
              }
            : undefined,
        },
        stockMovements: true,
      },
    });

    let totalStock = 0;
    let totalUnitsSold = 0;
    let totalSalesRevenue = 0;
    let totalInventoryValue = 0;
    let totalEstimatedProfit = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;

    for (const tp of trackerProducts) {
      const currentStock = tp.stockMovements.reduce((sum, sm) => sum + sm.quantity, 0);
      totalStock += currentStock;

      const netSales = tp.sales.reduce((sum, sale) => {
        if (sale.isReturn) return sum - sale.quantity;
        return sum + sale.quantity;
      }, 0);
      totalUnitsSold += netSales;

      const revenue = tp.sales.reduce((sum, sale) => {
        const amount = Number(sale.totalPrice);
        if (sale.isReturn) return sum - amount;
        return sum + amount;
      }, 0);
      totalSalesRevenue += revenue;

      const purchasePrice = tp.purchasePrice ? Number(tp.purchasePrice) : 0;
      totalInventoryValue += currentStock * purchasePrice;
      totalEstimatedProfit += netSales > 0 ? revenue - purchasePrice * netSales : 0;

      if (currentStock <= 0) outOfStockItems++;
      else if (currentStock <= tp.lowStockThreshold) lowStockItems++;
    }

    return {
      totalProducts: trackerProducts.length,
      totalStock,
      totalUnitsSold,
      totalSalesRevenue,
      totalInventoryValue,
      estimatedProfit: totalEstimatedProfit,
      lowStockItems,
      outOfStockItems,
    };
  }

  async recordSale(userId: string, dto: CreateSaleDto) {
    const trackerProduct = await this.prisma.trackerProduct.findFirst({
      where: { id: dto.trackerProductId, userId },
      include: { stockMovements: true },
    });

    if (!trackerProduct) {
      throw new NotFoundException('Tracker product not found');
    }

    if (!dto.isReturn) {
      const currentStock = trackerProduct.stockMovements.reduce((sum, sm) => sum + sm.quantity, 0);
      if (currentStock < dto.quantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${currentStock}, Requested: ${dto.quantity}`);
      }
    }

    const totalPrice = dto.unitPrice * dto.quantity;

    const sale = await this.prisma.sale.create({
      data: {
        userId,
        trackerProductId: dto.trackerProductId,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        totalPrice,
        saleDate: dto.saleDate ? new Date(dto.saleDate) : new Date(),
        customerName: dto.customerName,
        notes: dto.notes,
        isReturn: dto.isReturn || false,
        returnReason: dto.returnReason,
      },
    });

    await this.prisma.stockMovement.create({
      data: {
        userId,
        trackerProductId: dto.trackerProductId,
        type: dto.isReturn ? 'return' : 'sale',
        quantity: dto.isReturn ? dto.quantity : -dto.quantity,
        notes: dto.isReturn ? `Return: ${dto.returnReason || 'No reason'}` : 'Sale',
        referenceId: sale.id,
      },
    });

    return sale;
  }

  async addStock(userId: string, dto: CreateStockMovementDto) {
    const trackerProduct = await this.prisma.trackerProduct.findFirst({
      where: { id: dto.trackerProductId, userId },
    });

    if (!trackerProduct) {
      throw new NotFoundException('Tracker product not found');
    }

    if (dto.purchasePrice && dto.purchasePrice > 0) {
      await this.prisma.trackerProduct.update({
        where: { id: dto.trackerProductId },
        data: { purchasePrice: dto.purchasePrice },
      });
    }

    return this.prisma.stockMovement.create({
      data: {
        userId,
        trackerProductId: dto.trackerProductId,
        type: dto.type,
        quantity: Math.abs(dto.quantity),
        notes: dto.notes,
        referenceId: dto.referenceId,
      },
    });
  }

  async syncSingle(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.trackerProduct.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.trackerProduct.create({
      data: {
        userId,
        productId: product.id,
        sku: product.sku || null,
        sellingPrice: product.price || null,
        purchasePrice: null,
      },
    });
  }

  async archiveProduct(userId: string, id: string) {
    const trackerProduct = await this.prisma.trackerProduct.findFirst({
      where: { id, userId },
    });

    if (!trackerProduct) {
      throw new NotFoundException('Tracker product not found');
    }

    return this.prisma.trackerProduct.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async adjustStock(userId: string, dto: CreateAdjustmentDto) {
    const trackerProduct = await this.prisma.trackerProduct.findFirst({
      where: { id: dto.trackerProductId, userId },
      include: { stockMovements: true },
    });

    if (!trackerProduct) {
      throw new NotFoundException('Tracker product not found');
    }

    const currentStock = trackerProduct.stockMovements.reduce((sum, sm) => sum + sm.quantity, 0);
    const newStock = currentStock + dto.quantity;

    if (newStock < 0) {
      throw new BadRequestException(`Adjustment would result in negative stock. Current: ${currentStock}, Adjustment: ${dto.quantity}`);
    }

    return this.prisma.stockMovement.create({
      data: {
        userId,
        trackerProductId: dto.trackerProductId,
        type: 'adjustment',
        quantity: dto.quantity,
        notes: dto.notes || `Stock adjustment from ${currentStock} to ${newStock}`,
        referenceId: dto.referenceId,
      },
    });
  }

  async getSalesHistory(userId: string, trackerProductId: string, dateFrom?: string, dateTo?: string) {
    const trackerProduct = await this.prisma.trackerProduct.findFirst({
      where: { id: trackerProductId, userId },
    });

    if (!trackerProduct) {
      throw new NotFoundException('Tracker product not found');
    }

    const where: any = { trackerProductId };
    if (dateFrom || dateTo) {
      where.saleDate = {};
      if (dateFrom) where.saleDate.gte = new Date(dateFrom);
      if (dateTo) where.saleDate.lte = new Date(dateTo);
    }

    return this.prisma.sale.findMany({
      where,
      orderBy: { saleDate: 'desc' },
    });
  }

  async getStockHistory(userId: string, trackerProductId: string, dateFrom?: string, dateTo?: string) {
    const trackerProduct = await this.prisma.trackerProduct.findFirst({
      where: { id: trackerProductId, userId },
    });

    if (!trackerProduct) {
      throw new NotFoundException('Tracker product not found');
    }

    const where: any = { trackerProductId };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    return this.prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductStats(userId: string, trackerProductId: string) {
    const trackerProduct = await this.prisma.trackerProduct.findFirst({
      where: { id: trackerProductId, userId },
      include: {
        product: true,
        sales: true,
        stockMovements: true,
      },
    });

    if (!trackerProduct) {
      throw new NotFoundException('Tracker product not found');
    }

    const currentStock = trackerProduct.stockMovements.reduce((sum, sm) => sum + sm.quantity, 0);

    const totalSales = trackerProduct.sales.filter((s) => !s.isReturn);
    const totalReturns = trackerProduct.sales.filter((s) => s.isReturn);

    const unitsSold = totalSales.reduce((sum, s) => sum + s.quantity, 0);
    const unitsReturned = totalReturns.reduce((sum, s) => sum + s.quantity, 0);
    const revenue = totalSales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
    const refundAmount = totalReturns.reduce((sum, s) => sum + Number(s.totalPrice), 0);

    const purchasePrice = trackerProduct.purchasePrice ? Number(trackerProduct.purchasePrice) : 0;
    const sellingPrice = trackerProduct.sellingPrice ? Number(trackerProduct.sellingPrice) : 0;

    const avgOrderValue = unitsSold > 0 ? revenue / unitsSold : 0;
    const estimatedProfit = revenue - refundAmount - purchasePrice * (unitsSold - unitsReturned);

    const restockCount = trackerProduct.stockMovements.filter((sm) => sm.type === 'restock').length;
    const lastRestock = trackerProduct.stockMovements
      .filter((sm) => sm.type === 'restock')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return {
      trackerProduct,
      currentStock,
      unitsSold,
      unitsReturned,
      revenue,
      refundAmount,
      avgOrderValue,
      estimatedProfit,
      purchasePrice,
      sellingPrice,
      restockCount,
      lastRestock: lastRestock?.createdAt || null,
      totalTransactions: trackerProduct.sales.length + trackerProduct.stockMovements.length,
    };
  }

  async updateTrackerProduct(userId: string, id: string, dto: UpdateTrackerProductDto) {
    const trackerProduct = await this.prisma.trackerProduct.findFirst({
      where: { id, userId },
    });

    if (!trackerProduct) {
      throw new NotFoundException('Tracker product not found');
    }

    return this.prisma.trackerProduct.update({
      where: { id },
      data: dto,
    });
  }

  async getTransactions(userId: string, trackerProductId?: string, dateFrom?: string, dateTo?: string) {
    const where: any = { userId };
    if (trackerProductId) where.trackerProductId = trackerProductId;

    const saleWhere: any = { ...where };
    const smWhere: any = { ...where };

    if (dateFrom || dateTo) {
      const dateFilter: any = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      saleWhere.saleDate = dateFilter;
      smWhere.createdAt = dateFilter;
    }

    const [sales, stockMovements] = await Promise.all([
      this.prisma.sale.findMany({
        where: saleWhere,
        include: { trackerProduct: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.findMany({
        where: smWhere,
        include: { trackerProduct: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const transactions = [
      ...sales.map((s) => ({ ...s, transactionType: 'sale' })),
      ...stockMovements.map((sm) => ({ ...sm, transactionType: 'stock_movement' })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return transactions;
  }

  async getCustomerAnalytics(userId: string, trackerProductId?: string) {
    const saleWhere: any = { userId, isReturn: false };
    if (trackerProductId) saleWhere.trackerProductId = trackerProductId;

    const sales = await this.prisma.sale.findMany({
      where: saleWhere,
      include: { trackerProduct: { include: { product: true } } },
      orderBy: { saleDate: 'desc' },
    });

    const customerMap = new Map<string, {
      name: string;
      totalSpent: number;
      totalOrders: number;
      totalUnits: number;
      lastPurchase: Date;
      products: Map<string, { name: string; units: number; revenue: number }>;
    }>();

    for (const sale of sales) {
      const name = sale.customerName || 'Unknown';
      if (!customerMap.has(name)) {
        customerMap.set(name, {
          name,
          totalSpent: 0,
          totalOrders: 0,
          totalUnits: 0,
          lastPurchase: sale.saleDate,
          products: new Map(),
        });
      }
      const customer = customerMap.get(name)!;
      customer.totalSpent += Number(sale.totalPrice);
      customer.totalOrders += 1;
      customer.totalUnits += sale.quantity;
      if (new Date(sale.saleDate) > customer.lastPurchase) {
        customer.lastPurchase = sale.saleDate;
      }

      const productName = sale.trackerProduct?.product?.name || 'Unknown';
      if (!customer.products.has(productName)) {
        customer.products.set(productName, { name: productName, units: 0, revenue: 0 });
      }
      const product = customer.products.get(productName)!;
      product.units += sale.quantity;
      product.revenue += Number(sale.totalPrice);
    }

    const customers = Array.from(customerMap.values())
      .map((c) => ({
        name: c.name,
        totalSpent: c.totalSpent,
        totalOrders: c.totalOrders,
        totalUnits: c.totalUnits,
        lastPurchase: c.lastPurchase,
        avgOrderValue: c.totalOrders > 0 ? c.totalSpent / c.totalOrders : 0,
        topProducts: Array.from(c.products.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 3),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    const uniqueCustomers = customers.length;
    const repeatCustomers = customers.filter((c) => c.totalOrders > 1).length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);

    return {
      customers,
      summary: {
        uniqueCustomers,
        repeatCustomers,
        repeatCustomerRate: uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        totalRevenue,
        totalOrders,
      },
    };
  }

  async exportCSV(userId: string, filters?: { search?: string; category?: string; dateFrom?: string; dateTo?: string; trackerProductIds?: string[] }) {
    const products = await this.findAll(userId, filters);

    const headers = [
      'ID',
      'Product Name',
      'SKU',
      'Category',
      'Current Stock',
      'Units Sold',
      'Revenue',
      'Purchase Price',
      'Selling Price',
      'Estimated Profit',
      'Status',
      'Low Stock Threshold',
      'Supplier',
      'Last Updated',
    ];

    const rows = products.map((p) => [
      p.id,
      p.product.name,
      p.sku || '',
      p.product.category || '',
      p.currentStock,
      p.totalSold,
      p.totalRevenue.toFixed(2),
      p.purchasePrice ? Number(p.purchasePrice).toFixed(2) : '',
      p.sellingPrice ? Number(p.sellingPrice).toFixed(2) : '',
      p.profit.toFixed(2),
      p.status,
      p.lowStockThreshold,
      p.supplierName || '',
      p.updatedAt.toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return csv;
  }
}
