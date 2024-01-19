import { Column, Entity, Unique } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';

@Entity({ name: 'last_activity' })
@Unique(['user'])
export class LastActivity extends SharedEntity {
  @Column({ length: 128, name: 'user' })
  user: string;

  @Column({ name: 'last_activity_time' })
  lastActivityTime: Date;
}
