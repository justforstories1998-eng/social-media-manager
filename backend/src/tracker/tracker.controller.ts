import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrackerService } from './tracker.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateTrackerProductDto } from './dto/update-tracker-product.dto';

@Controller('tracker')
@UseGuards(JwtAuthGuard)
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Get('sync')
  async syncProducts(@Request() req: any) {
    return this.trackerService.syncProducts(req.user.id);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.trackerService.findAll(req.user.id, {
      search,
      category,
      status,
      sortBy,
      sortDir,
      dateFrom,
      dateTo,
    });
  }

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return this.trackerService.getDashboard(req.user.id);
  }

  @Get('export/csv')
  async exportCSV(
    @Request() req: any,
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const csv = await this.trackerService.exportCSV(req.user.id, { search, category });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tracker-export.csv');
    res.send(csv);
  }

  @Get('transactions/all')
  async getTransactions(
    @Request() req: any,
    @Query('trackerProductId') trackerProductId?: string,
  ) {
    return this.trackerService.getTransactions(req.user.id, trackerProductId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.trackerService.findOne(req.user.id, id);
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTrackerProductDto,
  ) {
    return this.trackerService.updateTrackerProduct(req.user.id, id, dto);
  }

  @Post('sale')
  async recordSale(@Request() req: any, @Body() dto: CreateSaleDto) {
    return this.trackerService.recordSale(req.user.id, dto);
  }

  @Post('stock')
  async addStock(@Request() req: any, @Body() dto: CreateStockMovementDto) {
    return this.trackerService.addStock(req.user.id, dto);
  }

  @Post('sync/single')
  async syncSingle(@Request() req: any, @Body() body: { productId: string }) {
    return this.trackerService.syncSingle(req.user.id, body.productId);
  }

  @Post(':id/archive')
  async archiveProduct(@Request() req: any, @Param('id') id: string) {
    return this.trackerService.archiveProduct(req.user.id, id);
  }

  @Get(':id/sales')
  async getSalesHistory(
    @Request() req: any,
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.trackerService.getSalesHistory(req.user.id, id, dateFrom, dateTo);
  }

  @Get(':id/stock')
  async getStockHistory(@Request() req: any, @Param('id') id: string) {
    return this.trackerService.getStockHistory(req.user.id, id);
  }

  @Get(':id/stats')
  async getProductStats(@Request() req: any, @Param('id') id: string) {
    return this.trackerService.getProductStats(req.user.id, id);
  }
}
