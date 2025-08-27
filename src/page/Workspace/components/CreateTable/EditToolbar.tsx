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

import { formatMessage } from '@/util/intl';
import { BasicButton } from '@actiontech/dms-kit';
import { Space } from 'antd';
import React, { useRef } from 'react';
import { EditToolbarStyleWrapper } from './style';

interface IProps {
  modified: boolean;
  onCancel?: () => void;
  onOk?: () => void;
}

const EditToolbar: React.FC<IProps> = function (props) {
  const { children, modified, onCancel, onOk } = props;
  const aRef = useRef<HTMLAnchorElement>();
  return (
    <EditToolbarStyleWrapper>
      {children}
      {modified ? (
        <Space>
          <BasicButton onClick={onCancel}>
            {
              formatMessage({
                id: 'odc.components.CreateTable.EditToolbar.Cancel',
                defaultMessage: '取消'
              }) /*取消*/
            }
          </BasicButton>
          <a
            ref={aRef}
            style={{ display: 'none' }}
            onClick={() => {
              onOk();
            }}
          />

          <BasicButton
            type="primary"
            onClick={() => {
              setTimeout(() => {
                /**
                 * 这里要增加一个延迟触发click的功能，以此来保证editor正在编辑的数据已经被提交了
                 */
                aRef.current.click();
              }, 200);
            }}
          >
            {
              formatMessage({
                id: 'odc.components.CreateTable.EditToolbar.NextStepConfirmSql',
                defaultMessage: '下一步：确认 SQL'
              }) /*下一步：确认 SQL*/
            }
          </BasicButton>
        </Space>
      ) : null}
    </EditToolbarStyleWrapper>
  );
};

export default EditToolbar;
