"server-only";

export async function fetchClient(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
) {
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: options.headers,
  });

  if (!response.ok) {
    const errorData = await response.json();

    throw {
      status: response.status,
      message: errorData?.error,
    };
  }

  // Check if the response is empty
  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text);
}
