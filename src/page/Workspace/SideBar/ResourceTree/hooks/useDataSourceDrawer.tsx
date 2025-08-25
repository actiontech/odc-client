/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useState } from 'react';
import { Modal, message } from 'antd';
import { formatMessage } from '@/util/intl';
import { deleteConnection } from '@/common/network/connection';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { toInteger } from 'lodash';

const useDataSourceDrawer = () => {
  const [addDSVisiable, setAddDSVisiable] = useState(false);
  const [editDatasourceId, setEditDatasourceId] = useState<number>(null);
  const [copyDatasourceId, setCopyDatasourceId] = useState<number>(null);
  const context = useContext(ResourceTreeContext);
  const selectKeys = [context.selectDatasourceId].filter(Boolean);
  function setSelectKeys(keys) {
    return context.setSelectDatasourceId(keys?.[0]);
  }

  const deleteDataSource = (name: string, key: number) => {
    Modal.confirm({
      title: formatMessage(
        {
          id: 'odc.ResourceTree.Datasource.AreYouSureYouWant',
          defaultMessage: '确认删除数据源 {name}?',
        },
        { name },
      ),
      async onOk() {
        const isSuccess = await deleteConnection(key?.toString());
        if (isSuccess) {
          message.success(
            formatMessage({
              id: 'odc.ResourceTree.Datasource.DeletedSuccessfully',
              defaultMessage: '删除成功',
            }), //删除成功
          );

          if (selectKeys.includes(key)) {
            setSelectKeys([]);
          }
          context?.reloadDatasourceList();
          setTimeout(() => {
            context?.reloadDatabaseList();
          }, 500);
        }
      },
    });
  };

  return {
    addDSVisiable,
    setAddDSVisiable,
    editDatasourceId,
    setEditDatasourceId,
    copyDatasourceId,
    setCopyDatasourceId,
    deleteDataSource,
  };
};

export default useDataSourceDrawer;
