import {
  useTableRequestParams,
  TableToolbar,
  useTableRequestError,
  ActiontechTable,
  ActiontechTableWrapper,
  PageHeader,
  ROUTE_PATHS
} from '@actiontech/dms-kit';
import { useRequest } from 'ahooks';
import { useMemo, useState } from 'react';
import { ExportWorkflowListColumn } from './column';
import WorkflowStatusFilter from './components/WorkflowStatusFilter';
import { IListAllDataExportWorkflowsParams } from '@/external_api/base/DataExportWorkflows/index.type';
import { ListAllDataExportWorkflowsFilterByStatusEnum } from '@/external_api/base/DataExportWorkflows/index.enum';
import {
  DataExportWorkflowsService,
  SessionService
} from '@/external_api/base';
import { formatMessage } from '@/util/intl';
import { IListDataExportWorkflow } from '@/external_api/base/common.type';
import { exportDataWorkflowAction } from './action';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';

const ExportWorkflowList: React.FC<{ modalStore?: ModalStore }> = ({
  modalStore
}) => {
  const [filterStatus, setFilterStatus] = useState<
    ListAllDataExportWorkflowsFilterByStatusEnum | 'all'
  >('all');
  const { requestErrorMessage, handleTableRequestError } =
    useTableRequestError();
  const {
    pagination,
    tableChange,
    searchKeyword,
    setSearchKeyword,
    refreshBySearchKeyword
  } = useTableRequestParams<IListDataExportWorkflow>();
  const columns = useMemo(() => {
    return ExportWorkflowListColumn();
  }, []);

  const handleRowClick = (record: IListDataExportWorkflow) => {
    modalStore.changeDMSIframeModalVisible(true, {
      title: formatMessage(
        {
          id: 'dmsDataExport.detailModal.title',
          defaultMessage: `导出工单详情 - ${record.workflow_name || ''}`
        },
        {
          workflowName: record.workflow_name || ''
        }
      ),
      iframeTitle: formatMessage({
        id: 'dmsDataExport.iframe.title',
        defaultMessage: '工单详情'
      }),
      url: getDetailUrl(record)
    });
  };

  const getDetailUrl = (record: IListDataExportWorkflow): URL => {
    return new URL(
      `${ROUTE_PATHS.BASE.DATA_EXPORT.detail.prefix.replace(
        ':projectID',
        record.project_uid
      )}/${record.workflow_uid}`,
      window.location.origin
    );
  };

  const tableAction = exportDataWorkflowAction(getDetailUrl);

  const { data: userUID } = useRequest(() =>
    SessionService.GetUserBySession({}).then((res) => res.data.data.user_uid)
  );

  const {
    data: exportWorkflowList,
    loading,
    refresh
  } = useRequest(
    () => {
      const params: IListAllDataExportWorkflowsParams = {
        ...pagination,
        filter_by_status: filterStatus === 'all' ? undefined : filterStatus,
        fuzzy_keyword: searchKeyword,
        filter_by_create_user_uid: userUID
      };
      return handleTableRequestError(
        DataExportWorkflowsService.ListAllDataExportWorkflows(params)
      );
    },
    {
      ready: !!userUID,
      refreshDeps: [pagination, filterStatus]
    }
  );

  return (
    <section>
      <PageHeader
        title={formatMessage({
          id: 'dmsDataExport.pageTitle',
          defaultMessage: '导出工单'
        })}
      />

      <ActiontechTableWrapper loading={loading}>
        <TableToolbar
          style={{ width: '100%', justifyContent: 'space-between' }}
          refreshButton={{
            refresh,
            disabled: loading
          }}
          searchInput={{
            onChange: setSearchKeyword,
            onSearch: () => {
              refreshBySearchKeyword();
            }
          }}
        >
          <WorkflowStatusFilter
            status={filterStatus}
            onChange={setFilterStatus}
          />
        </TableToolbar>

        <ActiontechTable
          actions={tableAction}
          onChange={tableChange}
          className="table-row-cursor"
          dataSource={exportWorkflowList?.list}
          rowKey={(record) => {
            return `${record?.workflow_uid}`;
          }}
          pagination={{
            total: exportWorkflowList?.total ?? 0,
            current: pagination.page_index
          }}
          columns={columns}
          errorMessage={requestErrorMessage}
          onRow={(record) => ({
            onClick: () => handleRowClick(record)
          })}
        />
      </ActiontechTableWrapper>
    </section>
  );
};
export default inject('modalStore')(observer(ExportWorkflowList));
