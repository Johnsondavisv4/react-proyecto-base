export type HTTPMethod = "GET";

function buildQuery(params?: Record<string, any>) {
  if (!params) return "";
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((x) => s.append(k, String(x)));
    else s.append(k, String(v));
  });
  const str = s.toString();
  return str ? `?${str}` : "";
}

export class HttpClient {
  constructor(private baseUrl = "https://api.deezer.com/") {}

  private buildUrl(endpoint: string, params?: Record<string, any>) {
    const clean = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${this.baseUrl.replace(/\/$/, "")}${clean}${buildQuery(params)}`;
  }

  private async request<T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${text || url}`);
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  get<T = any>(endpoint: string, params?: Record<string, any>) {
    return this.request<T>(endpoint, params);
  }
}

export default new HttpClient();
