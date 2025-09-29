import {
  CustomAvatar,
  ActiontechTableColumn,
  TableColumnWithIconStyleWrapper,
  BasicTypographyEllipsis,
  formatTime,
  BasicToolTip,
  BasicTag
} from '@actiontech/dms-kit';
import { IWorkflowDetailResV1 } from '@/external_api/sqle/common.type';
import { BriefcaseFilled } from '@actiontech/icons';
import { WorkflowNameStyleWrapper } from './style';
import WorkflowStatus from './WorkflowStatus';
import { formatMessage } from '@/util/intl';
import { Space, Typography } from 'antd';
import { ProjectV2ProjectPriorityEnum } from '../../../../external_api/base/common.enum';

export const SqlExecWorkflowListColumn: () => ActiontechTableColumn<IWorkflowDetailResV1> =
  () => {
    return [
      {
        dataIndex: 'workflow_id',
        title: () =>
          formatMessage({
            id: 'execWorkflow.list.id',
            defaultMessage: '工单号'
          }),
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
        className: 'workflow-list-table-workflow-name-column',
        title: () =>
          formatMessage({
            id: 'execWorkflow.list.name',
            defaultMessage: '工单名称'
          }),
        render: (name) => (
          <WorkflowNameStyleWrapper ellipsis={true}>
            {name}
          </WorkflowNameStyleWrapper>
        ),
        fixed: 'left'
      },
      {
        dataIndex: 'desc',
        title: () =>
          formatMessage({
            id: 'execWorkflow.list.desc',
            defaultMessage: '描述'
          }),
        className: 'workflow-list-table-desc-column',
        render: (desc) =>
          desc ? <BasicTypographyEllipsis textCont={desc} /> : '-'
      },
      {
        dataIndex: 'create_time',
        title: () =>
          formatMessage({
            id: 'execWorkflow.list.createTime',
            defaultMessage: '创建时间'
          }),
        render: (time) => {
          return formatTime(time, '-');
        },
        filterCustomType: 'date-range',
        filterKey: ['filter_create_time_from', 'filter_create_time_to']
      },
      {
        dataIndex: 'status',
        title: () =>
          formatMessage({
            id: 'execWorkflow.list.status',
            defaultMessage: '状态'
          }),
        render: (status) => {
          if (!status) {
            return '-';
          }
          return <WorkflowStatus status={status} />;
        }
      },
      {
        dataIndex: 'current_step_assignee_user_name_list',
        title: () =>
          formatMessage({
            id: 'execWorkflow.list.assignee',
            defaultMessage: '待操作人'
          }),
        filterCustomType: 'select',
        filterKey: 'filter_current_step_assignee_user_id',
        render: (list) => {
          if (!list) {
            return '-';
          }
          return list?.map((v) => {
            return <CustomAvatar key={v} name={v} />;
          });
        }
      },
      {
        dataIndex: 'instance_info',
        title: formatMessage({
          id: 'execWorkflow.list.instance',
          defaultMessage: '所属数据源'
        }),
        render: (instances) => {
          if (!instances || !instances.length) {
            return '-';
          }
          return (
            <BasicToolTip
              title={
                instances.length > 1 ? (
                  <Space wrap>
                    {instances.map((v) => (
                      <BasicTag key={v.instance_id} color="blue" size="small">
                        {v.instance_name}
                      </BasicTag>
                    ))}
                  </Space>
                ) : null
              }
            >
              <Space>
                <BasicTag color="blue" size="small">
                  {instances[0].instance_name}
                </BasicTag>
                {instances.length > 1 ? '...' : null}
              </Space>
            </BasicToolTip>
          );
        }
      },
      {
        dataIndex: 'project_name',
        title: formatMessage({
          id: 'execWorkflow.list.project',
          defaultMessage: '所属项目'
        }),
        render: (project_name) => {
          return project_name;
        }
      }
    ];
  };
