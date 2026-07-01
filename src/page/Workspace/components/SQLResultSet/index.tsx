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

import { formatMessage } from '@/util/intl';
import { CloseOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { Badge, Dropdown, Form, MenuProps, message } from 'antd';
import Cookie from 'js-cookie';
import LZString from 'lz-string';
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// @ts-ignore
import { ProfileType } from '@/component/ExecuteSqlDetailModal/constant';
import { LockResultSetHint } from '@/component/LockResultSetHint';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { LOCK_RESULT_SET_COOKIE_KEY, TAB_HEADER_HEIGHT } from '@/constant';
import {
  IResultSet,
  ISqlExecuteResult,
  ISqlExecuteResultStatus,
  ITableColumn
} from '@/d.ts';
import { IUnauthorizedDBResources } from '@/d.ts/table';
import {
  DBServiceService,
  MaskingService,
  ProjectService
} from '@/external_api/base';
import { CreateUnmaskingWorkflowSourceTypeEnum } from '@/external_api/base/common.enum';
import { ModalStore } from '@/store/modal';
import { generateResultSetColumns } from '@/store/helper';
import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import type { SQLStore } from '@/store/sql';
import { inject, observer } from 'mobx-react';
import type { MenuInfo } from 'rc-menu/lib/interface';
import DDLResultSet from '../DDLResultSet';
import { SqlExecuteResultStatusLabel } from './const';
import DBPermissionTable from './DBPermissionTable';
import ExecuteHistory from './ExecuteHistory';
import LintResultTable from './LintResultTable';
import WorkflowExecuteResult from './WorkflowExecuteResult';
import WorkflowExecuteError from './WorkflowExecuteError';
import { IWorkflowExecuteInfo } from '@/common/network/sql/preHandle';
import SQLResultLog from './SQLResultLog';
import { ResultTabsStyleWrapper } from './style';
import {
  BasicButton,
  BasicDrawer,
  BasicInput,
  BasicTag,
  BasicToolTip,
  ResponseCode
} from '@actiontech/dms-kit';
import { getMoreResults } from '@/common/network/sql/executeSQL';
import { generateDMSExportUrl } from '@/util/dms/export';
import { getDMSProjectNameByDatasourceName } from '../../../../util/dms/project';

export const recordsTabKey = 'records';
export const sqlLintTabKey = 'sqlLint';
export const enum MenuKey {
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK'
}

interface IProps {
  sqlStore?: SQLStore;
  modalStore?: ModalStore;
  ctx: any;
  pageKey: string;
  activeKey: string;
  resultHeight: number;
  editingMap: Record<string, boolean>;
  session: SessionStore;
  lintResultSet: ISQLLintReuslt[];
  unauthorizedResource?: IUnauthorizedDBResources[];
  unauthorizedSql?: string;
  sqlChanged?: boolean;
  baseOffset: number;
  approvalRequired: boolean;
  workflowInfo?: IWorkflowExecuteInfo;
  errorMessage?: string;
  onExecuteAnyway?: () => void;

  onCloseWorkflowResult?: () => void;
  onCloseError?: () => void;

  onCloseResultSet: (resultSetKey: string) => void;
  onChangeResultSetTab?: (tabKey: string) => void;
  onExportResultSet: (
    resultSetIndex: number,
    limit: number,
    tableName: string
  ) => void;
  onLockResultSet?: (key: string) => void;
  onUnLockResultSet?: (key: string) => void;
  onShowExecuteDetail: (sql: string, tag: string) => void;
  hanldeCloseLintPage: () => void;
  onSubmitRows: (
    resultSetIndex: number,
    newRows: any[],
    limit: number,
    autoCommit: boolean,
    columnList: Partial<ITableColumn>[],
    dbName: string
  ) => void;
  onShowTrace: (sql: string, tag: string) => void;
  onUpdateEditing: (resultSetIndex: number, editing: boolean) => void;
}

/**
 * 处理导出URL参数的工具函数
 */
const createExportUrlParams = (params: {
  baseUrl?: string;
  sql?: string;
  instanceName?: string;
  databaseName?: string;
  taskName?: string;
  desc?: string;
}): string => {
  const MAX_URL_LENGTH = 2000; // 安全的URL长度限制

  const { baseUrl } = params;
  try {
    // 构建数据对象
    const exportData: Record<string, any> = {};

    if (params.databaseName) {
      exportData.databaseName = params.databaseName;
    }
    if (params.instanceName) {
      exportData.instanceName = params.instanceName;
    }
    if (params.taskName) {
      exportData.taskName = params.taskName;
    }
    if (params.sql && params.sql.trim() !== '') {
      exportData.sql = params.sql.trim();
    }

    if (params.desc) {
      exportData.desc = params.desc;
    }

    if (Object.keys(exportData).length === 0) {
      return baseUrl;
    }

    const jsonStr = JSON.stringify(exportData);

    let compressedData = '';
    try {
      compressedData = LZString.compressToEncodedURIComponent(jsonStr);
    } catch {
      return baseUrl;
    }

    const fullUrl = `${baseUrl}&compression_data=${compressedData}`;

    if (fullUrl.length <= MAX_URL_LENGTH) {
      return fullUrl;
    }

    // URL过长，尝试不传递SQL的版本
    const dataWithoutSql = { ...exportData };
    delete dataWithoutSql.sql;

    if (Object.keys(dataWithoutSql).length > 0) {
      try {
        const jsonStrWithoutSql = JSON.stringify(dataWithoutSql);
        const compressedDataWithoutSql =
          LZString.compressToEncodedURIComponent(jsonStrWithoutSql);
        const urlWithoutSql = `${baseUrl}&compression_data=${compressedDataWithoutSql}`;

        if (urlWithoutSql.length <= MAX_URL_LENGTH) {
          return urlWithoutSql;
        }
      } catch {}
    }

    return baseUrl;
  } catch {
    return baseUrl;
  }
};

const SQLResultSet: React.FC<IProps> = function (props) {
  const {
    activeKey,
    sqlStore,
    ctx,
    modalStore,
    pageKey,
    resultHeight,
    editingMap,
    session,
    lintResultSet,
    unauthorizedResource,
    unauthorizedSql,
    sqlChanged,
    baseOffset,
    onSubmitRows,
    onChangeResultSetTab,
    onShowExecuteDetail,
    onShowTrace,
    onLockResultSet,
    onUnLockResultSet,
    onCloseResultSet,
    hanldeCloseLintPage,
    onUpdateEditing,
    approvalRequired,
    workflowInfo,
    onCloseWorkflowResult,
    errorMessage,
    onCloseError,
    onExecuteAnyway
  } = props;

  const [showLockResultSetHint, setShowLockResultSetHint] = useState(false);
  const [unmaskDrawerVisible, setUnmaskDrawerVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewOriginalLoading, setViewOriginalLoading] = useState(false);
  const [appliedResultSetMap, setAppliedResultSetMap] = useState<
    Record<string, string>
  >({});
  const [unmaskForm] = Form.useForm<{ applyReason: string }>();
  const { resultSets: r } = sqlStore;
  const resultSets = r.get(pageKey);
  const currentResultSet = resultSets?.find((set) => set.uniqKey === activeKey);
  const firstMaskedResultSet = resultSets?.find(
    (set) =>
      set.type !== 'LOG' &&
      set.status === ISqlExecuteResultStatus.SUCCESS &&
      set.columns?.some((column) => column.masked)
  );
  const targetUnmaskResultSet = currentResultSet?.columns?.some(
    (column) => column.masked
  )
    ? currentResultSet
    : firstMaskedResultSet;
  const maskedColumns = useMemo(
    () =>
      targetUnmaskResultSet?.columns?.filter((column) => column.masked) || [],
    [targetUnmaskResultSet]
  );
  const targetUnmaskResultSetKey = targetUnmaskResultSet?.uniqKey || '';
  const hasUnmaskEntrypoint = !!targetUnmaskResultSet;
  const hasAppliedCurrentResultSet =
    !!targetUnmaskResultSetKey &&
    !!appliedResultSetMap[targetUnmaskResultSetKey];

  useEffect(() => {
    if (!Cookie.get(LOCK_RESULT_SET_COOKIE_KEY)) {
      Cookie.set(LOCK_RESULT_SET_COOKIE_KEY, 'true');
      setShowLockResultSetHint(true);
    }
  }, []);

  /**
   * 关闭result tab
   */
  const handleCloseResultSet = useCallback(
    function (resultSetKey: string) {
      onCloseResultSet(resultSetKey);
    },
    [onCloseResultSet]
  );

  /**
   * tab锁菜单点击处理
   */
  const handleMenuClick = useCallback(
    function (param: MenuInfo, key: string) {
      switch (param.key) {
        case MenuKey.LOCK:
          if (onLockResultSet) {
            onLockResultSet(key);
          }
          break;
        case MenuKey.UNLOCK:
          if (onUnLockResultSet) {
            onUnLockResultSet(key);
          }
          break;
        default:
      }
    },
    [onLockResultSet, onUnLockResultSet]
  );

  const handleSubmitUnmaskApply = useCallback(async () => {
    if (!targetUnmaskResultSet) {
      return;
    }
    const values = await unmaskForm.validateFields();
    const [projectName, datasourceName] =
      session?.odcDatabase?.dataSource?.name.split(':');

    const projects = await ProjectService.ListProjectsV2({
      filter_by_name: projectName,
      page_size: 9999
    });

    const projectUid = projects?.data.data[0]?.uid;

    if (!projectUid) {
      message.error(
        formatMessage({
          id: 'odc.components.SQLResultSet.MissingProjectInfo',
          defaultMessage: '缺少项目信息，暂时无法提交申请'
        })
      );
      return;
    }

    const datasources = await DBServiceService.ListDBServiceTips({
      project_uid: projectUid
    });
    const datasourceUid = datasources?.data?.data.find(
      (item) => item.name === datasourceName
    )?.id;

    if (!datasourceUid) {
      message.error(
        formatMessage({
          id: 'odc.components.SQLResultSet.MissingProjectOrDataSourceInfo',
          defaultMessage: '缺少数据源信息，暂时无法提交申请'
        })
      );
      return;
    }
    setSubmitLoading(true);
    try {
      const sqlContent =
        targetUnmaskResultSet.originSql || targetUnmaskResultSet.executeSql;
      const response = await MaskingService.CreateUnmaskingWorkflow({
        project_uid: projectUid,
        unmasking_workflow: {
          apply_reason: values.applyReason,
          datasource_uid: String(datasourceUid),
          default_schema: session?.database?.dbName,
          source_type: CreateUnmaskingWorkflowSourceTypeEnum.sql_workbench,
          source_uid: session.sessionId,
          unmasking_sqls: sqlContent
            ? [
                {
                  sql_content: sqlContent,
                  sql_index_id: String(targetUnmaskResultSet.sqlId)
                }
              ]
            : undefined
        }
      });
      const result = response?.data;
      const isSuccess = result.code === ResponseCode.SUCCESS;

      if (!isSuccess) {
        throw new Error(result?.message || '申请提交失败');
      }
      if (targetUnmaskResultSet.uniqKey) {
        setAppliedResultSetMap((prev) => ({
          ...prev,
          [targetUnmaskResultSet.uniqKey]:
            result?.data?.workflow_id || targetUnmaskResultSet.sqlId
        }));
      }
      message.success(
        formatMessage({
          id: 'odc.components.SQLResultSet.UnmaskingApplySubmitted',
          defaultMessage: '申请已提交，审批通过后可在工单详情中查看原文'
        })
      );
      setUnmaskDrawerVisible(false);
      unmaskForm.resetFields();
    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : '申请提交失败，请稍后重试';
      message.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  }, [session, targetUnmaskResultSet, unmaskForm]);

  const updateResultSetWithOriginalData = useCallback(
    (result: ISqlExecuteResult) => {
      if (!targetUnmaskResultSet?.uniqKey) {
        return;
      }
      const parsed = generateResultSetColumns(
        [result],
        session?.connection?.dialectType,
        targetUnmaskResultSet.uniqKey
      )?.[0];

      if (!parsed) {
        return;
      }
      const allResultSets = sqlStore.resultSets.get(pageKey) || [];
      const index = allResultSets.findIndex(
        (item) => item.uniqKey === targetUnmaskResultSet.uniqKey
      );
      if (index < 0) {
        return;
      }
      const nextResultSets = [...allResultSets];
      nextResultSets[index] = {
        ...nextResultSets[index],
        ...parsed,
        locked: nextResultSets[index]?.locked
      };
      sqlStore.resultSets.set(pageKey, nextResultSets);
    },
    [pageKey, session?.connection?.dialectType, sqlStore, targetUnmaskResultSet]
  );

  const handleViewOriginalData = useCallback(async () => {
    if (
      !targetUnmaskResultSet?.requestId ||
      !targetUnmaskResultSet?.sessionId
    ) {
      setUnmaskDrawerVisible(true);
      return;
    }
    setViewOriginalLoading(true);
    try {
      const resultResp = await getMoreResults(
        targetUnmaskResultSet.sessionId,
        String(targetUnmaskResultSet.requestId),
        {
          viewOriginalData: true,
          ignoreError: true
        }
      );

      if (!resultResp?.isError) {
        const originalResult = resultResp?.data?.results?.[0];
        if (originalResult) {
          updateResultSetWithOriginalData(originalResult);
          message.success(
            formatMessage({
              id: 'odc.components.SQLResultSet.ViewOriginalDataSuccess',
              defaultMessage: '已展示原文数据'
            })
          );
          return;
        }
      }

      const errCode = String(resultResp?.errCode || '');
      const errMsg = resultResp?.errMsg || '';
      const isForbidden =
        errCode === '403' || /403|forbidden|permission/i.test(errMsg);

      if (isForbidden) {
        setUnmaskDrawerVisible(true);
        return;
      }
      message.error(errMsg || '查看原文失败，请稍后重试');
    } catch (e) {
      const errMsg =
        e instanceof Error ? e.message : '查看原文失败，请稍后重试';
      message.error(errMsg);
    } finally {
      setViewOriginalLoading(false);
    }
  }, [targetUnmaskResultSet, updateResultSetWithOriginalData]);

  /**
   * 生成菜单头
   */
  function getResultSetTitle(
    resultSetIdx: number,
    sql: string,
    title: string,
    locked: boolean,
    resultSetKey: string,
    containsMasked: boolean
  ): ReactNode {
    const menu: MenuProps = {
      style: {
        width: '160px'
      },
      onClick: (e) => {
        e.domEvent.preventDefault();
        e.domEvent.stopPropagation();
        handleMenuClick(e, resultSetKey);
      },
      items: [
        {
          key: MenuKey.LOCK,
          label: formatMessage({
            id: 'workspace.window.sql.record.column.lock',
            defaultMessage: '固定'
          })
        },
        {
          key: MenuKey.UNLOCK,
          label: formatMessage({
            id: 'workspace.window.sql.record.column.unlock',
            defaultMessage: '解除固定'
          })
        }
      ]
    };

    return (
      <>
        {resultSetIdx === 0 && showLockResultSetHint && (
          <div className="lockHint">
            <LockResultSetHint
              onClose={() => setShowLockResultSetHint(false)}
            />
          </div>
        )}

        <Dropdown menu={menu} trigger={['contextMenu']}>
          <span
            className="resultSetTitle"
            style={{
              background: 'transparent'
            }}
          >
            <BasicToolTip
              placement="topLeft"
              title={
                <div
                  style={{
                    maxHeight: 300,
                    overflowY: 'auto'
                  }}
                >
                  {sql}
                </div>
              }
            >
              <span className="title">{title}</span>
              {containsMasked && (
                <BasicToolTip
                  title={formatMessage({
                    id: 'odc.components.SQLResultSet.ContainsMaskedColumns',
                    defaultMessage: '该结果包含脱敏字段'
                  })}
                >
                  <SafetyOutlined
                    style={{
                      marginLeft: 4,
                      fontSize: 12,
                      color: 'var(--text-color-hint)'
                    }}
                  />
                </BasicToolTip>
              )}
            </BasicToolTip>
            <span className="extraBox">
              {locked ? (
                <LockOutlined
                  className="closeBtn"
                  style={{ fontSize: '10px' }}
                />
              ) : (
                <CloseOutlined
                  className="closeBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseResultSet(resultSetKey);
                  }}
                  style={{ fontSize: '8px' }}
                />
              )}
            </span>
          </span>
        </Dropdown>
      </>
    );
  }
  let resultTabCount = 0;
  if (unauthorizedResource?.length) {
    return (
      <DBPermissionTable
        sql={unauthorizedSql}
        dataSource={unauthorizedResource}
      />
    );
  }
  const stopRunning = () => {
    sqlStore.stopExec(ctx.props.pageKey, ctx?.getSession()?.sessionId);
  };
  const onOpenExecutingDetailModal = (
    id: string,
    sql?: string,
    sessionId?: string,
    traceEmptyReason?: string
  ) => {
    const session = sessionId
      ? sessionManager.sessionMap.get(sessionId)
      : ctx?.getSession();
    modalStore.changeExecuteSqlDetailModalVisible(
      true,
      id,
      sql,
      session,
      ctx?.editor.getSelectionContent(),
      ProfileType.Execute,
      traceEmptyReason
    );
  };

  const isSupportProfile = session?.supportFeature.enableProfile;

  return (
    <>
      <WorkflowExecuteResult
        workflowInfo={workflowInfo}
        onClose={onCloseWorkflowResult}
      />
      <WorkflowExecuteError
        errorMessage={errorMessage}
        onClose={onCloseError}
      />
      <ResultTabsStyleWrapper
        className="tabs"
        activeKey={activeKey}
        tabBarGutter={0}
        tabBarExtraContent={
          hasUnmaskEntrypoint ? (
            <BasicButton
              size="small"
              icon={<LockOutlined />}
              loading={viewOriginalLoading}
              type={hasAppliedCurrentResultSet ? 'default' : 'primary'}
              onClick={handleViewOriginalData}
            >
              {hasAppliedCurrentResultSet
                ? formatMessage({
                    id: 'odc.components.SQLResultSet.UnmaskApplySubmitted',
                    defaultMessage: '查看原文工单（已提交）'
                  })
                : formatMessage({
                    id: 'odc.components.SQLResultSet.ViewOriginalData',
                    defaultMessage: '查看原文'
                  })}
            </BasicButton>
          ) : null
        }
        onChange={onChangeResultSetTab}
        animated={false}
        items={[
          {
            label: formatMessage({
              id: 'workspace.window.sql.record.title',
              defaultMessage: '执行记录'
            }),
            key: recordsTabKey,
            children: (
              <ExecuteHistory
                resultHeight={resultHeight}
                onShowExecuteDetail={onShowExecuteDetail}
                onOpenExecutingDetailModal={onOpenExecutingDetailModal}
              />
            )
          },
          lintResultSet?.length
            ? {
                label: (
                  <span className="resultSetTitle">
                    {
                      formatMessage({
                        id: 'odc.components.SQLResultSet.Problem',
                        defaultMessage: '问题'
                      }) /*问题*/
                    }

                    <span className="extraBox">
                      <CloseOutlined
                        className="closeBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          hanldeCloseLintPage();
                        }}
                        style={{ fontSize: '8px' }}
                      />
                    </span>
                  </span>
                ),

                key: sqlLintTabKey,
                children: (
                  <LintResultTable
                    session={session}
                    resultHeight={resultHeight}
                    modalStore={modalStore}
                    ctx={ctx?.editor}
                    lintResultSet={lintResultSet}
                    sqlChanged={sqlChanged}
                    baseOffset={baseOffset}
                    approvalRequired={approvalRequired}
                    onExecuteAnyway={onExecuteAnyway}
                  />
                )
              }
            : null
        ]
          .concat(
            // @ts-expect-error(ts error)
            resultSets?.map((set: IResultSet, i: number) => {
              const isResultTab =
                set.columns?.length &&
                set.status === ISqlExecuteResultStatus.SUCCESS;
              const isLogTab = set.type === 'LOG';
              const tableName = set.resultSetMetaData?.table?.tableName;
              if (isResultTab && resultTabCount < 30) {
                const executeStage = set.timer?.stages?.find(
                  (stage) => stage.stageName === 'Execute'
                );

                const executeSQLStage = executeStage?.subStages?.find(
                  (stage) => stage.stageName === 'OBServer Execute SQL'
                );

                resultTabCount += 1;
                return {
                  key: set.uniqKey,
                  label: getResultSetTitle(
                    i,
                    set.executeSql,
                    formatMessage({
                      id: 'workspace.window.sql.result',
                      defaultMessage: '结果'
                    }) + resultTabCount,
                    set.locked,
                    set.uniqKey,
                    !!set.columns?.some((column) => column.masked)
                  ),
                  children: (
                    <DDLResultSet
                      key={set.uniqKey || i}
                      dbTotalDurationMicroseconds={
                        executeSQLStage?.totalDurationMicroseconds
                      }
                      showExplain={true}
                      showExecutePlan={session?.supportFeature.enableProfile}
                      showPagination={true}
                      showTrace={session?.supportFeature?.enableSQLTrace}
                      onOpenExecutingDetailModal={onOpenExecutingDetailModal}
                      columns={set.columns}
                      timer={set.timer}
                      session={session}
                      sqlId={set.sqlId}
                      autoCommit={session?.params?.autoCommit}
                      table={{
                        tableName,
                        columns: set.resultSetMetaData?.columnList
                      }}
                      disableEdit={
                        !set.resultSetMetaData?.editable ||
                        !!set.resultSetMetaData?.columnList?.filter((c) => !c)
                          ?.length
                      }
                      rows={set.rows}
                      enableRowId={true}
                      originSql={set.originSql}
                      resultHeight={resultHeight - TAB_HEADER_HEIGHT}
                      generalSqlType={set.generalSqlType}
                      traceId={set.traceId}
                      onExport={() => {
                        if (set.allowExport) {
                          const url = generateDMSExportUrl({
                            sql: set.originSql,
                            instanceName: session.odcDatabase.dataSource.name,
                            schemaName:
                              set.resultSetMetaData?.table?.databaseName,
                            projectName: getDMSProjectNameByDatasourceName(
                              session.odcDatabase.dataSource.name
                            )
                          });
                          window.open(url);
                        }
                      }}
                      onShowExecuteDetail={() =>
                        onShowExecuteDetail(set.initialSql, set.traceId)
                      }
                      onShowTrace={() =>
                        onShowTrace(set.initialSql, set.traceId)
                      }
                      onSubmitRows={(newRows, limit, autoCommit, columns) =>
                        onSubmitRows(
                          i,
                          newRows,
                          limit,
                          autoCommit,
                          columns,
                          set?.resultSetMetaData?.table?.databaseName
                        )
                      }
                      onUpdateEditing={(editing) => onUpdateEditing(i, editing)}
                      isEditing={editingMap[set.uniqKey]}
                      withFullLinkTrace={set?.withFullLinkTrace}
                      traceEmptyReason={set?.traceEmptyReason}
                      withQueryProfile={set?.withQueryProfile}
                    />
                  )
                };
              }
              if (isLogTab) {
                const count = {
                  [ISqlExecuteResultStatus.CREATED]: {
                    lable: SqlExecuteResultStatusLabel.CREATED,
                    count: set?.total
                  },
                  [ISqlExecuteResultStatus.SUCCESS]: {
                    lable: SqlExecuteResultStatusLabel.SUCCESS,
                    //执行成功
                    count: 0
                  },

                  [ISqlExecuteResultStatus.FAILED]: {
                    lable: SqlExecuteResultStatusLabel.FAILED,
                    //执行失败
                    count: 0
                  },

                  [ISqlExecuteResultStatus.CANCELED]: {
                    lable: SqlExecuteResultStatusLabel.CANCELED,
                    //执行取消
                    count: 0
                  }
                };

                set?.logTypeData?.forEach((item) => {
                  count[item.status].count += 1;
                  count[ISqlExecuteResultStatus.CREATED].count -= 1;
                });
                const hasError =
                  count[ISqlExecuteResultStatus.SUCCESS].count !==
                  set?.logTypeData?.length;
                return {
                  label: (
                    <BasicToolTip
                      title={
                        <pre style={{ marginBottom: 0 }}>
                          {Object.entries(count)
                            .map(([, item]) => {
                              return formatMessage(
                                {
                                  id: 'odc.components.SQLResultSet.ItemcountSqlItemlabel',
                                  defaultMessage:
                                    '{itemCount} 条 SQL {itemLabel}'
                                },

                                { itemCount: item.count, itemLabel: item.lable }
                              );

                              //`${item.count} 条 SQL ${item.lable}`
                            })
                            .join('\n')}
                        </pre>
                      }
                    >
                      <span className="resultSetTitle">
                        {
                          formatMessage({
                            id: 'odc.components.SQLResultSet.Log',
                            defaultMessage: '日志'
                          })

                          /* 日志 */
                        }

                        <span className="extraStatusBox">
                          <Badge status={hasError ? 'error' : 'success'} />
                        </span>
                        <span className="extraBox">
                          <CloseOutlined
                            className="closeBtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseResultSet(set.uniqKey);
                            }}
                            style={{ fontSize: '8px' }}
                          />
                        </span>
                      </span>
                    </BasicToolTip>
                  ),

                  key: set.uniqKey,
                  children: (
                    <SQLResultLog
                      resultHeight={resultHeight}
                      resultSet={set}
                      stopRunning={
                        (ctx?.getSession() as SessionStore)?.params
                          ?.killCurrentQuerySupported
                          ? stopRunning
                          : null
                      }
                      onOpenExecutingDetailModal={onOpenExecutingDetailModal}
                      loading={sqlStore.logLoading}
                      isSupportProfile={isSupportProfile}
                    />
                  )
                };
              }
            })
          )
          .filter(Boolean)}
      />
      <BasicDrawer
        title={formatMessage({
          id: 'odc.components.SQLResultSet.ApplyViewOriginalData',
          defaultMessage: '申请查看原文'
        })}
        width={520}
        open={unmaskDrawerVisible}
        onClose={() => {
          setUnmaskDrawerVisible(false);
          unmaskForm.resetFields();
        }}
        destroyOnClose={true}
        footer={
          <>
            <BasicButton
              onClick={() => {
                setUnmaskDrawerVisible(false);
                unmaskForm.resetFields();
              }}
            >
              {formatMessage({
                id: 'odc.components.SQLResultSet.Cancel',
                defaultMessage: '取消'
              })}
            </BasicButton>
            <BasicButton
              type="primary"
              loading={submitLoading}
              onClick={handleSubmitUnmaskApply}
            >
              {formatMessage({
                id: 'odc.components.SQLResultSet.SubmitApply',
                defaultMessage: '提交申请'
              })}
            </BasicButton>
          </>
        }
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 8 }}>
            {formatMessage({
              id: 'odc.components.SQLResultSet.MaskedColumns',
              defaultMessage: '脱敏字段'
            })}
          </div>
          <div>
            {maskedColumns?.length ? (
              maskedColumns.map((column) => (
                <BasicTag key={column.key} style={{ marginBottom: 8 }}>
                  {column.name}
                </BasicTag>
              ))
            ) : (
              <span style={{ color: 'var(--text-color-hint)' }}>
                {formatMessage({
                  id: 'odc.components.SQLResultSet.NoMaskedColumnsFound',
                  defaultMessage: '未识别到脱敏字段'
                })}
              </span>
            )}
          </div>
        </div>
        <Form form={unmaskForm} layout="vertical">
          <Form.Item
            label={formatMessage({
              id: 'odc.components.SQLResultSet.ApplyReason',
              defaultMessage: '申请理由'
            })}
            name="applyReason"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.SQLResultSet.ApplyReasonRequired',
                  defaultMessage: '请填写申请理由'
                })
              }
            ]}
          >
            <BasicInput.TextArea
              maxLength={300}
              rows={4}
              showCount={true}
              placeholder={formatMessage({
                id: 'odc.components.SQLResultSet.ApplyReasonPlaceholder',
                defaultMessage: '请说明查看原文的业务原因'
              })}
            />
          </Form.Item>
        </Form>
      </BasicDrawer>
    </>
  );
};

export default inject(
  'sqlStore',
  'userStore',
  'pageStore',
  'modalStore'
)(observer(SQLResultSet));
