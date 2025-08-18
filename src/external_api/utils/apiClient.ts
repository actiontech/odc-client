import {
  Download,
  getResponseCode,
  getResponseErrorMessage,
  isExportFileResponse,
  isFileStreamResponse,
  ResponseCode,
  EmitterKey,
  LocalStorageWrapper,
  StorageKey,
  getRecentlySelectedZone,
} from '@actiontech/dms-kit';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosHeaders } from 'axios';
import { eventEmitter } from '@/util/utils';
import type { NotificationInstanceKeyType } from '@/hooks/useNotificationContext';
import { formatMessage } from '@/util/intl';
import { ArgsProps } from 'antd/es/notification';

const doNotAddAuthRequest = ['v1/dms/sessions'];

class ApiBase {
  private static instance: AxiosInstance = axios.create({});
  private static _interceptorsReady = false;

  private static authInvalid(config: AxiosRequestConfig) {}

  private static async successHandle(res: AxiosResponse<any, any>) {
    const code = await getResponseCode(res);
    if (res.status === 401) {
      ApiBase.authInvalid(res.config);
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
      (res.status === 200 && code !== ResponseCode.SUCCESS && !isFileStreamResponse(res)) ||
      res.status !== 200
    ) {
      const message = await getResponseErrorMessage(res);
      eventEmitter.emit<[NotificationInstanceKeyType, ArgsProps]>(
        EmitterKey.OPEN_GLOBAL_NOTIFICATION,
        'error',
        {
          message: formatMessage({
            id: 'odc.src.util.notification.RequestFailed',
            defaultMessage: '请求失败',
          }),
          description: message,
        },
      );
      if (code === ResponseCode.CurrentAvailabilityZoneError) {
        eventEmitter.emit(EmitterKey.DMS_CLEAR_AVAILABILITY_ZONE_AND_RELOAD_INITIAL_DATA);
      }
    }
    return res;
  }

  private static async errorHandle(error: any) {
    if (error?.response?.status === 401) {
      return await ApiBase.authInvalid(error.config);
    } else if (error?.response?.status !== 200) {
      const message = await getResponseErrorMessage(error.response);
      eventEmitter.emit<[NotificationInstanceKeyType, ArgsProps]>(
        EmitterKey.OPEN_GLOBAL_NOTIFICATION,
        'error',
        {
          message: formatMessage({
            id: 'odc.src.util.notification.RequestFailed',
            defaultMessage: '请求失败',
          }),
          description: message,
        },
      );
    }
    return Promise.reject(error);
  }

  // 初始化拦截器
  private static setupInterceptors(): void {
    ApiBase.instance.interceptors.request.use((config) => {
      const token = LocalStorageWrapper.get(StorageKey.Token);
      if (!token || doNotAddAuthRequest.some((url) => config.url === url)) {
        return config;
      }

      // 修剪 data/params 中的字符串（仅处理普通对象）
      const trimTarget: Record<string, unknown> | undefined =
        config.data && typeof config.data === 'object' && !(config.data instanceof FormData)
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
    ApiBase.instance.interceptors.response.use(
      (response) => {
        return ApiBase.successHandle(response);
      },
      (error) => {
        return ApiBase.errorHandle(error);
      },
    );
  }

  private static ensureReady(): void {
    // 懒加载初始化拦截器，避免重复注册
    if (ApiBase._interceptorsReady) return;
    ApiBase.setupInterceptors();
    ApiBase._interceptorsReady = true;
  }

  static request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    ApiBase.ensureReady();
    return ApiBase.instance.request<T>(config);
  }

  static get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    ApiBase.ensureReady();
    return ApiBase.instance.get<T>(url, config);
  }

  static post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    ApiBase.ensureReady();
    return ApiBase.instance.post<T>(url, data, config);
  }

  static delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    ApiBase.ensureReady();
    return ApiBase.instance.delete<T>(url, config);
  }

  static put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    ApiBase.ensureReady();
    return ApiBase.instance.put<T>(url, data, config);
  }

  static patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    ApiBase.ensureReady();
    return ApiBase.instance.patch<T>(url, data, config);
  }
}

export default ApiBase;
