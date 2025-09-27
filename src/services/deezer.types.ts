export type Artist = {
  id: number;
  name: string;
  picture_medium: string;
};

export type ArtistSearchResponse = {
  data: Artist[];
  total: number;
  prev?: string | null;
  next?: string | null;
};

export type Album = {
  id: number;
  title: string;
  cover_medium?: string;
};

export type AlbumListResponse = {
  data: Album[];
  total: number;
  prev?: string | null;
  next?: string | null;
};

export type Track = {
  id: number;
  title: string;
};

export type TrackListResponse = {
  data: Track[];
  total?: number;
  prev?: string | null;
  next?: string | null;
};
