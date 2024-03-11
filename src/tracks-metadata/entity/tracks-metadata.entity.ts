import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { Tracks } from '../../tracks/entity/tracks.entity';

@Entity({ name: 'tracks_metadata' })
export class TracksMetadata extends SharedEntity {
  @Column({ name: 'name', nullable: true })
  name: string;

  @Column({ name: 'album', nullable: true })
  album: string;

  @Column({ name: 'artist', nullable: true })
  artist: string;

  @Column({
    name: 'duration',
    nullable: true,
    comment: 'duration in second',
  })
  duration: string;

  @Column({ name: 'cover_path', nullable: true })
  coverPath: string;

  @Column({ length: 255, name: 'track_path' })
  trackPath: string;

  @Column({ length: 255, name: 'track_path_webm', nullable: true })
  trackPathWebM: string;

  @Column({ name: 'track_id' })
  trackId: string;

  @OneToOne(() => Tracks, (tracks) => tracks.trackMetadata, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'track_id' })
  track: Tracks;
}
