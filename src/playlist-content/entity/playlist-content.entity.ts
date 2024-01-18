import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { Playlist } from '../../playlist/entity/playlist.entity';
import { Tracks } from '../../tracks/entity/tracks.entity';

@Entity({ name: 'playlist_content' })
export class PlaylistContent extends SharedEntity {
  @Column({ length: 255, name: 'track_name' })
  trackName: string;

  @Column({ name: 'track_id' })
  trackId: string;

  @Column({ name: 'playlist_id' })
  playlistId: string;

  @ManyToOne(() => Playlist, (playlist) => playlist.playlistContents, {
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'playlist_id' })
  playlist: Playlist;

  @ManyToOne(() => Tracks, (tracks) => tracks.playlistContents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'track_id' })
  track: Tracks;
}
