import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { Playlist } from '../../playlist/entity/playlist.entity';
import { Tracks } from '../../tracks/entity/tracks.entity';

@Entity({ name: 'playlist_content' })
export class PlaylistContent extends SharedEntity {
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

  @Column({ name: 'track_id' })
  trackId: string;

  @Column({ name: 'playlist_id' })
  playlistId: string;

  @ManyToOne(() => Playlist, (playlist) => playlist.playlistContents, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'playlist_id' })
  playlist: Playlist;

  @ManyToOne(() => Tracks, (tracks) => tracks.playlistContents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'track_id' })
  track: Tracks;
}
