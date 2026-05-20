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
import { CloseOutlined, LockOutlined } from '@ant-design/icons';
import { Badge, Dropdown, MenuProps } from 'antd';
import Cookie from 'js-cookie';
import LZString from 'lz-string';
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
// @ts-ignore
import { ProfileType } from '@/component/ExecuteSqlDetailModal/constant';
import { LockResultSetHint } from '@/component/LockResultSetHint';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { LOCK_RESULT_SET_COOKIE_KEY, TAB_HEADER_HEIGHT } from '@/constant';
import { IResultSet, ISqlExecuteResultStatus, ITableColumn } from '@/d.ts';
import { IUnauthorizedDBResources } from '@/d.ts/table';
import { ModalStore } from '@/store/modal';
import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import type { SQLStore } from '@/store/sql';
import { inject, observer } from 'mobx-react';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { getDataSourceModeConfig } from '@/common/datasource';
import DDLResultSet from '../DDLResultSet';
import { SqlExecuteResultStatusLabel } from './const';
import DBPermissionTable from './DBPermissionTable';
import ExecuteHistory from './ExecuteHistory';
import LintResultTable from './LintResultTable';
import SQLResultLog from './SQLResultLog';
import { ResultTabsStyleWrapper } from './style';
import { BasicToolTip } from '@actiontech/dms-kit';
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
    approvalRequired
  } = props;

  const [showLockResultSetHint, setShowLockResultSetHint] = useState(false);
  const { resultSets: r } = sqlStore;
  const resultSets = r.get(pageKey);

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

  /**
   * 生成菜单头
   */
  function getResultSetTitle(
    resultSetIdx: number,
    sql: string,
    title: string,
    locked: boolean,
    resultSetKey: string
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
    <ResultTabsStyleWrapper
      className="tabs"
      activeKey={activeKey}
      tabBarGutter={0}
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
                  set.uniqKey
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
                        ?.length ||
                      // tableDataEditable=false 时（Hive 等只读数据源）禁用结果集编辑
                      // （design §4.2.4 / compat-RISK-8）。
                      !(
                        getDataSourceModeConfig(session?.connection?.type)
                          ?.features?.tableDataEditable ?? true
                      )
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
                    onShowTrace={() => onShowTrace(set.initialSql, set.traceId)}
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
                                defaultMessage: '{itemCount} 条 SQL {itemLabel}'
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
  );
};

export default inject(
  'sqlStore',
  'userStore',
  'pageStore',
  'modalStore'
)(observer(SQLResultSet));
