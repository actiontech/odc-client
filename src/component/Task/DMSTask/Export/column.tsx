import {
  ActiontechTableColumn,
  BasicTypographyEllipsis
} from '@actiontech/dms-kit';
import { formatTime } from '@actiontech/dms-kit';
import { CustomAvatar } from '@actiontech/dms-kit';
import { TableColumnWithIconStyleWrapper } from '@actiontech/dms-kit';
import { BriefcaseFilled } from '@actiontech/icons';
import { IListDataExportWorkflow } from '@/external_api/base/common.type';
import { formatMessage } from '@/util/intl';
import WorkflowStatus from './components/WorkflowStatus';

export const ExportWorkflowListColumn: () => ActiontechTableColumn<IListDataExportWorkflow> =
  () => {
    return [
      {
        dataIndex: 'workflow_uid',
        title: () =>
          formatMessage({
            id: 'dmsDataExport.list.column.id',
            defaultMessage: '工单号'
          }),
        className: 'ellipsis-column-width',
        render: (id) => {
          return (
            <TableColumnWithIconStyleWrapper>
              <BriefcaseFilled width={14} height={14} />
              <span>{id}</span>
            </TableColumnWithIconStyleWrapper>
          );
        },
        fixed: 'left'
      },
      {
        dataIndex: 'workflow_name',
        title: () =>
          formatMessage({
            id: 'dmsDataExport.list.column.name',
            defaultMessage: '工单名称'
          }),
        className: 'ellipsis-column-width',
        render: (name) => {
          return name ? (
            <BasicTypographyEllipsis copyable={false} textCont={name} />
          ) : (
            '-'
          );
        }
      },
      {
        dataIndex: 'desc',
        title: () =>
          formatMessage({
            id: 'dmsDataExport.list.column.desc',
            defaultMessage: '描述'
          }),
        className: 'ellipsis-column-width-large',
        render: (desc) =>
          desc ? <BasicTypographyEllipsis textCont={desc} /> : '-'
      },
      {
        dataIndex: 'created_at',
        title: () =>
          formatMessage({
            id: 'dmsDataExport.list.column.createTime',
            defaultMessage: '创建时间'
          }),
        render: (time) => {
          return formatTime(time, '-');
        },
        filterCustomType: 'date-range',
        filterKey: ['filter_create_time_from', 'filter_create_time_to']
      },
      {
        dataIndex: 'creater',
        title: () =>
          formatMessage({
            id: 'dmsDataExport.list.column.createUser',
            defaultMessage: '创建人'
          }),
        render: (user) => {
          return user?.name ?? '-';
        },
        filterCustomType: 'select',
        filterKey: 'filter_by_create_user_uid'
      },
      {
        dataIndex: 'status',
        title: () =>
          formatMessage({
            id: 'dmsDataExport.list.column.status',
            defaultMessage: '状态'
          }),
        render: (status) => {
          return <WorkflowStatus status={status} />;
        }
      },
      {
        dataIndex: 'current_step_assignee_user_list',
        title: () =>
          formatMessage({
            id: 'dmsDataExport.list.column.assignee',
            defaultMessage: '待操作人'
          }),
        filterCustomType: 'select',
        filterKey: 'filter_current_step_assignee_user_uid',
        render: (list) => {
          if (!list || list.length === 0) {
            return '-';
          }
          return list.map((v) => {
            return <CustomAvatar key={v.uid} name={v.name} />;
          });
        }
      }
    ];
  };
