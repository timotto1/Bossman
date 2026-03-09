"use client";

import { fetchClient } from "./fetch-client";

export async function fetchBaseClient(
  path: string,
  options: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  },
) {
  return fetchClient("", path, options);
}
