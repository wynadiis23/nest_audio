import { Column, Entity, OneToMany } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { PlaylistContent } from '../../playlist-content/entity/playlist-content.entity';
import { UserPlaylist } from '../../user-playlist/entity/user-playlist.entity';

@Entity({ name: 'playlist' })
export class Playlist extends SharedEntity {
  @Column({ length: 128 })
  name: string;

  @Column({ name: 'published', default: 0 })
  published: number;

  @OneToMany(
    () => PlaylistContent,
    (playlistContent) => playlistContent.playlist,
    {
      cascade: true,
      eager: true,
    },
  )
  playlistContents: PlaylistContent[];

  @OneToMany(() => UserPlaylist, (userPlaylist) => userPlaylist.playlist)
  userPlaylists: UserPlaylist[];
}
