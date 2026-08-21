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
import { Alert } from 'antd';
import React from 'react';

/**
 * 本窗口超级管理员旁路开启后，结果区顶部常驻警告条（关闭即卸载）。
 */
const SuperAdminBypassBanner: React.FC = () => {
  return (
    <Alert
      type="warning"
      showIcon
      banner
      data-testid="odc-super-admin-bypass-banner"
      message={formatMessage({
        id: 'odc.SQLResultSet.SuperAdminBypassBanner',
        defaultMessage:
          '超级管理员模式已开启：本窗口执行将旁路审核、运维时间与工单。关闭开关即恢复现网拦截。'
      })}
      style={{ marginBottom: 0 }}
    />
  );
};

export default SuperAdminBypassBanner;
