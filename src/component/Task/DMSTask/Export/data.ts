import { ListAllDataExportWorkflowsFilterByStatusEnum } from '@/external_api/base/DataExportWorkflows/index.enum';
import { formatMessage } from '@/util/intl';

export const DataExportStatusDictionary: Record<
  keyof typeof ListAllDataExportWorkflowsFilterByStatusEnum,
  string
> = {
  [ListAllDataExportWorkflowsFilterByStatusEnum.wait_for_approve]:
    formatMessage({
      id: 'dmsDataExport.status.wait_for_audit',
      defaultMessage: '待审批'
    }),
  [ListAllDataExportWorkflowsFilterByStatusEnum.finish]: formatMessage({
    id: 'dmsDataExport.status.finished',
    defaultMessage: '已完成'
  }),
  [ListAllDataExportWorkflowsFilterByStatusEnum.cancel]: formatMessage({
    id: 'dmsDataExport.status.canceled',
    defaultMessage: '已取消'
  }),
  [ListAllDataExportWorkflowsFilterByStatusEnum.wait_for_export]: formatMessage(
    {
      id: 'dmsDataExport.status.wait_for_export',
      defaultMessage: '待导出'
    }
  ),
  [ListAllDataExportWorkflowsFilterByStatusEnum.rejected]: formatMessage({
    id: 'dmsDataExport.status.rejected',
    defaultMessage: '已驳回'
  }),
  [ListAllDataExportWorkflowsFilterByStatusEnum.exporting]: formatMessage({
    id: 'dmsDataExport.status.exporting',
    defaultMessage: '正在导出'
  }),
  [ListAllDataExportWorkflowsFilterByStatusEnum.failed]: formatMessage({
    id: 'dmsDataExport.status.export_failed',
    defaultMessage: '导出失败'
  })
};
