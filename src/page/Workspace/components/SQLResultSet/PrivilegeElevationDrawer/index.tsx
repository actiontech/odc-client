import { formatMessage } from '@/util/intl';
import { IUnauthorizedDBResources } from '@/d.ts/table';
import SessionStore from '@/store/sessionManager/session';
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Space,
  Tag,
  Typography,
  message
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  createODCPrivilegeElevationApplication,
  getODCPrivilegeElevationApplication,
  ODCPrivilegeElevationApplication,
  ODCPrivilegeElevationStatus
} from '@/common/network/odcPrivilegeElevation';
import { buildRequestedPermissions, digestSql } from './utils';

const { Text, Paragraph } = Typography;

const terminalStatuses: ODCPrivilegeElevationStatus[] = [
  'REJECTED',
  'EXPIRED',
  'ELEVATED',
  'PROVISION_FAILED'
];

const statusColorMap: Record<string, string> = {
  SUBMITTED: 'processing',
  APPROVED: 'blue',
  PROVISIONING: 'processing',
  ELEVATED: 'success',
  REJECTED: 'error',
  EXPIRED: 'warning',
  PROVISION_FAILED: 'error'
};

const statusTextMap: Record<string, string> = {
  SUBMITTED: formatMessage({
    id: 'odc.privilegeElevation.status.submitted',
    defaultMessage: '已提交'
  }),
  APPROVED: formatMessage({
    id: 'odc.privilegeElevation.status.approved',
    defaultMessage: '已审批'
  }),
  PROVISIONING: formatMessage({
    id: 'odc.privilegeElevation.status.provisioning',
    defaultMessage: '换发中'
  }),
  ELEVATED: formatMessage({
    id: 'odc.privilegeElevation.status.elevated',
    defaultMessage: '已生效'
  }),
  REJECTED: formatMessage({
    id: 'odc.privilegeElevation.status.rejected',
    defaultMessage: '已驳回'
  }),
  EXPIRED: formatMessage({
    id: 'odc.privilegeElevation.status.expired',
    defaultMessage: '已过期'
  }),
  PROVISION_FAILED: formatMessage({
    id: 'odc.privilegeElevation.status.provisionFailed',
    defaultMessage: '换发失败'
  })
};

const readDatasourceUID = (session?: SessionStore) => {
  const connection = session?.connection as any;
  return String(
    connection?.dataSourceUid ||
      connection?.db_service_uid ||
      connection?.dbServiceUid ||
      connection?.uid ||
      connection?.sid ||
      connection?.id ||
      ''
  );
};

const readCurrentAccount = (session?: SessionStore) => {
  const connection = session?.connection as any;
  const uid =
    connection?.currentAccountUid ||
    connection?.dbAccountUid ||
    connection?.accountUid ||
    connection?.authorizedAccountUid ||
    connection?.account?.uid ||
    connection?.sid ||
    connection?.id;
  const name =
    connection?.currentAccountNameMasked ||
    connection?.accountNameMasked ||
    connection?.dbAccountNameMasked ||
    connection?.username ||
    connection?.account?.name;
  return {
    uid: uid ? String(uid) : '',
    name: name ? String(name) : ''
  };
};

