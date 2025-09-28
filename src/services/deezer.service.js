/**
 * @typedef {import('./deezer.types').Artist} Artist
 * @typedef {import('./deezer.types').Album} Album
 * @typedef {import('./deezer.types').Track} Track
 * @typedef {import('./deezer.types').ArtistSearchResponse} ArtistSearchResponse
 * @typedef {import('./deezer.types').AlbumListResponse} AlbumListResponse
 * @typedef {import('./deezer.types').TrackListResponse} TrackListResponse
 * @typedef {import('./deezer.types').RawAlbumListResponse} RawAlbumListResponse
 * @typedef {import('./deezer.types').RawTrackListResponse} RawTrackListResponse
 */

const API_BASE_URL = "https://api.deezer.com";
const CORS_PROXY = "https://corsproxy.io/?";
const MAX_PAGE_DEPTH = 25;

/**
 * @param {string} url
 * @returns {string}
 */
const withProxy = (url) => `${CORS_PROXY}${encodeURIComponent(url)}`;

/**
 * @param {Response} response
 * @returns {Promise<unknown>}
 */
async function tryParseJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

/**
 * @param {string} url
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<any>}
 */
async function fetchDeezerJson(url, options = {}) {
  const response = await fetch(withProxy(url), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal: options.signal,
  });

  const payload = await tryParseJson(response);

  if (!response.ok) {
    const message =
      (payload &&
        typeof payload === "object" &&
        payload.error &&
        payload.error.message) ||
      response.statusText ||
      "Unknown Deezer API error";

    throw new Error(`Deezer request failed (${response.status}): ${message}`);
  }

  return payload ?? {};
}

/**
 * @template TItem
 * @param {string} initialUrl
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<TItem[]>}
 */
async function collectPaginated(initialUrl, options = {}) {
  const items = [];
  let nextUrl = initialUrl;
  let depth = 0;

  while (nextUrl && depth < MAX_PAGE_DEPTH) {
    depth += 1;
    /** @type {{ data?: TItem[]; next?: string | null }} */
    const page = await fetchDeezerJson(nextUrl, options);

    if (Array.isArray(page.data)) {
      items.push(...page.data);
    }

    if (!page.next) {
      break;
    }

    nextUrl = page.next;
  }

  return items;
}

/**
 * @param {any} artist
 * @returns {Artist}
 */
function mapArtist(artist) {
  return {
    id: artist.id,
    name: artist.name,
    picture_medium: artist.picture_medium,
  };
}

/**
 * @param {any} album
 * @returns {Album}
 */
function mapAlbum(album) {
  return {
    id: album.id,
    title: album.title,
    record_type: album.record_type,
    cover_medium: album.cover_medium,
  };
}

/**
 * @param {any} track
 * @returns {Track}
 */
function mapTrack(track) {
  return {
    id: track.id,
    title: track.title,
  };
}

/**
 * @param {string} query
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<ArtistSearchResponse>}
 */
async function searchArtist(query, options = {}) {
  const trimmed = (query ?? "").trim();

  if (!trimmed) {
    return { data: [] };
  }

  const url = `${API_BASE_URL}/search/artist?q=${encodeURIComponent(trimmed)}`;
  /** @type {{ data?: any[] }} */
  const raw = await fetchDeezerJson(url, options);

  const data = Array.isArray(raw.data) ? raw.data.map(mapArtist) : [];

  return { data };
}

/**
 * @param {number} artistId
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<AlbumListResponse>}
 */
async function getArtistAlbums(artistId, options = {}) {
  if (!Number.isFinite(artistId)) {
    throw new Error("artistId must be a finite number");
  }

  const url = `${API_BASE_URL}/artist/${artistId}/albums`;
  const rawAlbums = await collectPaginated(url, options);

  const data = rawAlbums.map(mapAlbum);

  return { data };
}

/**
 * @param {number} albumId
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<TrackListResponse>}
 */
async function getAlbumTracks(albumId, options = {}) {
  if (!Number.isFinite(albumId)) {
    throw new Error("albumId must be a finite number");
  }

  const url = `${API_BASE_URL}/album/${albumId}/tracks`;
  const rawTracks = await collectPaginated(url, options);

  const data = rawTracks.map(mapTrack);

  return { data };
}

/**
 * @returns {typeof API_BASE_URL}
 */
function getApiBaseUrl() {
  return API_BASE_URL;
}

/**
 * @returns {typeof CORS_PROXY}
 */
function getCorsProxy() {
  return CORS_PROXY;
}

const DeezerService = Object.freeze({
  searchArtist,
  getArtistAlbums,
  getAlbumTracks,
  getApiBaseUrl,
  getCorsProxy,
});

export default DeezerService;
export {
  API_BASE_URL,
  CORS_PROXY,
  searchArtist,
  getArtistAlbums,
  getAlbumTracks,
  getApiBaseUrl,
  getCorsProxy,
};
