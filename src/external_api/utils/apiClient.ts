import {
  Download,
  getResponseCode,
  getResponseErrorMessage,
  isExportFileResponse,
  isFileStreamResponse,
  ResponseCode,
  LocalStorageWrapper,
  StorageKey,
  getRecentlySelectedZone
} from '@actiontech/dms-kit';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders
} from 'axios';
import { eventEmitter } from '@/util/utils';
import type { NotificationInstanceKeyType } from '@/hooks/useNotificationContext';
import { formatMessage } from '@/util/intl';
import { ArgsProps } from 'antd/es/notification';
import EmitterKey from '@actiontech/dms-kit/es/data/EmitterKey';
import { addFailedRequest } from './authManage';

const doNotAddAuthRequest = ['v1/dms/sessions'];

class ApiBase {
  constructor(baseUrl: string = '') {
    let externalApiPrefix = '';

    if (process.env.NODE_ENV === 'development') {
      externalApiPrefix = '/external_api';
    }
    this.instance = axios.create({
      baseURL: externalApiPrefix + baseUrl
    });
  }

  private instance: AxiosInstance;

  private _interceptorsReady = false;

  private authInvalid(config: AxiosRequestConfig) {
    addFailedRequest(config);
  }

  public setInstanceBaseURL = (baseURL: string) => {
    this.instance.defaults.baseURL = baseURL;
  };

  private async successHandle(res: AxiosResponse<any, any>) {
    const code = await getResponseCode(res);
    if (res.status === 401) {
      this.authInvalid(res.config);
      return res;
    } else if (isExportFileResponse(res)) {
      const disposition: string = res.headers?.['content-disposition'];
      const flag = 'filename=';
      const flagCharset = 'filename*=';
      let filename = '';
      if (disposition.includes(flagCharset)) {
        const tempArr = disposition.split("'");
        filename = decodeURI(tempArr[tempArr.length - 1]);
      } else {
        const startIndex = disposition.indexOf(flag);
        filename = disposition.slice(startIndex + flag.length);
      }
      Download.downloadByCreateElementA(res.data, filename);
    } else if (
      (res.status === 200 &&
        code !== ResponseCode.SUCCESS &&
        !isFileStreamResponse(res)) ||
      res.status !== 200
    ) {
      const message = await getResponseErrorMessage(res);
      eventEmitter.emit<[NotificationInstanceKeyType, ArgsProps]>(
        EmitterKey.OPEN_GLOBAL_NOTIFICATION,
        'error',
        {
          message: formatMessage({
            id: 'odc.src.util.notification.RequestFailed',
            defaultMessage: '请求失败'
          }),
          description: message
        }
      );
      if (code === ResponseCode.CurrentAvailabilityZoneError) {
        eventEmitter.emit(
          EmitterKey.DMS_CLEAR_AVAILABILITY_ZONE_AND_RELOAD_INITIAL_DATA
        );
      }
    }
    return res;
  }

  private async errorHandle(error: any) {
    if (error?.response?.status === 401) {
      return await this.authInvalid(error.config);
    } else if (error?.response?.status !== 200) {
      const message = await getResponseErrorMessage(error.response);
      eventEmitter.emit<[NotificationInstanceKeyType, ArgsProps]>(
        EmitterKey.OPEN_GLOBAL_NOTIFICATION,
        'error',
        {
          message: formatMessage({
            id: 'odc.src.util.notification.RequestFailed',
            defaultMessage: '请求失败'
          }),
          description: message
        }
      );
    }
    return Promise.reject(error);
  }

  // 初始化拦截器
  private setupInterceptors(): void {
    this.instance.interceptors.request.use((config) => {
      const token = LocalStorageWrapper.get(StorageKey.Token);
      if (!token || doNotAddAuthRequest.some((url) => config.url === url)) {
        return config;
      }

      // 修剪 data/params 中的字符串（仅处理普通对象）
      const trimTarget: Record<string, unknown> | undefined =
        config.data &&
        typeof config.data === 'object' &&
        !(config.data instanceof FormData)
          ? (config.data as Record<string, unknown>)
          : config.params && typeof config.params === 'object'
          ? (config.params as Record<string, unknown>)
          : undefined;
      if (trimTarget) {
        Object.keys(trimTarget).forEach((key) => {
          const value = trimTarget[key];
          if (typeof value === 'string') {
            trimTarget[key] = value.trim();
          }
        });
      }

      // 统一使用 AxiosHeaders 设置请求头，保证类型匹配
      config.headers = new AxiosHeaders(config.headers);
      const headers = config.headers as AxiosHeaders;
      headers.set('Authorization', token);
      headers.set('zone', getRecentlySelectedZone() || '');

      return config;
    });

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        return this.successHandle(response);
      },
      (error) => {
        return this.errorHandle(error);
      }
    );
  }

  ensureReady(): void {
    // 懒加载初始化拦截器，避免重复注册
    if (this._interceptorsReady) return;
    this.setupInterceptors();
    this._interceptorsReady = true;
  }

  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    this.ensureReady();
    return this.instance.request<T>(config);
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    this.ensureReady();
    return this.instance.get<T>(url, config);
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    this.ensureReady();
    return this.instance.post<T>(url, data, config);
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    this.ensureReady();
    return this.instance.delete<T>(url, config);
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    this.ensureReady();
    return this.instance.put<T>(url, data, config);
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    this.ensureReady();
    return this.instance.patch<T>(url, data, config);
  }
}

export default ApiBase;
