import { ActiontechTableActionsConfig } from '@actiontech/dms-kit';
import { IListDataExportWorkflow } from '@/external_api/base/common.type';
import { formatMessage } from '@/util/intl';

export const exportDataWorkflowAction: (
  getDetailUrl: (record: IListDataExportWorkflow) => URL
) => ActiontechTableActionsConfig<IListDataExportWorkflow> = (getDetailUrl) => {
  return {
    buttons: [
      {
        text: formatMessage({
          id: 'dmsDataExport.action.openDetailPage',
          defaultMessage: '打开详情页'
        }),
        key: 'openDetailPage',
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
