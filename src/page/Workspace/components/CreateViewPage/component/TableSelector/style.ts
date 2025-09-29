import { styled } from '@mui/material';
import { Transfer } from 'antd';

export const TransferStyleWrapper = styled(Transfer)<{ hideHeader?: boolean }>`
  &.ant-transfer {
    .ant-input-affix-wrapper {
      border-radius: 4px;
      border: ${({ theme }) =>
        theme.sharedTheme.components.basicInput.default.border};

      &:focus {
        border: ${({ theme }) =>
          theme.sharedTheme.components.basicInput.focus.border};
        caret-color: ${({ theme }) =>
          theme.sharedTheme.components.basicInput.focus.caretColor};
      }
    }

    .ant-transfer-operation {
      button {
        border: 1px solid
          ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
      }
    }

    .ant-transfer-list-header {
      display: ${({ hideHeader }) => (hideHeader ? 'none' : 'block')};
    }

    .ant-tree-treenode {
      padding-right: 12px;
      padding-left: 12px;
    }

    .ant-tree-switcher {
      width: 14px;
    }
    .ant-tree.ant-tree-directory
      .ant-tree-treenode
      .ant-tree-switcher
      .ant-tree-switcher-icon {
      color: var(--icon-color-normal);
    }

    .ant-transfer-list {
      height: 300px;
      border: 1px solid
        ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
    }

    .ant-transfer-list:first-child {
      flex: 1 1 30%;
      min-width: 200px;

      .ant-transfer-list-body-customize-wrapper {
        padding: 0;
      }
    }

    .ant-transfer-list:last-child {
      flex: 1 1 70%;
      min-width: 200px;
      .ant-transfer-list-body-search-wrapper {
        display: none;
      }

      .ant-transfer-list-body {
        padding: 16px 0 0 0;
      }

      .ant-transfer-list-body-customize-wrapper {
        // padding: 0 0 0 12px;
      }
    }

    .ant-tree-checkbox {
      margin-right: 4px;
      margin-left: 4px;
    }

    .ant-tree .ant-tree-node-content-wrapper {
      padding-left: 0;
      white-space: nowrap;
      text-overflow: ellipsis;

      .ant-tree-iconEle {
        width: 20px;
        height: 20px;
        line-height: 22px;
      }
    }
  }
`;
