import * as bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity, Unique } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { Exclude } from 'class-transformer';
import { InternalServerErrorException } from '@nestjs/common';

@Entity({ name: 'user' })
@Unique(['username'])
export class User extends SharedEntity {
  @Column({ length: 15, nullable: false })
  username: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: false })
  password: string;

  @Column({ default: 1 })
  isActive: number;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      if (this.password) this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
