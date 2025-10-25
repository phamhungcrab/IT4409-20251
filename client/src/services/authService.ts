/**
 * authService module.
 *
 * Provides functions for interacting with the backend authentication
 * endpoints.  These functions do not depend on React hooks, so they can
 * be used outside of React components.  They rely on the browser
 * `fetch` API and environment variables for the API base URL.  Use
 * `useAuth` to manage auth state within your components and call these
 * functions from there as needed.
 */

// Determine the base URL for API requests from Vite configuration or default to empty
const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
  refreshToken?: string;
}

/**
 * Perform a login with the given credentials.  Sends a POST request to
 * `/auth/login`.  Returns the parsed JSON response containing the
 * access token and user info.  Throws an error on HTTP or network
 * failure.  Adjust the endpoint path and response shape to match your
 * backend implementation.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Login failed');
  }
  return (await response.json()) as LoginResponse;
}

/**
 * Exchange a refresh token for a new access token.  Sends a POST to
 * `/auth/refresh` with the refresh token.  Returns the new access
 * token and, optionally, a new refresh token.  If the refresh token
 * itself is expired or invalid, the server should reject the request.
 */
export async function refresh(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Token refresh failed');
  }
  return (await response.json()) as { token: string; refreshToken?: string };
}

/**
 * Log out by invalidating the current session on the backend.  Sends a
 * POST to `/auth/logout`.  The backend may also invalidate refresh
 * tokens.  You should still clear client-side state (e.g. remove
 * tokens from localStorage) when calling this function.
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    // Even if the logout fails on the server, proceed with client-side logout
    console.warn('Logout request failed');
  }
}