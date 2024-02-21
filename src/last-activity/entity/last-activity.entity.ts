import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { User } from '../../user/entity/user.entity';

@Entity({ name: 'last_activity' })
export class LastActivity extends SharedEntity {
  @Column({ name: 'last_activity_time' })
  lastActivityTime: Date;

  @Column({
    name: 'client_key',
    nullable: true,
    comment:
      'client key taken from activation key of iReap to keep uniqueness for each client',
  })
  clientKey: string;

  @Column({ name: 'user_id' })
  userId: string;

  @OneToOne(() => User, (users) => users.lastActivity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
