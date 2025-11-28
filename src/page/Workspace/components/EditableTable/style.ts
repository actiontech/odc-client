import { styled } from '@mui/material';
import DataGrid from '@oceanbase-odc/ob-react-data-grid';

export const EditableTableStyleWrapper = styled(DataGrid)`
  background-color: ${({ theme }) =>
    theme.sharedTheme.uiToken.colorBgBase} !important;
  overflow-x: auto;

  &.fillGrid {
    height: 100%;
  }

  &.removeBordered {
    .rdg {
      border: none;
      outline: none;
    }
  }

  .rdg-header-row {
    .rdg-cell {
      font-weight: bold;
      border-bottom: ${({ theme }) =>
        theme.sharedTheme.components.table.thead.border};
      background-color: ${({ theme }) =>
        theme.sharedTheme.uiToken.colorFillTertiary} !important;
    }

    .rdg-cell.rdg-cell-editing {
      overflow: visible;
    }
    .rdg-header-sort-cell {
      .anticon {
        color: var(--neutral-grey8-color);
      }
    }
  }

  .rdg-row {
    color: ${({ theme }) => theme.sharedTheme.components.table.row.color};
    .rdg-cell {
      background-color: ${({ theme }) =>
        theme.sharedTheme.basic.colorWhite} !important;
    }

    .rdg-cell-frozen {
      background-color: ${({ theme }) =>
        theme.sharedTheme.uiToken.colorFillTertiary} !important;
    }

    .rdg-cell-selected {
      background-color: ${({ theme }) =>
        theme.sharedTheme.basic.colorPrimaryBgHover} !important;

      color: ${({ theme }) =>
        theme.sharedTheme.uiToken.colorTextBase} !important;
    }
  }

  .rdg-row-selected.rdg-row .rdg-cell {
    background-color: ${({ theme }) =>
      theme.sharedTheme.basic.colorPrimaryBgHover} !important;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextBase} !important;
  }

  .rdg-antd-editor.ant-popover {
    padding: 0;
    .ant-popover-arrow {
      display: none;
    }
    .ant-popover-content {
      .ant-popover-inner {
        padding: 0px;
        border-radius: 0px;
      }
      .ant-popover-inner-content {
        position: relative;
        max-width: unset;
      }
    }
  }
  .rdg-antd-anchor {
    width: 100%;
    margin-top: -4px;
  }
  .rdg-cell .Select {
    max-height: 30px;
    font-weight: normal;
    font-size: 12px;
  }
`;
