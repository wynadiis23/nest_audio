import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { User } from '../../user/entity/user.entity';

@Entity({ name: 'user_role' })
export class UserRole extends SharedEntity {
  @Column({ name: 'role', length: 128 })
  code: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.roles, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
