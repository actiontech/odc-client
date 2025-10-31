import {
  ActiontechTable,
  useTableRequestError,
  useTableRequestParams,
  ActiontechTableWrapper,
  TableToolbar,
  PageHeader,
  CustomSegmentedFilter,
  ROUTE_PATHS,
  paramsSerializer
} from '@actiontech/dms-kit';
import { SqlExecWorkflowListStyleWrapper } from './style';
import { useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import { SqlExecWorkflowListColumn } from './column';
import { getGlobalWorkflowsV1FilterStatusListEnum } from '@/external_api/sqle/workflow/index.enum';
import { IWorkflowDetailResV1 } from '@/external_api/sqle/common.type';
import { IGetGlobalWorkflowsV1Params } from '@/external_api/sqle/workflow/index.type';
import { WorkflowService } from '@/external_api/sqle';
import { formatMessage } from '@/util/intl';
import { execWorkflowStatusDictionary } from './data';
import { SessionService } from '@/external_api/base';
import { executeWorkflowAction } from './action';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';

const SqlExecWorkflowList: React.FC<{ modalStore?: ModalStore }> = ({
  modalStore
}) => {
  const [filterStatus, setFilterStatus] =
    useState<getGlobalWorkflowsV1FilterStatusListEnum>();
  const { tableChange, pagination } =
    useTableRequestParams<IWorkflowDetailResV1>();

  const { data: userUID } = useRequest(() =>
    SessionService.GetUserBySession({}).then((res) => res.data.data.user_uid)
  );

  const {
    data: workflowList,
    loading,
    refresh
  } = useRequest(
    () => {
      const params: IGetGlobalWorkflowsV1Params = {
        ...pagination,
        filter_status_list: filterStatus ? [filterStatus] : undefined,
        filter_create_user_id: userUID
      };
      return handleTableRequestError(
        WorkflowService.getGlobalWorkflowsV1(params, {
          paramsSerializer
        })
      );
    },
    {
      refreshDeps: [pagination, filterStatus],
      ready: !!userUID
    }
  );
  const columns = useMemo(() => SqlExecWorkflowListColumn(), []);

  const { requestErrorMessage, handleTableRequestError } =
    useTableRequestError();

  const handleRowClick = (record: IWorkflowDetailResV1) => {
    modalStore.changeDMSIframeModalVisible(true, {
      title: formatMessage(
        {
          id: 'execWorkflow.detailModal.title',
          defaultMessage: `工单详情 - ${record.workflow_name || ''}`
        },
        {
          workflowName: record.workflow_name || ''
        }
      ),
      iframeTitle: formatMessage({
        id: 'execWorkflow.iframe.title',
        defaultMessage: '工单详情'
      }),
      url: getDetailUrl(record)
    });
  };

  // 构建详情页面 URL（用户可以后续调整）
  const getDetailUrl = (record: IWorkflowDetailResV1): URL => {
    return new URL(
      `${ROUTE_PATHS.SQLE.SQL_EXEC_WORKFLOW.detail.prefix.replace(
        ':projectID',
        record.project_uid
      )}/${record.workflow_id}`,
      window.location.origin
    );
  };

  const tableAction = executeWorkflowAction(getDetailUrl);

  return (
    <SqlExecWorkflowListStyleWrapper>
      <PageHeader
        title={formatMessage({
          id: 'execWorkflow.list.pageTitle',
          defaultMessage: 'SQL工单'
        })}
      />
      <ActiontechTableWrapper loading={loading}>
        <TableToolbar
          style={{ justifyContent: 'space-between', width: '100%' }}
          refreshButton={{
            refresh,
            disabled: loading
          }}
        >
          <CustomSegmentedFilter
            value={filterStatus}
            onChange={(value) => {
              setFilterStatus(
                value as getGlobalWorkflowsV1FilterStatusListEnum
              );
            }}
            labelDictionary={execWorkflowStatusDictionary}
            options={Object.keys(getGlobalWorkflowsV1FilterStatusListEnum)}
            withAll
          />
        </TableToolbar>

        <ActiontechTable
          actions={tableAction}
          className="table-row-cursor"
          dataSource={workflowList?.list}
          rowKey={(record: IWorkflowDetailResV1) => {
            return `${record?.workflow_id}`;
          }}
          pagination={{
            total: workflowList?.total ?? 0,
            current: pagination.page_index
          }}
          columns={columns}
          errorMessage={requestErrorMessage}
          onChange={tableChange}
          onRow={(record) => ({
            onClick: () => handleRowClick(record)
          })}
        />
      </ActiontechTableWrapper>
    </SqlExecWorkflowListStyleWrapper>
  );
};
export default inject('modalStore')(observer(SqlExecWorkflowList));
