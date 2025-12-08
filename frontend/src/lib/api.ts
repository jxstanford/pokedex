import type { ApiAnalysisResult, ApiPokemon } from "../types";

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "/api/v1";
const API_BASE = rawBase.replace(/\/$/, "");

const withBase = (path: string) =>
  `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let message = response.statusText || "Request failed";
  try {
    const payload = (await response.json()) as { detail?: any; message?: string };
    if (typeof payload?.message === "string") {
      message = payload.message;
    } else if (typeof payload?.detail?.message === "string") {
      message = payload.detail.message;
    } else if (typeof payload?.detail === "string") {
      message = payload.detail;
    }
  } catch {
    // ignore JSON parse errors
  }
  throw new Error(message);
}

export async function analyzeImage(
  file: File,
  topN = 5,
  signal?: AbortSignal,
): Promise<ApiAnalysisResult> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("top_n", String(Math.min(Math.max(topN, 1), 10)));

  const response = await fetch(withBase("/analyze/"), {
    method: "POST",
    body: formData,
    signal,
  });

  return handleResponse<ApiAnalysisResult>(response);
}

export async function fetchPokemon(
  id: number,
  signal?: AbortSignal,
): Promise<ApiPokemon> {
  const response = await fetch(withBase(`/pokemon/${id}`), { signal });
  return handleResponse<ApiPokemon>(response);
}
