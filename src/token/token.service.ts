import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entity/token.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(token: string, userId: string, tokenFamily: string) {
    try {
      const data = this.tokenRepository.create({
        refreshToken: token,
        userId: userId,
        tokenFamilyId: tokenFamily,
      });

      return await this.tokenRepository.save(data);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findOneByToken(token: string): Promise<Token> {
    try {
      return await this.tokenRepository.findOne({
        where: {
          refreshToken: token,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async deleteRefreshToken(token: string) {
    try {
      await this.tokenRepository
        .createQueryBuilder()
        .delete()
        .from(Token)
        .where('refreshToken = :token', { token })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async deleteRefreshTokenByTokenFamily(tokenFamily: string) {
    try {
      await this.tokenRepository
        .createQueryBuilder()
        .delete()
        .from(Token)
        .where('tokenFamilyId = :tokenFamily', { tokenFamily })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  decodeToken(token: string) {
    const decoded = this.jwtService.decode(token);

    return decoded;
  }

  async invalidateToken() {
    try {
      const expiredTokenIds: string[] = [];
      const tokens = await this.tokenRepository.find({
        select: ['id', 'refreshToken'],
      });

      for (const token of tokens) {
        const decodedRt = this.decodeToken(token.refreshToken);
        const exp = decodedRt['exp'];

        /**
         * @link see {https://stackoverflow.com/questions/51292406/check-if-token-expired-using-this-jwt-library}
         */
        if (Date.now() >= exp * 1000) {
          expiredTokenIds.push(token.id);
        }
      }
      if (expiredTokenIds.length) {
        await this.tokenRepository.delete(expiredTokenIds);
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
