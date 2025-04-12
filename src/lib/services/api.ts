import axios, {AxiosRequestConfig, Method} from 'axios';
import {ApiResponse} from "@/lib/types/common/api";
import {RegisterSchema, LoginSchema} from "@/lib/validations/auth";

export class Api {
  api = axios.create({
    baseURL: `/api`,
  });

  constructor() {
  }

  private call = async <T>(method: Method, endpoint: string, data?: any, options?: AxiosRequestConfig) => {
    const r = await this.api.request({
      method,
      url: endpoint,
      data,
      ...options,
    });
    return r.data as ApiResponse<T>;
  };

  // Auth methods
  register = async (data: Omit<RegisterSchema, 'confirmPassword' | 'termsAccepted'>) => {
    return this.call('POST', '/auth/register', data);
  };

  login = async (data: LoginSchema) => {
    return this.call('POST', '/auth/login', data);
  };
}

export default new Api();
