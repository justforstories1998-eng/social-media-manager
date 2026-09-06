import { TrackerService } from './tracker.service';

const seedDefaults: Record<string, number> = {
  EUR: 0.92, GBP: 0.79, INR: 83.2, JPY: 149.5, AUD: 1.52, CAD: 1.36,
};

function makeService(prismaMock: any) {
  return new TrackerService(prismaMock as any);
}

describe('FxRates', () => {
  it('seeds defaults when user has no rates', async () => {
    const prismaMock = {
      fxRate: {
        findMany: jest.fn(),
        createMany: jest.fn().mockResolvedValue({ count: 6 }),
      },
    };
    prismaMock.fxRate.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(
        Object.entries(seedDefaults).map(([currency, rateToUSD]) => ({
          currency, rateToUSD, updatedAt: new Date(),
        })),
      );
    const svc = makeService(prismaMock);
    const rates = await svc.getFxRates('u1');
    expect(prismaMock.fxRate.createMany).toHaveBeenCalled();
    expect(rates).toHaveLength(6);
    expect(rates.find((r: any) => r.currency === 'INR')?.rateToUSD).toEqual(83.2);
  });

  it('rejects unknown currency and non-positive rate', async () => {
    const prismaMock = { fxRate: { findMany: jest.fn(), upsert: jest.fn() } };
    const svc = makeService(prismaMock);
    await expect(svc.updateFxRates('u1', [{ currency: 'XXX', rateToUSD: 1 }])).rejects.toThrow();
    await expect(svc.updateFxRates('u1', [{ currency: 'EUR', rateToUSD: 0 }])).rejects.toThrow();
    expect(prismaMock.fxRate.upsert).not.toHaveBeenCalled();
  });

  it('upserts valid rates', async () => {
    const prismaMock = {
      fxRate: { upsert: jest.fn().mockResolvedValue({}), findMany: jest.fn().mockResolvedValue([{ currency: 'EUR', rateToUSD: 0.9, updatedAt: new Date() }]) },
    };
    const svc = makeService(prismaMock);
    await svc.updateFxRates('u1', [{ currency: 'EUR', rateToUSD: 0.9 }]);
    expect(prismaMock.fxRate.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId_currency: { userId: 'u1', currency: 'EUR' } } }),
    );
  });
});
