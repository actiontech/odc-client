import { ActiontechTableActionsConfig } from '@actiontech/dms-kit';
import { IWorkflowDetailResV1 } from '@/external_api/sqle/common.type';
import { formatMessage } from '@/util/intl';

export const executeWorkflowAction: (
  getDetailUrl: (record: IWorkflowDetailResV1) => URL
) => ActiontechTableActionsConfig<IWorkflowDetailResV1> = (getDetailUrl) => {
  return {
    buttons: [
      {
        text: formatMessage({
          id: 'dmsDataExport.action.openDetailPage',
          defaultMessage: '打开详情页'
        }),
        key: 'execute',
        buttonProps: (record) => {
          return {
            onClick: () => {
              window.open(getDetailUrl(record));
            }
          };
        }
      }
    ]
  };
};
