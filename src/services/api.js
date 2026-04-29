const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("token"));
  } catch {
    return null;
  }
}

async function request(method, path, { body, params, isFormData } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }

  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed with ${res.status}`;
    return { ok: false, error: message, status: res.status, data };
  }

  return { ok: true, data: data.data, message: data.message };
}

export const api = {
  get: (path, params) => request("GET", path, { params }),
  post: (path, body, opts) => request("POST", path, { body, ...opts }),
  patch: (path, body) => request("PATCH", path, { body }),
  put: (path, body) => request("PUT", path, { body }),
  delete: (path) => request("DELETE", path),
};
