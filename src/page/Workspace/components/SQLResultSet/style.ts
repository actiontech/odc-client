import { styled } from '@mui/material/styles';
import { Tabs, Timeline } from 'antd';

export const ResultTabsStyleWrapper = styled(Tabs)`
  &.tabs {
      border-top: none;

      .ant-tabs-nav {
        background: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
        border-bottom: none !important;
        .ant-tabs-nav-operations {
          height: 28px;
        }
      }
      .ant-tabs-tab-next,
      .ant-tabs-tab-prev {
        border-bottom: 1px solid rgba(184, 198, 211, 0.4);
      }

      .ant-tabs-nav .ant-tabs-nav-container {
        height: 28px !important;
      }

      .ant-tabs-nav .ant-tabs-tab {
        width: 100px;
        max-width: 160px;
        height: 28px !important;
        margin-left: 0;
        padding: 0 0 !important;
        color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
        font-size: 12px;
        line-height: 28px !important;
        text-align: center;
        border: none !important;
        border-right: none !important;
        border-radius: unset !important;
        &:hover {
          color: unset;
            background: ${({ theme }) =>
              theme.sharedTheme.basic.colorPrimaryBgActive} !important;
        }
        .ant-tabs-tab-btn {
          width: 100%;
        }
        &::after {
          position: absolute;
          top: 50%;
          right: 0;
          width: 1px;
          height: 20px;
          background-color: ${({ theme }) =>
            theme.sharedTheme.uiToken.colorBorderSecondary};
          transform: translateY(-50%);
          content: ' ';
        }
      }

      .ant-tabs-ink-bar {
        top: 0 !important;
        display: none;
      }

      .ant-tabs-ink-bar.ant-tabs-ink-bar-animated {
        top: 0;
      }

      .ant-tabs-nav .ant-tabs-tab-active {
        background: ${({ theme }) =>
          theme.sharedTheme.basic.colorPrimaryBgActive} !important;
        border-bottom: none !important;
        .ant-tabs-tab-btn {
          color: ${({ theme }) =>
            theme.sharedTheme.uiToken.colorText} !important;
        }
        &::after {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          content: '';
        }
      }

      .ant-tabs-content {
        background: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
      }
    }
  }

  .result {
    padding: 16px;
    font-size: 12px;
    .executedSQL,
    .dbms {
      margin: 8px 0;
      margin-bottom: 24px;
      color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextSecondary};
    }
    .executedSQL {
      max-height: 60px;
      line-height: 20px;
    }
    .dbms {
      white-space: pre;
    }
    .track {
      margin-top: 8px;
      margin-bottom: 10px;
    }
  }
  .extraBox {
    position: absolute;
    top: 0;
    right: 10px;
    display: none;
  }
  .extraStatusBox {
    position: absolute;
    top: 0;
    right: 10px;
    display: inline-block;
    .ant-badge-status-text {
      display: none;
    }
  }
  .ant-tabs-tab {
    .resultSetTitle {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      .title {
        display: inline-block;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .closeBtn {
        margin-right: 0 !important;
        margin-left: 8px;
        font-size: 10px;
      }

      &:hover {
        .extraStatusBox {
          display: none;
        }
        .extraBox {
          display: inline-block;
        }
        .title {
          padding: 0 10px;
        }
      }
    }
  }

  .lockHint {
    position: fixed;
    background: white;
    transform: translate(0, -58px);
  }
  .sqlLabel {
    padding-top: 16px;
  }

  .editor-selection-stmt-default {
    background: var(--code-highlight-default-color);
  }
  .editor-selection-stmt-suggest {
    background: var(--code-highlight-suggest-color);
  }
  .editor-selection-stmt-must {
    background: var(--code-highlight-must-color);
  }
  .lintResultTableHeader {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 12px;
    .tip {
      color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextSecondary};
      font-weight: 400;
      font-size: 12px;
    }
  }

  .labelHover {
    cursor: pointer;
  }

  .runningSql {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 66px 0;
  }
  .lintLabel {
    &:hover {
      background-color: var(--hover-color);
    }
`;

export const TimelineStyleWrapper = styled(Timeline)`
  &.executeTimerLine {
    width: 310px;
    padding: 20px 10px 0px 20px;
    .ant-timeline-item.ant-timeline-item-last {
      padding-bottom: 0;
    }
    .ant-timeline-item-tail {
      border-inline-start: 2px solid
        ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
    }
  }
`;
