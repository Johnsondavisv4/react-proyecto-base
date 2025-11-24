import type {
  Artist,
  Album,
  Track,
  ArtistSearchResponse,
  AlbumListResponse,
  TrackListResponse,
} from "./deezer.types";

const API_BASE_URL = "https://api.deezer.com";
const CORS_PROXY = "https://corsproxy.io/?";
const MAX_PAGE_DEPTH = 25;

interface RequestOptions {
  signal?: AbortSignal;
}

interface DeezerErrorPayload {
  error?: {
    message?: string;
  };
}

interface PaginatedResponse<T> {
  data?: T[];
  total?: number;
  next?: string | null;
}

class DeezerService {
  private readonly apiBaseUrl: string;
  private readonly corsProxy: string;
  private readonly maxPageDepth: number;

  constructor() {
    this.apiBaseUrl = API_BASE_URL;
    this.corsProxy = CORS_PROXY;
    this.maxPageDepth = MAX_PAGE_DEPTH;
  }

  withProxy(url: string): string {
    return `${this.corsProxy}${encodeURIComponent(url)}`;
  }

  async tryParseJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async fetchDeezerJson(
    url: string,
    options: RequestOptions = {}
  ): Promise<any> {
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
        ? (payload as DeezerErrorPayload).error
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

  async collectPaginated<TItem>(
    initialUrl: string,
    options: RequestOptions = {}
  ): Promise<TItem[]> {
    // Primera consulta para obtener el total
    const firstPage = (await this.fetchDeezerJson(
      initialUrl,
      options
    )) as PaginatedResponse<TItem>;

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

  mapArtist(artist: any): Artist {
    return {
      id: artist.id,
      name: artist.name,
      picture_medium: artist.picture_medium,
    };
  }

  mapAlbum(album: any): Album {
    return {
      id: album.id,
      title: album.title,
      release_date: new Date(album.release_date),
      record_type: album.record_type,
      cover_medium: album.cover_medium,
    };
  }

  mapTrack(track: any): Track {
    return {
      id: track.id,
      title: track.title,
    };
  }

  async searchArtist(
    query: string,
    options: RequestOptions = {}
  ): Promise<ArtistSearchResponse> {
    const trimmed = (query ?? "").trim();

    if (!trimmed) {
      return { data: [] };
    }

    const url = `${this.apiBaseUrl}/search/artist?q=${encodeURIComponent(
      trimmed
    )}`;

    const raw = await this.fetchDeezerJson(url, options);

    const data = Array.isArray(raw.data)
      ? raw.data.map((a: any) => this.mapArtist(a))
      : [];

    return { data };
  }

  async getArtistAlbums(
    artistId: number,
    options: RequestOptions = {}
  ): Promise<AlbumListResponse> {
    if (!Number.isFinite(artistId)) {
      throw new Error("artistId must be a finite number");
    }

    const url = `${this.apiBaseUrl}/artist/${artistId}/albums`;
    const rawAlbums = await this.collectPaginated<any>(url, options);

    const data = rawAlbums.map((a) => this.mapAlbum(a));

    return { data };
  }

  async getAlbumTracks(
    albumId: number,
    options: RequestOptions = {}
  ): Promise<TrackListResponse> {
    if (!Number.isFinite(albumId)) {
      throw new Error("albumId must be a finite number");
    }

    const url = `${this.apiBaseUrl}/album/${albumId}/tracks`;
    const rawTracks = await this.collectPaginated<any>(url, options);

    const data = rawTracks.map((t) => this.mapTrack(t));

    return { data };
  }

  getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }

  getCorsProxy(): string {
    return this.corsProxy;
  }
}

const deezerServiceInstance = new DeezerService();
export default deezerServiceInstance;
