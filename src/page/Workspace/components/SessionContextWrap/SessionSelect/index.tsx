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
import React, { useContext, useEffect } from 'react';
import SessionContext from '../context';
import { DatabaseGroup } from '@/d.ts/database';

import ConnectionPopover from '@/component/ConnectionPopover';
import Icon, {
  AimOutlined,
  DownOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Divider, Popover, Spin, Tooltip } from 'antd';
import {
  LineStyleWrapper,
  ContentStyleWrapper,
  LinkStyleWrapper,
  AimStyleWrapper,
  SessionInfoStyleWrapper,
  EllipsisStyleWrapper,
  DatasourceAndProjectItemStyleWrapper,
  DescribeItemStyleWrapper,
  DatasourceAndProjectItemBoxStyleWrapper
} from './style';

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { IDataSourceModeConfig } from '@/common/datasource/interface';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { EnvColorMap } from '@/constant';
import { ConnectionMode } from '@/d.ts';
import ActivityBarContext from '@/page/Workspace/context/ActivityBarContext';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import login from '@/store/login';
import tracert from '@/util/tracert';

import SessionDropdown from './SessionDropdown';
import { getShouldExpandedKeysByPage } from '@/page/Workspace/SideBar/ResourceTree/const';
import { inject, observer } from 'mobx-react';
import type { PageStore } from '@/store/page';
import { ActivityBarItemType } from '../../../ActivityBar/type';

interface IProps {
  readonly?: boolean;
  dialectTypes?: ConnectionMode[];
  feature?: keyof IDataSourceModeConfig['features'];
  supportLocation?: boolean;
  isIncludeLogicalDb?: boolean;
  pageStore?: PageStore;
}

