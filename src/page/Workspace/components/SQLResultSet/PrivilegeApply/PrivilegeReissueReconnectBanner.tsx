import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'antd';
import { formatMessage } from '@/util/intl';
import { PrivilegeApplyService } from '@/external_api/base';
import { PRIVILEGE_REISSUE_TRACKING_KEY } from '@/external_api/base/PrivilegeApply/index.type';
import type { IPrivilegeDeniedContext } from '@/d.ts';

interface TrackingItem {
  workflowId: string;
  projectUid: string;
  dbServiceUid: string;
  sourceAccountName?: string;
}

interface IProps {
  context?: IPrivilegeDeniedContext;
}

function readTracking(): TrackingItem[] {
  try {
    const raw = sessionStorage.getItem(PRIVILEGE_REISSUE_TRACKING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeTracking(items: TrackingItem[]) {
  sessionStorage.setItem(
    PRIVILEGE_REISSUE_TRACKING_KEY,
    JSON.stringify(items)
  );
}

const PrivilegeReissueReconnectBanner: React.FC<IProps> = ({ context }) => {
  const [bannerText, setBannerText] = useState<string | null>(null);

  const checkReissueStatus = useCallback(async () => {
    const tracking = readTracking();
    if (!tracking.length) {
      setBannerText(null);
      return;
    }

    for (const item of tracking) {
      try {
        const res = await PrivilegeApplyService.GetPrivilegeApplyWorkflow({
          project_uid: item.projectUid,
          workflow_id: item.workflowId
        });
        const detail = res?.data?.data;
        if (
          detail?.approval_status === 'approved' &&
          detail?.reissue_status === 'succeeded' &&
          detail?.target_db_account_name
        ) {
          if (
            !context?.db_service_uid ||
            !item.dbServiceUid ||
            context.db_service_uid === item.dbServiceUid
          ) {
            setBannerText(
              formatMessage(
                {
                  id: 'odc.components.PrivilegeApply.ReconnectBanner',
                  defaultMessage:
                    '授权账号已更新为 {account}，请断开并重新连接数据源后再执行'
                },
                { account: detail.target_db_account_name }
              )
            );
            return;
          }
        }
      } catch {
        // ignore polling errors
      }
    }
    setBannerText(null);
  }, [context?.db_service_uid]);

  useEffect(() => {
    checkReissueStatus();
    const timer = window.setInterval(checkReissueStatus, 15000);
    const onFocus = () => checkReissueStatus();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkReissueStatus]);

  const handleDismiss = () => {
    writeTracking([]);
    setBannerText(null);
  };

  if (!bannerText) {
    return null;
  }

  return (
    <Alert
      type="warning"
      showIcon
      closable
      banner
      message={bannerText}
      onClose={handleDismiss}
      style={{ marginBottom: 8 }}
    />
  );
};

export function trackPrivilegeApplyWorkflow(params: {
  workflowId: string;
  projectUid: string;
  dbServiceUid: string;
  sourceAccountName?: string;
}) {
  const next: TrackingItem[] = [
    {
      workflowId: params.workflowId,
      projectUid: params.projectUid,
      dbServiceUid: params.dbServiceUid,
      sourceAccountName: params.sourceAccountName
    }
  ];
  writeTracking(next);
}

export default PrivilegeReissueReconnectBanner;