const PrivilegeElevationDrawer: React.FC<{
  open: boolean;
  session?: SessionStore;
  sql?: string;
  unauthorizedResources?: IUnauthorizedDBResources[];
  onClose: () => void;
}> = ({ open, session, sql, unauthorizedResources, onClose }) => {
  const [form] = Form.useForm<{ reason: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] =
    useState<ODCPrivilegeElevationApplication>();
  const [approvers, setApprovers] = useState<string[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const datasourceUID = readDatasourceUID(session);
  const currentAccount = readCurrentAccount(session);
  const permissions = useMemo(
    () => buildRequestedPermissions(unauthorizedResources),
    [unauthorizedResources]
  );
  const errorMessage = formatMessage({
    id: 'odc.privilegeElevation.defaultDbError',
    defaultMessage: 'SQL 执行返回权限不足，请申请目标权限后重试。'
  });

  useEffect(() => {
    if (
      !open ||
      !application?.application_uid ||
      terminalStatuses.includes(application.status)
    ) {
      return;
    }
    const timer = window.setInterval(async () => {
      const result = await getODCPrivilegeElevationApplication(
        application.application_uid
      );
      const detail = result?.data?.data;
      if (detail?.application_uid) {
        setApplication(detail);
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [application?.application_uid, application?.status, open]);

  const submit = async () => {
    const values = await form.validateFields();
    if (!datasourceUID || !currentAccount.uid) {
      messageApi.error(
        formatMessage({
          id: 'odc.privilegeElevation.missingContext',
          defaultMessage:
            '当前工作台缺少数据源或授权账号上下文，请重新进入工作台。'
        })
      );
      return;
    }
    setSubmitting(true);
    try {
      const response = await createODCPrivilegeElevationApplication({
        datasource_uid: datasourceUID,
        odc_session_id: session?.sessionId,
        current_account_uid: currentAccount.uid,
        current_account_name_masked: currentAccount.name,
        sql: sql || '',
        sql_digest: digestSql(sql),
        db_error_code: 'DB_PERMISSION_DENIED',
        db_error_message: errorMessage,
        requested_permissions: permissions,
        reason: values.reason,
        selected_approver_uids: []
      });
      const data = response?.data?.data;
      if (data?.application_uid) {
        setApplication({
          application_uid: data.application_uid,
          status: data.status,
          expire_at: data.expire_at
        });
        setApprovers(
          (data.approvers || []).map((item) => item.name || item.uid)
        );
        messageApi.success(
          formatMessage({
            id: 'odc.privilegeElevation.submitSuccess',
            defaultMessage: '提权申请已提交'
          })
        );
        return;
      }
      const errorCode =
        (response?.data as any)?.errCode || (response?.data as any)?.code;
      const errorMsg =
        (response?.data as any)?.errMsg || (response?.data as any)?.message;
      if (errorCode === 'NO_APPROVER') {
        messageApi.error(
          formatMessage({
            id: 'odc.privilegeElevation.noApprover',
            defaultMessage: '未匹配到审批人，请配置审批人或联系项目管理员。'
          })
        );
      } else if (errorCode === 'ACTIVE_APPLICATION_EXISTS') {
        messageApi.warning(
          formatMessage({
            id: 'odc.privilegeElevation.activeExists',
            defaultMessage: '已存在进行中的提权申请，请查看已有申请状态。'
          })
        );
      } else if (errorCode === 'NO_DATASOURCE_ACCESS') {
        messageApi.error(
          formatMessage({
            id: 'odc.privilegeElevation.noDatasourceAccess',
            defaultMessage: '当前用户无该数据源可见或授权权限。'
          })
        );
      } else {
        messageApi.error(
          errorMsg ||
            formatMessage({
              id: 'odc.privilegeElevation.submitFailed',
              defaultMessage: '提交提权申请失败'
            })
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const status = application?.status;

  return (
    <Drawer
      zIndex={1004}
      width={560}
      destroyOnClose
      open={open}
      title={formatMessage({
        id: 'odc.privilegeElevation.title',
        defaultMessage: '申请权限'
      })}
      onClose={onClose}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>
            {formatMessage({ id: 'common.close', defaultMessage: '关闭' })}
          </Button>
          {!application && (
            <Button type="primary" loading={submitting} onClick={submit}>
              {formatMessage({
                id: 'odc.privilegeElevation.submit',
                defaultMessage: '提交申请'
              })}
            </Button>
          )}
        </Space>
      }
    >
      {contextHolder}
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.privilegeElevation.datasource',
              defaultMessage: '数据源'
            })}
          >
            {(session?.connection as any)?.name || datasourceUID || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.privilegeElevation.account',
              defaultMessage: '当前账号'
            })}
          >
            {currentAccount.name || currentAccount.uid || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.privilegeElevation.sql',
              defaultMessage: '原始 SQL'
            })}
          >
            <Paragraph
              copyable={{ text: sql }}
              ellipsis={{ rows: 3, expandable: true }}
            >
              {sql || '-'}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.privilegeElevation.error',
              defaultMessage: '错误信息'
            })}
          >
            {errorMessage}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.privilegeElevation.permissions',
              defaultMessage: '目标权限'
            })}
          >
            <Space wrap>
              {permissions.map((item, index) => (
                <Tag
                  key={`${item.schema}-${item.object}-${item.privilege}-${index}`}
                >
                  {[item.schema, item.object, item.privilege]
                    .filter(Boolean)
                    .join('.') || 'UNKNOWN'}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>

        {!application && (
          <Form form={form} layout="vertical">
            <Form.Item
              name="reason"
              label={formatMessage({
                id: 'odc.privilegeElevation.reason',
                defaultMessage: '申请理由'
              })}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.privilegeElevation.reasonRequired',
                    defaultMessage: '请输入申请理由'
                  })
                }
              ]}
            >
              <Input.TextArea rows={4} maxLength={500} showCount />
            </Form.Item>
          </Form>
        )}

        {application && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.privilegeElevation.applicationUid',
                defaultMessage: '申请号'
              })}
            >
              {application.application_uid}
            </Descriptions.Item>
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.privilegeElevation.status',
                defaultMessage: '状态'
              })}
            >
              <Tag color={statusColorMap[status || '']}>
                {statusTextMap[status || ''] || status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.privilegeElevation.approvers',
                defaultMessage: '审批人'
              })}
            >
              {approvers.length ? approvers.join('、') : '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.privilegeElevation.expireAt',
                defaultMessage: '过期时间'
              })}
            >
              {application.expire_at || '-'}
            </Descriptions.Item>
            {(status === 'REJECTED' || application.reject_reason) && (
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.privilegeElevation.rejectReason',
                  defaultMessage: '驳回原因'
                })}
              >
                {application.reject_reason || '-'}
              </Descriptions.Item>
            )}
            {(status === 'PROVISION_FAILED' || application.failure_reason) && (
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.privilegeElevation.failureReason',
                  defaultMessage: '失败原因'
                })}
              >
                {application.failure_reason || '-'}
              </Descriptions.Item>
            )}
            {status === 'ELEVATED' && (
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.privilegeElevation.nextStep',
                  defaultMessage: '下一步'
                })}
              >
                <Text type="success">
                  {formatMessage({
                    id: 'odc.privilegeElevation.elevatedGuide',
                    defaultMessage:
                      '权限已生效，请刷新连接或重新进入工作台后继续执行原 SQL。'
                  })}
                </Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Space>
    </Drawer>
  );
};

export default PrivilegeElevationDrawer;
