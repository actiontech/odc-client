import { styled } from '@mui/material';
import Card from 'antd/es/card/Card';

export const EditToolbarStyleWrapper = styled('div')`
  background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 12px;
`;

export const TableCardLayoutStyleWrapper = styled('div')`
  &.tableCard {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .toolbar {
      flex-grow: 0;
      flex-shrink: 0;
      height: 48px;
      background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
      border-bottom: 1px solid
        ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
    }
    .table {
      position: relative;
      flex-grow: 1;
      flex-shrink: 1;
      overflow-y: auto;
    }
  }
`;

export const CreateTableStyleWrapper = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  & .ant-card-head {
    flex-grow: 0;
    min-height: 40px;
    margin-bottom: 0px !important;
    background: ${({ theme }) =>
      theme.sharedTheme.uiToken.colorBgBase} !important;
    border-bottom: 1px solid
      ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary} !important;

    > .ant-card-head-wrapper {
      > .ant-card-head-title {
        padding: 8px 0;
      }
      > .ant-card-extra {
        padding: 8px 0;
      }
    }
  }

  & .ant-card-body {
    overflow: hidden;
    flex-grow: 1;
    padding: 0 !important;
  }

  & .odc-left-tabs {
    .ant-tabs-nav-wrap {
      background: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
    }

    .ant-tabs-content {
      background: ${({ theme }) =>
        theme.sharedTheme.uiToken.colorBgBase} !important;
    }
  }
`;
