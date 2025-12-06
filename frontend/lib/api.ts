const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type":
        options.body instanceof FormData ? undefined : "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${res.status}`);
  }

  return res.json();
}
