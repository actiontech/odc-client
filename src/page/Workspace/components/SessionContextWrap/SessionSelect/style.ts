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

import { styled } from '@mui/material';
import { Space } from 'antd';

export const LineStyleWrapper = styled('div')`
  display: flex;
  align-items: center;
  height: 32px;
  padding-left: 16px;
  color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextSecondary};
`;

export const ContentStyleWrapper = styled('div')`
  display: flex;
  align-items: center;
  width: 100%;

  .datasourceAndProjectItemBox {
    flex: 1;
    overflow: hidden;
  }
`;

export const LinkStyleWrapper = styled(Space)`
  cursor: pointer;
  line-height: 22px;

  &:hover {
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorPrimary} !important;
  }
`;

export const AimStyleWrapper = styled('span')`
  padding: 8px 8px;
  color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextSecondary};

  &:hover {
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorPrimary};
  }
`;

export const SessionInfoStyleWrapper = styled('div')`
  flex: 1;
  overflow: hidden;
  display: flex;
  padding-right: 8px;

  .datasourceAndProjectItemBox {
    padding-left: 8px;
    flex: 1;
    overflow: hidden;
    display: flex;
  }
`;

export const EllipsisStyleWrapper = styled('span')`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const DatasourceAndProjectItemStyleWrapper = styled(Space)`
  height: 100%;
  max-width: 100%;
  color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextTertiary};
  :global {
    .ant-space-item {
      overflow: hidden;
    }
  }

  .describeItem {
    width: 100%;
    display: flex;
    overflow: hidden;

    .label {
      color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextTertiary};
    }

    > span:nth-child(1) {
      white-space: nowrap;
    }
  }
`;

export const DescribeItemStyleWrapper = styled('span')`
  width: 100%;
  display: flex;
  overflow: hidden;

  .label {
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextTertiary};
  }

  > span:nth-child(1) {
    white-space: nowrap;
  }
`;

export const DatasourceAndProjectItemBoxStyleWrapper = styled('div')`
  flex: 1;
  overflow: hidden;
`;
