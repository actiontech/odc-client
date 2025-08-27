import { styled } from '@mui/material';

export const TableDetailInfoPageStyleWrapper = styled('div')`
  height: 100%;
  overflow: auto;
  background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px;
    border-bottom: 0;
  }

  .table-page-topbar-tab {
    height: calc(100% - 54px) !important;

    .ant-tabs-nav {
      outline: none;
      transition: padding 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      .ant-tabs-nav-wrap {
        display: none;
      }
    }
    .ant-tabs-content-holder {
      height: 100%;
      .ant-tabs-content {
        height: 100%;
        .ant-tabs-tabpane {
          height: 100%;
        }
      }
    }
  }

  .table-page-props-tab {
    height: 100%;
    &.ant-tabs-left {
      .ant-tabs-nav {
        min-width: 80px;
        height: 100%;
      }
    }
    & .ant-tabs-nav-wrap {
      display: block !important;
    }
    .ant-tabs-content-holder {
      background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
      border-left: 1px solid
        ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};

      .ant-tabs-content {
        height: 100%;
        > .ant-tabs-tabpane {
          height: 100%;
          padding-left: 0;
          border-left: none;
          .ant-spin-nested-loading {
            height: 100%;
            .ant-spin-container {
              height: 100%;
            }
          }
        }
      }
    }

    .ant-tabs-ink-bar.ant-tabs-ink-bar-animated {
      left: 0;
    }
    .ant-tabs-nav {
      .ant-tabs-tab {
        margin: 0;
        padding: 8px 16px;
        font-size: 12px;
        text-align: left;

        &.ant-tabs-tab-active {
          background: ${({ theme }) =>
            theme.sharedTheme.basic.colorPrimaryBgActive};
        }
      }
    }
  }
`;
