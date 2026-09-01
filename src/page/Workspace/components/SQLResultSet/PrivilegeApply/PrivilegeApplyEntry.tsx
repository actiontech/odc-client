import React from 'react';
import { Alert } from 'antd';
import { formatMessage } from '@/util/intl';
import { BasicButton } from '@actiontech/dms-kit';
import type { IPrivilegeDeniedContext } from '@/d.ts';
import { openDMSPrivilegeApply } from '@/util/dms/privilegeApply';

interface IProps {
  context?: IPrivilegeDeniedContext;
  /** 形如 project:datasource 的连接名，用于拆出 DMS project_name */
  dataSourceName?: string;
}

/**
 * 库账号缺权拦截出口：独立于 DBPermissionTable（平台表级权限）。
 * 仅跳转 DMS 提权申请页，禁止打开工作台内抽屉/自建表单。
 */
const PrivilegeApplyEntry: React.FC<IProps> = ({ context, dataSourceName }) => {
  if (!context?.privilege_denied) {
    return null;
  }

  const projectNameHint = dataSourceName?.includes(':')
    ? dataSourceName.split(':')[0]
    : undefined;

  return (
    <Alert
      type="warning"
      showIcon
      style={{ margin: '8px 12px' }}
      message={formatMessage({
        id: 'odc.components.PrivilegeApply.AccountPrivilegeDenied',
        defaultMessage: '当前数据库账号权限不足'
      })}
      description={formatMessage({
        id: 'odc.components.PrivilegeApply.AccountPrivilegeDeniedHint',
        defaultMessage:
          '可跳转 DMS 申请提权，审批通过后将换发账号；提交前仍使用当前账号。'
      })}
      action={
        <BasicButton
          type="primary"
          size="small"
          onClick={() => openDMSPrivilegeApply(context, projectNameHint)}
        >
          {formatMessage({
            id: 'odc.components.PrivilegeApply.ApplyPrivilege',
            defaultMessage: '申请权限'
          })}
        </BasicButton>
      }
    />
  );
};

export default PrivilegeApplyEntry;
