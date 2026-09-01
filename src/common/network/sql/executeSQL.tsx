/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
  IPrivilegeDeniedContext,
  ISqlExecuteResult,
  IExecutingInfo
} from '@/d.ts';
import { ISqlExecuteResultStatus } from '@/d.ts';
import request from '@/util/request';
import { generateDatabaseSid, generateSessionSid } from '../pathUtil';
import {
  executeSQLPreHandle,
  IExecuteSQLParams,
  IExecuteTaskResult,
  ISQLExecuteTask
} from './preHandle';

interface IGetMoreResultsOptions {
  viewOriginalData?: boolean;
  ignoreError?: boolean;
}

interface IGetMoreResultsData {
  finished: boolean;
  traceId: string;
  results: ISqlExecuteResult[];
  sql: string;
  sqlId: string;
  privilege_denied?: boolean;
  project_uid?: string;
  db_service_uid?: string;
  db_service_name?: string;
  db_account_uid?: string;
  db_account_name?: string;
  raw_sql?: string;
  error_message?: string;
  vendor_code?: string | null;
  sql_state?: string | null;
  requested_objects?: IPrivilegeDeniedContext['requested_objects'];
  requested_actions?: string[];
}

export function extractPrivilegeDeniedContext(
  data?: IGetMoreResultsData | null
): IPrivilegeDeniedContext | undefined {
  if (!data || data.privilege_denied !== true) {
    return undefined;
  }
  return {
    privilege_denied: true,
    project_uid: data.project_uid || '',
    db_service_uid: data.db_service_uid || '',
    db_service_name: data.db_service_name,
    db_account_uid: data.db_account_uid || '',
    db_account_name: data.db_account_name || '',
    raw_sql: data.raw_sql || data.sql || '',
    error_message: data.error_message || '',
    vendor_code: data.vendor_code ?? null,
    sql_state: data.sql_state ?? null,
    requested_objects: data.requested_objects || [],
    requested_actions: data.requested_actions || []
  };
}

export async function getMoreResults(
  sessionId: string,
  requestId: string,
  options: IGetMoreResultsOptions = {}
): Promise<{
  isError: boolean;
  errCode?: string | number;
  errMsg?: string;
  data?: IGetMoreResultsData;
}> {
  const res = await request.get(
    `/api/v2/datasource/sessions/${generateSessionSid(
      sessionId
    )}/sqls/getMoreResults`,
    {
      params: {
        requestId,
        view_original_data: options.viewOriginalData,
        ignoreError: options.ignoreError
      }
    }
  );
  if (res?.isError) {
    return {
      isError: true,
      errCode: res?.errCode,
      errMsg: res?.errMsg
    };
  }
  return {
    isError: false,
    data: res?.data
  };
}

