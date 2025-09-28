export type Artist = {
  id: number;
  name: string;
  picture_medium: string;
};

export type ArtistSearchResponse = {
  data: Artist[];
};

export type Album = {
  id: number;
  title: string;
  record_type?: string;
  cover_medium?: string;
};

export type RawAlbumListResponse = {
  data: Album[];
  total?: number;
  prev?: string | null;
  next?: string | null;
};

export type AlbumListResponse = {
  data: Album[];
};

export type Track = {
  id: number;
  title: string;
};

export type RawTrackListResponse = {
  data: Track[];
  total?: number;
  prev?: string | null;
  next?: string | null;
};

export type TrackListResponse = {
  data: Track[];
};
