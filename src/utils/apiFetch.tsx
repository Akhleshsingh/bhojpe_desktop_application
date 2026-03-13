import { BASE_URL } from "./api";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // important if backend uses cookies
    redirect: "follow",      // VERY IMPORTANT for 302
    ...options,
  });

  // Optional: handle non-JSON responses
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with ${response.status}`
    );
  }

  return data;
}