const SessionSelect: React.FC<IProps> = (props) => {
  const {
    readonly,
    feature,
    supportLocation,
    isIncludeLogicalDb = true,
    pageStore
  } = props;
  const context = useContext(SessionContext);
  const resourceTreeContext = useContext(ResourceTreeContext);
  const activityContext = useContext(ActivityBarContext);
  useEffect(() => {
    tracert.expo('a3112.b41896.c330994');
  }, []);

  function focusDataBase(e: React.MouseEvent) {
    const datasourceId =
      context?.session?.odcDatabase?.dataSource?.id || context?.datasourceId;
    activityContext.setActiveKey(ActivityBarItemType.Database);
    const obj = getShouldExpandedKeysByPage({
      page: pageStore.activePage,
      db: context?.session?.odcDatabase,
      groupMode: resourceTreeContext.groupMode,
      datasourceId,
      databaseList: resourceTreeContext.databaseList,
      setGroupMode: (group: DatabaseGroup) => {
        resourceTreeContext.setGroupMode(group);
      }
    });
    resourceTreeContext.setSelectDatasourceId(datasourceId);
    resourceTreeContext.setShouldExpandedKeys(obj?.shouldExpandedKeys || []);
    resourceTreeContext.setCurrentObject({
      value: obj?.currentKey,
      type: obj?.currentResourceNodeType
    });
    e.stopPropagation();
    e.preventDefault();
  }

  function renderEnv() {
    if (!context?.session?.odcDatabase?.environment?.name) {
      return null;
    }
    return (
      <RiskLevelLabel
        color={context?.session?.odcDatabase?.environment?.style}
        content={context?.session?.odcDatabase?.environment?.name}
      />
    );
  }
  function renderSessionInfo() {
    const fromDataSource = context.datasourceMode;

    const dsStyle = getDataSourceStyleByConnectType(
      context?.session?.connection?.type
    );
    const databaseItem = (
      <Popover
        overlayClassName="sessionSelectPop"
        placement="bottomLeft"
        content={
          <ConnectionPopover
            connection={context?.session?.connection}
            database={context?.session?.odcDatabase}
            showRemark
          />
        }
      >
        {fromDataSource ? (
          <LinkStyleWrapper size={4}>
            <Icon
              component={dsStyle?.icon?.component}
              style={{
                fontSize: 16,
                verticalAlign: 'middle',
                color: dsStyle?.icon?.color
              }}
            />

            <span style={{ lineHeight: 1, color: 'var(--text-color-primary)' }}>
              {context?.session?.connection?.name}
            </span>
            <DownOutlined />
          </LinkStyleWrapper>
        ) : (
          <LinkStyleWrapper style={{ lineHeight: '22px' }} size={4}>
            <Icon
              component={dsStyle?.dbIcon?.component}
              style={{ fontSize: 16, verticalAlign: 'middle' }}
            />

            <span style={{ lineHeight: 1 }}>
              {context?.session?.odcDatabase?.name}
            </span>
            <DownOutlined />
          </LinkStyleWrapper>
        )}
      </Popover>
    );

    const aimItem = (
      <AimStyleWrapper as={AimOutlined} onClick={focusDataBase} />
    );
    const datasourceAndProjectItem = !fromDataSource ? (
      <DatasourceAndProjectItemStyleWrapper
        size={1}
        split={<Divider type="vertical" />}
        align="center"
      >
        {login.isPrivateSpace() ? null : (
          <DescribeItemStyleWrapper>
            <span className="label">
              {formatMessage({
                id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.38EA55F4' /*项目：*/,
                defaultMessage: '项目：'
              })}
            </span>
            <Tooltip
              title={context?.session?.odcDatabase?.project?.name}
              placement="bottom"
              overlayClassName="sessionSelectTooltip"
            >
              <EllipsisStyleWrapper>
                {context?.session?.odcDatabase?.project?.name}
              </EllipsisStyleWrapper>
            </Tooltip>
          </DescribeItemStyleWrapper>
        )}
        {context?.session?.odcDatabase?.dataSource?.name && (
          <DescribeItemStyleWrapper>
            <span className="label">
              {formatMessage({
                id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.CD007EC1' /*数据源：*/,
                defaultMessage: '数据源：'
              })}
            </span>
            <Tooltip
              title={context?.session?.odcDatabase?.dataSource?.name}
              placement="bottom"
              overlayClassName="sessionSelectTooltip"
            >
              <EllipsisStyleWrapper>
                {context?.session?.odcDatabase?.dataSource?.name}
              </EllipsisStyleWrapper>
            </Tooltip>
          </DescribeItemStyleWrapper>
        )}
      </DatasourceAndProjectItemStyleWrapper>
    ) : null;

    if (readonly) {
      return (
        <>
          {renderEnv()}
          <SessionInfoStyleWrapper>
            {databaseItem}
            {supportLocation && <>{aimItem}</>}
            <DatasourceAndProjectItemBoxStyleWrapper>
              {datasourceAndProjectItem}
            </DatasourceAndProjectItemBoxStyleWrapper>
          </SessionInfoStyleWrapper>
        </>
      );
    }
    return (
      <ContentStyleWrapper>
        {renderEnv()}
        <SessionDropdown
          filters={{ feature, isIncludeLogicalDb }}
          groupMode={resourceTreeContext.groupMode}
        >
          <div>{databaseItem}</div>
        </SessionDropdown>
        <div>{aimItem}</div>
        <DatasourceAndProjectItemBoxStyleWrapper>
          {datasourceAndProjectItem}
        </DatasourceAndProjectItemBoxStyleWrapper>
      </ContentStyleWrapper>
    );
  }

  return (
    <>
      {!context?.databaseId && !context?.datasourceId ? (
        <LineStyleWrapper
          style={{
            background:
              EnvColorMap[context?.session?.odcDatabase?.environment?.style]
                ?.lineBackground
          }}
        >
          <SessionDropdown groupMode={resourceTreeContext.groupMode}>
            <a>
              {
                formatMessage({
                  id: 'odc.SessionContextWrap.SessionSelect.SelectADatabase',
                  defaultMessage: '请选择数据库'
                }) /*请选择数据库*/
              }
            </a>
          </SessionDropdown>
        </LineStyleWrapper>
      ) : (
        <LineStyleWrapper
          style={{
            background:
              EnvColorMap[context?.session?.odcDatabase?.environment?.style]
                ?.lineBackground
          }}
        >
          {context?.session ? (
            renderSessionInfo()
          ) : (
            <Spin
              style={{ marginLeft: 20 }}
              spinning={true}
              indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />}
            />
          )}
        </LineStyleWrapper>
      )}
    </>
  );
};

export default inject('pageStore')(observer(SessionSelect));
