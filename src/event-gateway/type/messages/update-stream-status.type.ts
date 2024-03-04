export type updateStreamStatusMessageType = {
  userId: string;
  name: string;
  status: string;
  playlistName: string;
  trackName: string;
  artist?: string;
  album?: string;
  clientKey?: string;
};
