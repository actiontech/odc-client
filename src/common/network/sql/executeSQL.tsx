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

import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import type { ISqlExecuteResult, IExecutingInfo } from '@/d.ts';
import { EStatus, ISqlExecuteResultStatus } from '@/d.ts';
import request from '@/util/request';
import { generateDatabaseSid, generateSessionSid } from '../pathUtil';
import {
  executeSQLPreHandle,
  IExecuteSQLParams,
  IExecuteTaskResult,
  ISQLExecuteTask
} from './preHandle';

/** DMS 超级管理员本窗口旁路头（与切片 §11.3 / §12.4 D 对齐） */
export const SUPER_ADMIN_BYPASS_HEADER = 'X-DMS-Super-Admin-Bypass';

function buildSuperAdminBypassHeaders(enabled?: boolean) {
  if (!enabled) {
    return undefined;
  }
  return {
    [SUPER_ADMIN_BYPASS_HEADER]: 'true'
  };
}

class Task {
  public result: ISqlExecuteResult[] = [];
  public isFinish: boolean;
  public taskLoopInterval = 200;
  private timer = null;
  private isStop = false;
  constructor(
    public requestId: string,
    public sessionId: string,
    private taskInfo: ISQLExecuteTask,
    private onUpdate: (info: IExecutingInfo) => void,
    private superAdminBypass: boolean = false
  ) {}
  private fetchData = async () => {
    const res = await request.get(
      `/api/v2/datasource/sessions/${generateSessionSid(
        this.sessionId
      )}/sqls/getMoreResults`,
      {
        params: {
          requestId: this.requestId
        },
        headers: buildSuperAdminBypassHeaders(this.superAdminBypass)
      }
    );
    if (res?.isError) {
      throw new Error(res?.errMsg);
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
      const data: {
        finished: boolean;
        traceId: string;
        results: ISqlExecuteResult[];
        sql: string;
        sqlId: string;
      } = await this.fetchData();
      if (this.isStop) {
        callback(null);
        return;
      }
      /**
       * merge result
       */
      data?.results?.map((result) => {
        result && this.result.push(result);
      });
      this.onUpdate?.({
        results: this.result || [],
        finished: data.finished,
        task: this.taskInfo,
        traceId: data.traceId,
        executingSQL: data.sql,
        executingSQLId: data.sqlId
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
    onUpdate: (info: IExecutingInfo) => void,
    superAdminBypass: boolean = false
  ): Promise<ISqlExecuteResult[]> {
    const task = new Task(
      requestId,
      sessionId,
      taskInfo,
      onUpdate,
      superAdminBypass
    );
    this.tasks.push(task);
    try {
      const result = await task.getResult();
      this.tasks = this.tasks.filter((_task) => _task !== task);
      return result;
    } catch (e) {
      console.trace('sql task error', e);
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
 * @param onUpdate 执行进度回调
 * @param superAdminBypass 本窗口已确认开启超级管理员旁路时注入请求头
 * @returns
 */
export default async function executeSQL(
  params: IExecuteSQLParams | string,
  sessionId: string,
  dbName: string,
  needModal: boolean = true,
  onUpdate: (info: IExecutingInfo) => void = () => {},
  superAdminBypass: boolean = false
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
  const bypassHeaders = buildSuperAdminBypassHeaders(superAdminBypass);
  const res = await request.post(
    `/api/v2/datasource/sessions/${sid}/sqls/streamExecute`,
    {
      data: serverParams,
      headers: bypassHeaders
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
  const executeRes = await executeTaskManager.addAndWaitTask(
    requestId,
    sessionId,
    taskInfo,
    onUpdate,
    superAdminBypass
  );
  let results = executeRes;
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
    status
  };
}
