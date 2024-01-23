import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { User } from '../../user/entity/user.entity';

@Entity({ name: 'token' })
export class Token extends SharedEntity {
  @Column({ name: 'refresh_token' })
  refreshToken: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'token_family_id' })
  tokenFamilyId: string;
}
