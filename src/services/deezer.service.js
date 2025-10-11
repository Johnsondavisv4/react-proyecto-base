/**
 * @typedef {import('./deezer.types').Artist} Artist
 * @typedef {import('./deezer.types').Album} Album
 * @typedef {import('./deezer.types').Track} Track
 * @typedef {import('./deezer.types').ArtistSearchResponse} ArtistSearchResponse
 * @typedef {import('./deezer.types').AlbumListResponse} AlbumListResponse
 * @typedef {import('./deezer.types').TrackListResponse} TrackListResponse
 */

const API_BASE_URL = "https://api.deezer.com";
const CORS_PROXY = "https://corsproxy.io/?";
const MAX_PAGE_DEPTH = 25;

class DeezerService {
  constructor() {
    this.apiBaseUrl = API_BASE_URL;
    this.corsProxy = CORS_PROXY;
    this.maxPageDepth = MAX_PAGE_DEPTH;
  }

  /**
   * @param {string} url
   * @returns {string}
   */
  withProxy(url) {
    return `${this.corsProxy}${encodeURIComponent(url)}`;
  }

  /**
   * @param {Response} response
   * @returns {Promise<unknown>}
   */
  async tryParseJson(response) {
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
  async fetchDeezerJson(url, options = {}) {
    const response = await fetch(this.withProxy(url), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: options.signal,
    });

    const payload = await this.tryParseJson(response);

    const payloadError =
      payload && typeof payload === "object"
        ? /** @type {{ error?: { message?: string } }} */ (payload).error
        : undefined;

    if (!response.ok) {
      const message =
        payloadError?.message ||
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
  async collectPaginated(initialUrl, options = {}) {
    // Primera consulta para obtener el total
    /** @type {{ data?: TItem[]; total?: number; next?: string | null }} */
    const firstPage = await this.fetchDeezerJson(initialUrl, options);

    if (!Array.isArray(firstPage.data)) {
      return [];
    }

    const items = [...firstPage.data];
    const total = firstPage.total ?? 0;
    const pageSize = 25;

    // Si no hay más páginas, retornar directamente
    if (total <= pageSize) {
      return items;
    }

    // Calcular cantidad de páginas adicionales necesarias
    const totalPages = Math.ceil(total / pageSize);
    const additionalPages = totalPages - 1; // Ya tenemos la primera página

    // Limitar al máximo de páginas permitido
    const pagesToFetch = Math.min(additionalPages, this.maxPageDepth - 1);

    // Crear URLs para las páginas restantes
    const baseUrl = initialUrl.includes("?")
      ? `${initialUrl}&index=`
      : `${initialUrl}?index=`;

    const pagePromises = [];
    for (let i = 1; i <= pagesToFetch; i++) {
      const index = i * pageSize;
      const url = `${baseUrl}${index}`;
      pagePromises.push(this.fetchDeezerJson(url, options));
    }

    // Ejecutar todas las consultas en paralelo
    const pages = await Promise.all(pagePromises);

    // Agregar los datos de todas las páginas
    for (const page of pages) {
      if (Array.isArray(page.data)) {
        items.push(...page.data);
      }
    }

    return items;
  }

  /**
   * @param {any} artist
   * @returns {Artist}
   */
  mapArtist(artist) {
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
  mapAlbum(album) {
    return {
      id: album.id,
      title: album.title,
      release_date: new Date(album.release_date),
      record_type: album.record_type,
      cover_medium: album.cover_medium,
    };
  }

  /**
   * @param {any} track
   * @returns {Track}
   */
  mapTrack(track) {
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
  async searchArtist(query, options = {}) {
    const trimmed = (query ?? "").trim();

    if (!trimmed) {
      return { data: [] };
    }

    const url = `${this.apiBaseUrl}/search/artist?q=${encodeURIComponent(
      trimmed
    )}`;
    /** @type {{ data?: any[] }} */
    const raw = await this.fetchDeezerJson(url, options);

    const data = Array.isArray(raw.data)
      ? raw.data.map((a) => this.mapArtist(a))
      : [];

    return { data };
  }

  /**
   * @param {number} artistId
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<AlbumListResponse>}
   */
  async getArtistAlbums(artistId, options = {}) {
    if (!Number.isFinite(artistId)) {
      throw new Error("artistId must be a finite number");
    }

    const url = `${this.apiBaseUrl}/artist/${artistId}/albums`;
    const rawAlbums = await this.collectPaginated(url, options);

    const data = rawAlbums.map((a) => this.mapAlbum(a));

    return { data };
  }

  /**
   * @param {number} albumId
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<TrackListResponse>}
   */
  async getAlbumTracks(albumId, options = {}) {
    if (!Number.isFinite(albumId)) {
      throw new Error("albumId must be a finite number");
    }

    const url = `${this.apiBaseUrl}/album/${albumId}/tracks`;
    const rawTracks = await this.collectPaginated(url, options);

    const data = rawTracks.map((t) => this.mapTrack(t));

    return { data };
  }

  /**
   * @returns {string}
   */
  getApiBaseUrl() {
    return this.apiBaseUrl;
  }

  /**
   * @returns {string}
   */
  getCorsProxy() {
    return this.corsProxy;
  }
}

const deezerServiceInstance = new DeezerService();
export default deezerServiceInstance;
