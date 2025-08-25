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
import { Typography } from 'antd';
import Icon from '@ant-design/icons';
import { ReactComponent as ConsoleSQLSvg } from '@/svgr/Console-SQL.svg';
import { ReactComponent as TaskSvg } from '@/svgr/icon_task.svg';
import ActivityBarContext from '@/page/Workspace/context/ActivityBarContext';
import { openNewDefaultPLPage, openNewSQLPage } from '@/store/helper/page';
import { ReactComponent as ConsolePLSvg } from '@/svgr/Console-PL.svg';
import tracert from '@/util/tracert';
import { useContext, useEffect } from 'react';
import { DefaultPageItemStyleWrapper, DefaultPageStyleWrapper } from './style';
import { ActivityBarItemType } from '@/page/Workspace/ActivityBar/type';

export default function DefaultPage() {
  useEffect(() => {
    tracert.expo('a3112.b41896.c330987');
  }, []);
  const context = useContext(ActivityBarContext);
  return (
    <DefaultPageStyleWrapper>
      <div className="content">
        <Typography.Title level={4}>
          {
            formatMessage({
              id: 'odc.component.WindowManager.DefaultPage.QuickStart',
              defaultMessage: '快速开始'
            }) /*快速开始*/
          }
        </Typography.Title>
        <DefaultPageItemStyleWrapper
          onClick={() => {
            openNewSQLPage(null);
            tracert.click('a3112.b41896.c330987.d367617');
          }}
        >
          <div className="icon">
            <Icon component={ConsoleSQLSvg} />
          </div>
          <div className="label">
            {
              formatMessage({
                id: 'odc.component.WindowManager.DefaultPage.OpenTheSqlWindow',
                defaultMessage: '打开 SQL 窗口'
              }) /*打开 SQL 窗口*/
            }
          </div>
        </DefaultPageItemStyleWrapper>
        <DefaultPageItemStyleWrapper
          onClick={() => {
            tracert.click('a3112.b41896.c330987.d367618');
            openNewDefaultPLPage(null, null, null);
          }}
        >
          <div className="icon">
            <Icon component={ConsolePLSvg} />
          </div>
          <div className="label">
            {
              formatMessage({
                id: 'odc.component.WindowManager.DefaultPage.OpenTheAnonymousBlockWindow',
                defaultMessage: '打开匿名块窗口'
              }) /*打开匿名块窗口*/
            }
          </div>
        </DefaultPageItemStyleWrapper>
        <DefaultPageItemStyleWrapper
          onClick={() => {
            tracert.click('a3112.b41896.c330987.d367619');
            context?.setActiveKey(ActivityBarItemType.Task);
          }}
        >
          <div className="icon">
            <Icon component={TaskSvg} />
          </div>
          <div className="label">
            {
              formatMessage({
                id: 'odc.component.WindowManager.DefaultPage.ViewTickets',
                defaultMessage: '查看工单'
              }) /*查看工单*/
            }
          </div>
        </DefaultPageItemStyleWrapper>
      </div>
    </DefaultPageStyleWrapper>
  );
}
