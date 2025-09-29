import { ListDataExportWorkflowsFilterByStatusEnum } from '@/external_api/base/DataExportWorkflows/index.enum';
import { formatMessage } from '@/util/intl';

export const DataExportStatusDictionary: Record<
  keyof typeof ListDataExportWorkflowsFilterByStatusEnum,
  string
> = {
  [ListDataExportWorkflowsFilterByStatusEnum.wait_for_approve]: formatMessage({
    id: 'dmsDataExport.status.wait_for_audit',
    defaultMessage: '待审批'
  }),
  [ListDataExportWorkflowsFilterByStatusEnum.finish]: formatMessage({
    id: 'dmsDataExport.status.finished',
    defaultMessage: '已完成'
  }),
  [ListDataExportWorkflowsFilterByStatusEnum.cancel]: formatMessage({
    id: 'dmsDataExport.status.canceled',
    defaultMessage: '已取消'
  }),
  [ListDataExportWorkflowsFilterByStatusEnum.wait_for_export]: formatMessage({
    id: 'dmsDataExport.status.wait_for_export',
    defaultMessage: '待导出'
  }),
  [ListDataExportWorkflowsFilterByStatusEnum.rejected]: formatMessage({
    id: 'dmsDataExport.status.rejected',
    defaultMessage: '已驳回'
  }),
  [ListDataExportWorkflowsFilterByStatusEnum.exporting]: formatMessage({
    id: 'dmsDataExport.status.exporting',
    defaultMessage: '正在导出'
  }),
  [ListDataExportWorkflowsFilterByStatusEnum.failed]: formatMessage({
    id: 'dmsDataExport.status.export_failed',
    defaultMessage: '导出失败'
  })
};
