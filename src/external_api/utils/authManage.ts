import axios, { AxiosRequestConfig } from 'axios';
import {
  DMS_REDIRECT_KEY_PARAMS_NAME,
  ResponseCode,
  StorageKey,
  getErrorMessage,
  getResponseCode
} from '@actiontech/dms-kit';
import EmitterKey from '@actiontech/dms-kit/es/data/EmitterKey';
import { eventEmitter } from '@actiontech/dms-kit/es/utils/EventEmitter';
import { ArgsProps } from 'antd/es/notification/interface';
import { NotificationInstanceKeyType } from '@/hooks/useNotificationContext';
import { IRefreshSessionReturn } from '@/external_api/base/Session/index.type';
import { formatMessage } from '@/util/intl';

class AuthManager {
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;
  private failedRequestsQueue: Array<{
    config: AxiosRequestConfig;
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  redirectToLogin = () => {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;

    localStorage.removeItem(StorageKey.Token);
    localStorage.removeItem(StorageKey.USER_UID);
    localStorage.removeItem(StorageKey.DMS_AVAILABILITY_ZONE);

    if (currentPath === '/login') {
      return;
    }

    const targetUrl = currentPath + currentSearch;
    window.location.href = `/login?${DMS_REDIRECT_KEY_PARAMS_NAME}=${encodeURIComponent(
      targetUrl
    )}`;
  };

  refreshAuthToken = () => {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    this.refreshPromise = axios
      .post<IRefreshSessionReturn>('/v1/dms/sessions/refresh')
      .then(async (res) => {
        const responseCode = await getResponseCode(res);
        if (res.status === 401) {
          this.failedRequestsQueue.forEach((request) =>
            request.reject('Token refresh failed')
          );
          this.failedRequestsQueue.length = 0;
          this.redirectToLogin();
        } else if (responseCode === ResponseCode.SUCCESS) {
          const newToken = res.data.data?.token
            ? `Bearer ${res.data.data.token}`
            : '';
          if (newToken) {
            localStorage.setItem(StorageKey.Token, newToken);

            this.failedRequestsQueue.forEach((request) => {
              const newConfig = { ...request.config };
              if (newConfig.headers) {
                newConfig.headers.Authorization = newToken;
              }

              axios(newConfig)
                .then((response) => request.resolve(response))
                .catch((err) => request.reject(err));
            });

            this.failedRequestsQueue.length = 0;
          }
        } else {
          this.failedRequestsQueue.forEach((request) =>
            request.reject('Token refresh failed')
          );
          this.failedRequestsQueue.length = 0;
          this.redirectToLogin();

          const errorMessage = getErrorMessage(res.data.message ?? '');
          eventEmitter.emit<[NotificationInstanceKeyType, ArgsProps]>(
            EmitterKey.OPEN_GLOBAL_NOTIFICATION,
            'error',
            {
              message: `${formatMessage({
                id: 'odc.src.util.notification.RequestFailed',
                defaultMessage: '请求失败'
              })}`,
              description: errorMessage
            }
          );
        }
        return res;
      })
      .catch((error) => {
        this.failedRequestsQueue.forEach((request) =>
          request.reject('Token refresh failed')
        );
        this.failedRequestsQueue.length = 0;

        const errorMessage = error.message || formatMessage({});
        eventEmitter.emit<[NotificationInstanceKeyType, ArgsProps]>(
          EmitterKey.OPEN_GLOBAL_NOTIFICATION,
          'error',
          {
            message: `${formatMessage({
              id: 'odc.src.util.notification.RequestFailed',
              defaultMessage: '请求失败'
            })}`,
            description: errorMessage
          }
        );

        this.redirectToLogin();
        return Promise.reject(error);
      })
      // @ts-ignore
      .finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  };

  addFailedRequest = (config: AxiosRequestConfig) => {
    const retryRequestPromise = new Promise((resolve, reject) => {
      this.failedRequestsQueue.push({
        config,
        resolve,
        reject
      });
    });

    if (!this.isRefreshing) {
      this.refreshAuthToken();
    }

    return retryRequestPromise;
  };
}

const authManager = new AuthManager();

export const redirectToLogin = authManager.redirectToLogin;
export const refreshAuthToken = authManager.refreshAuthToken;
export const addFailedRequest = authManager.addFailedRequest;

export default authManager;
