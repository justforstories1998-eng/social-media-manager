import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_change_me',
    });
  }

  async validate(payload: any) {
    const session = await this.prisma.session.findFirst({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }
    return { id: payload.sub, email: payload.email };
  }
}