class Task {
  public result: ISqlExecuteResult[] = [];
  public isFinish: boolean;
  public taskLoopInterval = 200;
  public privilegeDeniedContext?: IPrivilegeDeniedContext;
  private timer = null;
  private isStop = false;
  constructor(
    public requestId: string,
    public sessionId: string,
    private taskInfo: ISQLExecuteTask,
    private onUpdate: (info: IExecutingInfo) => void
  ) {}
  private fetchData = async () => {
    const res = await getMoreResults(this.sessionId, this.requestId);
    if (res?.isError) {
      throw new Error(res?.errMsg || 'get more results failed');
    }
    return res?.data;
  };
  public getResult = async (): Promise<ISqlExecuteResult[]> => {
    return new Promise((resolve, reject) => {
      this.onUpdate({
        finished: false,
        results: [],
        task: this.taskInfo,
        traceId: null,
        executingSQL: null,
        executingSQLId: null
      });
      this._getResult(resolve);
    });
  };
  private _getResult = async (callback) => {
    if (this.isStop) {
      callback(null);
      return;
    }
    try {
      const data: IGetMoreResultsData = await this.fetchData();
      if (this.isStop) {
        callback(null);
        return;
      }
      /**
       * merge result
       */
      data?.results?.forEach((result) => {
        if (result) {
          this.result.push(result);
        }
      });
      const privilegeDeniedContext =
        extractPrivilegeDeniedContext(data) || this.privilegeDeniedContext;
      if (privilegeDeniedContext) {
        this.privilegeDeniedContext = privilegeDeniedContext;
      }
      this.onUpdate?.({
        results: this.result || [],
        finished: data.finished,
        task: this.taskInfo,
        traceId: data.traceId,
        executingSQL: data.sql,
        executingSQLId: data.sqlId,
        privilegeDeniedContext: this.privilegeDeniedContext
      });
      if (data?.finished) {
        callback(this.result);
        return;
      } else {
        this.timer = setTimeout(() => {
          this._getResult(callback);
        }, this.taskLoopInterval);
      }
    } catch (e) {
      console.trace('get execute result fail', e);
      callback(null);
    }
  };
  public stopTask = () => {
    clearTimeout(this.timer);
    this.isStop = true;
  };
}
class TaskManager {
  public tasks: Task[] = [];
  public async stopAllTask() {
    this.tasks.forEach((task) => {
      task.stopTask();
    });
    this.tasks = [];
  }
  public async stopTask(sessionId: string) {
    this.tasks.forEach((task, index) => {
      if (task.sessionId === sessionId) {
        task.stopTask();
        this.tasks[index] = null;
      }
    });
    this.tasks = this.tasks.filter(Boolean);
  }
  public async addAndWaitTask(
    requestId: string,
    sessionId: string,
    taskInfo: ISQLExecuteTask,
    onUpdate: (info: IExecutingInfo) => void
  ): Promise<{
    results: ISqlExecuteResult[];
    privilegeDeniedContext?: IPrivilegeDeniedContext;
  }> {
    const task = new Task(requestId, sessionId, taskInfo, onUpdate);
    this.tasks.push(task);
    try {
      const result = await task.getResult();
      this.tasks = this.tasks.filter((_task) => _task !== task);
      return {
        results: result,
        privilegeDeniedContext: task.privilegeDeniedContext
      };
    } catch (e) {
      console.trace('sql task error', e);
      return { results: null };
    }
  }
}
export const executeTaskManager = new TaskManager();
/**
 *
 * @param params 要执行的SQL内容，可能为string或IExecuteSQLParams类型
 * @param sessionId 会话ID
 * @param dbName 数据库名称
 * @param needModal SQL确认弹窗，默认需要弹出
 * @returns
 */
export default async function executeSQL(
  params: IExecuteSQLParams | string,
  sessionId: string,
  dbName: string,
  needModal: boolean = true,
  onUpdate: (info: IExecutingInfo) => void = () => {}
): Promise<IExecuteTaskResult> {
  const sid = generateDatabaseSid(dbName, sessionId);
  const serverParams =
    typeof params === 'string'
      ? {
          sid,
          sql: params
        }
      : {
          sid,
          ...params
        };
  const res = await request.post(
    `/api/v2/datasource/sessions/${sid}/sqls/streamExecute`,
    {
      data: serverParams
    }
  );
  const taskInfo: ISQLExecuteTask = res?.data;

  const {
    pass,
    data: preHandleData,
    lintResultSet,
    status
  } = executeSQLPreHandle(taskInfo, params, needModal, sessionId);
  if (!pass) {
    return preHandleData;
  }
  const requestId = taskInfo?.requestId;
  const taskOutcome = await executeTaskManager.addAndWaitTask(
    requestId,
    sessionId,
    taskInfo,
    onUpdate
  );
  let results = taskOutcome?.results;
  results = results?.map((result) => {
    if (!result.requestId) {
      result.requestId = requestId;
    }
    return result;
  });
  return {
    invalid: false,
    executeSuccess:
      !!results &&
      !results?.find(
        (result) => result.status !== ISqlExecuteResultStatus.SUCCESS
      ),
    executeResult: results || [],
    violatedRules: [],
    lintResultSet,
    hasLintResults: lintResultSet?.length > 0,
    status,
    privilegeDeniedContext: taskOutcome?.privilegeDeniedContext
  };
}
