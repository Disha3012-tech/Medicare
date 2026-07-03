import { showToast } from "../components/ToastNotification";

const API_URL = import.meta.env.VITE_API_URL;
//console.log("REQUEST BODY:", config.body);
if (!API_URL) {
  console.warn("VITE_API_URL is not defined in the environment variables.");
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

// Keep track of refreshing state to prevent multiple concurrent refreshes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return data.access_token;
  } catch (err) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");
    window.dispatchEvent(new Event("auth_expired"));
    return null;
  }
}

export async function request(endpoint: string, options: RequestOptions = {}): Promise<any> {
  const { params, headers, ...restOptions } = options;

  let url = `${API_URL}${endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const defaultHeaders: Record<string, string> = {};
  
  // Do not set Content-Type if it is FormData (browser does it with boundary automatically)
  if (!(restOptions.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    defaultHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401 && accessToken && !endpoint.includes("/auth/refresh")) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        if (newToken) {
          onRefreshed(newToken);
        }
      }

      const retryRequest = new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (config.headers) {
            (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
          }
          fetch(url, config)
            .then((res) => {
              if (!res.ok) return handleError(res).then(reject);
              return res.json().then(resolve);
            })
            .catch(reject);
        });
      });

      return retryRequest;
    }

    if (!response.ok) {
      await handleError(response);
    }

    // Handles 204 No Content or empty responses
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null;
    }

    return await response.json();
  } catch (error: any) {
    console.error("API Request Error:", error);
    throw error;
  }
}

async function handleError(response: Response) {
  let errorMessage = "An unexpected error occurred.";
  let errorDetail = "";

  try {
    const errorData = await response.json();
    if (errorData && typeof errorData.detail === "string") {
      errorDetail = errorData.detail;
      errorMessage = errorData.detail;
    } else if (errorData && Array.isArray(errorData.detail)) {
      // Pydantic validation errors format: [{"loc":..., "msg":..., "type":...}]
      errorDetail = errorData.detail.map((e: any) => `${e.loc.join(".")}: ${e.msg}`).join(", ");
      errorMessage = "Validation error occurred.";
    } else if (errorData && errorData.message) {
      errorMessage = errorData.message;
    }
  } catch (e) {
    // If not json, use status text
    errorMessage = response.statusText || errorMessage;
  }

  // Toast and log
  const status = response.status;
  if (status === 401) {
    // Handled above for refreshing, if it falls here, refresh failed or no access token in store
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");
    window.dispatchEvent(new Event("auth_expired"));
    showToast("error", "Unauthorized", "Please sign in to continue.");
  } else if (status === 403) {
    showToast("error", "Forbidden", "You do not have permission to perform this action.");
  } else if (status === 404) {
    showToast("error", "Not Found", errorDetail || "The requested resource was not found.");
  } else if (status === 422) {
    showToast("error", "Validation Error", errorDetail || "Invalid inputs provided.");
  } else if (status >= 500) {
    showToast("error", "Server Error", "Something went wrong on the server. Please try again later.");
  } else {
    showToast("error", "Error", errorMessage);
  }

  const customError = new Error(errorMessage) as any;
  customError.status = status;
  customError.detail = errorDetail;
  throw customError;
}

export const api = {
  get: (endpoint: string, options?: RequestOptions) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, body?: any, options?: RequestOptions) => request(endpoint, { ...options, method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint: string, body?: any, options?: RequestOptions) => request(endpoint, { ...options, method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (endpoint: string, body?: any, options?: RequestOptions) => request(endpoint, { ...options, method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint: string, options?: RequestOptions) => request(endpoint, { ...options, method: "DELETE" }),
};
