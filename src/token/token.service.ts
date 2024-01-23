import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entity/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
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
}
