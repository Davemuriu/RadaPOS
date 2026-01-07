const API_BASE = "http://127.0.0.1:5555";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.msg || "API error");
  }

  return res.json();
}
