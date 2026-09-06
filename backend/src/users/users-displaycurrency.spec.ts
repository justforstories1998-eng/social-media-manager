import { UsersService } from './users.service';

describe('UsersService.displayCurrency', () => {
  it('persists displayCurrency on update', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1' }),
        update: jest.fn().mockImplementation((args: any) => {
          const out: any = { id: 'u1' };
          for (const [k, v] of Object.entries(args.select || {})) {
            if (v === true) out[k] = (args.data as any)[k] ?? null;
          }
          return Promise.resolve(out);
        }),
      },
    };
    const svc = new UsersService(prismaMock as any);
    const res: any = await svc.update('u1', { displayCurrency: 'EUR' } as any);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ displayCurrency: 'EUR' }) }),
    );
    expect(res.displayCurrency).toEqual('EUR');
  });
});
