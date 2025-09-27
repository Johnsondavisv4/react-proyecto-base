import http from "./httpClient";
import {
  ArtistSearchResponse,
  AlbumListResponse,
  TrackListResponse,
} from "./deezer.types";

function withOutputJson(params?: Record<string, any>) {
  return { ...(params || {}), output: "json" };
}

/**
 * Buscar artistas (endpoint: /search/artist?q={contenido})
 */
export function searchArtist(q: string, limit = 25, index = 0) {
  return http.get<ArtistSearchResponse>(
    "/search/artist",
    withOutputJson({ q, limit, index })
  );
}

/**
 * Obtener álbumes de un artista (endpoint: /artist/{id_artista}/albums)
 * No recibe parámetros; todo va en el path.
 */
export function getArtistAlbums(artistId: string | number) {
  return http.get<AlbumListResponse>(
    `/artist/${artistId}/albums`,
    withOutputJson()
  );
}

/**
 * Obtener tracks de un álbum (endpoint: /album/{id_album}/tracks)
 * No recibe parámetros; todo va en el path.
 */
export function getAlbumTracks(albumId: string | number) {
  return http.get<TrackListResponse>(
    `/album/${albumId}/tracks`,
    withOutputJson()
  );
}

const DeezerService = { searchArtist, getArtistAlbums, getAlbumTracks };
export default DeezerService;
