import { AxiosRequestConfig } from 'axios';
import { cloneDeep } from 'lodash';
import ApiBase from '../utils/apiClient';

const apiClient = new ApiBase();

class ServiceBase {
  protected get<T>(url: string, data: any = {}, options?: AxiosRequestConfig) {
    return apiClient.get<T>(url, {
      params: data,
      ...options
    });
  }

  protected post<T>(url: string, data: any = {}, options?: AxiosRequestConfig) {
    return apiClient.post<T>(url, data, options);
  }

  protected delete<T>(
    url: string,
    data: any = {},
    options?: AxiosRequestConfig
  ) {
    return apiClient.delete<T>(url, {
      data,
      ...options
    });
  }

  protected put<T>(url: string, data: any = {}, options?: AxiosRequestConfig) {
    return apiClient.put<T>(url, data, options);
  }

  protected patch<T>(
    url: string,
    data: any = {},
    options?: AxiosRequestConfig
  ) {
    return apiClient.patch<T>(url, data, options);
  }

  protected cloneDeep(data: any = {}) {
    return cloneDeep(data);
  }
}

export default ServiceBase;
