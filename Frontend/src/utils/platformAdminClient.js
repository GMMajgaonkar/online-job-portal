import axios from "axios";
import { PLATFORM_ADMIN_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";

const TOKEN_KEY = "platformAdminToken";

export const setPlatformAdminToken = (token) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
};

export const getPlatformAdminToken = () => sessionStorage.getItem(TOKEN_KEY);

const platformAdminClient = axios.create({
  baseURL: PLATFORM_ADMIN_API_ENDPOINT,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

platformAdminClient.interceptors.request.use((config) => {
  const token = getPlatformAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

platformAdminClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Request failed";
    toast.error(msg);
    if (error.response?.status === 401 || error.response?.status === 403) {
      setPlatformAdminToken(null);
    }
    return Promise.reject(error);
  }
);

export default platformAdminClient;
