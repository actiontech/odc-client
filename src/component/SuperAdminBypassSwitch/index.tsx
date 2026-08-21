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
import { Modal, Space, Switch } from 'antd';
import React from 'react';

interface ISuperAdminBypassHost {
  state?: { superAdminBypassEnabled?: boolean };
  setSuperAdminBypassEnabled?: (enabled: boolean) => void;
  props?: { pageKey?: string };
}

interface IProps {
  ctx?: ISuperAdminBypassHost;
}

/**
 * 不使用 mobx observer：旁路开关挂在 SQLPage 的 React state 上，
 * ctx 引用不变时 observer 会跳过重渲染，导致 Switch 视觉与 banner 脱节。
 * 旁路态仅本页实例；禁止写全局 store / localStorage / sessionStorage（AC-005/006）。
 */
const SuperAdminBypassSwitch: React.FC<IProps> = function (props) {
  const { ctx } = props;
  const enabled = !!ctx?.state?.superAdminBypassEnabled;
  const pageKey = ctx?.props?.pageKey || '';

  const handleChange = (checked: boolean) => {
    if (!ctx?.setSuperAdminBypassEnabled) {
      return;
    }
    if (!checked) {
      ctx.setSuperAdminBypassEnabled(false);
      return;
    }
    Modal.confirm({
      title: formatMessage({
        id: 'odc.EditorToolBar.actions.sql.SuperAdminConfirmTitle',
        defaultMessage: '开启超级管理员模式'
      }),
      content: formatMessage({
        id: 'odc.EditorToolBar.actions.sql.SuperAdminConfirmContent',
        defaultMessage:
          '开启后，本窗口将旁路工作台查询审核、运维时间与非 DQL 工单，直连执行全部 SQL（含 DML/DDL）。仅对当前 SQL 窗口生效。是否确认开启？'
      }),
      okText: formatMessage({
        id: 'odc.EditorToolBar.actions.sql.SuperAdminConfirmOk',
        defaultMessage: '确认开启'
      }),
      cancelText: formatMessage({
        id: 'odc.EditorToolBar.actions.sql.SuperAdminConfirmCancel',
        defaultMessage: '取消'
      }),
      onOk: () => {
        ctx.setSuperAdminBypassEnabled(true);
      }
    });
  };

  return (
    <Space
      size={6}
      align="center"
      style={{ marginLeft: 4 }}
      data-testid="odc-super-admin-bypass-wrap"
      data-page-key={pageKey}
    >
      <Switch
        size="small"
        checked={enabled}
        onChange={handleChange}
        data-testid="odc-super-admin-bypass-switch"
        data-page-key={pageKey}
      />
      <span>
        {formatMessage({
          id: 'odc.EditorToolBar.actions.sql.SuperAdmin',
          defaultMessage: '超级管理员'
        })}
      </span>
    </Space>
  );
};

export default SuperAdminBypassSwitch;
