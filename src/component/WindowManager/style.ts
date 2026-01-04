import { styled } from '@mui/material';
import DraggableTabs from './DraggableTabs';

export const PageTitleStyleWrapper = styled('span')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  gap: 6px;
  padding: 0 4px;
  position: relative;
  overflow: hidden;

  &:hover {
    .extra-status-box {
      opacity: 0.7;
      transform: scale(0.9);
    }

    .close-btn {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
    }
  }
`;

export const TitleTextStyleWrapper = styled('span')`
  display: inline-block;
  flex: 1 1 0%;
  max-width: 100px;
  margin-left: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  color: inherit;
`;

export const IconStyleWrapper = styled('span')`
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 14px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

export const ExtraStatusBoxStyleWrapper = styled('span')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  margin-left: auto;
  margin-right: 4px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;

  .ant-badge-status-text {
    display: none;
  }

  .ant-badge-status-dot {
    width: 8px !important;
    height: 8px !important;
    border-radius: 50% !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.8) !important;
  }

  .ant-badge-status-default .ant-badge-status-dot {
    background: radial-gradient(circle at 30% 30%, #ffa726, #ff9500) !important;
  }

  .ant-badge-status-processing .ant-badge-status-dot {
    background: radial-gradient(circle at 30% 30%, #66bb6a, #52c41a) !important;
    animation: chrome-processing 1.8s ease-in-out infinite;
  }

  @keyframes chrome-processing {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 0 rgba(82, 196, 26, 0.4);
    }
    50% {
      opacity: 0.8;
      transform: scale(0.95);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 3px rgba(82, 196, 26, 0.3);
    }
  }
`;

export const CloseButtonStyleWrapper = styled('span')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 2px;
  border-radius: 50%;
  visibility: hidden;
  border: 1px solid
    ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  transform: scale(0.8);
  cursor: pointer;
  font-size: 10px;

  &:hover {
    background: ${({ theme }) => theme.sharedTheme.uiToken.colorError};
    color: ${({ theme }) => theme.sharedTheme.basic.colorWhite} !important;
    transform: scale(1);
  }

  &:active {
    transform: scale(0.9);
    box-shadow: 0 1px 2px rgba(231, 76, 60, 0.5);
  }

  .anticon {
    font-size: 8px;
    line-height: 1;
    color: inherit;
  }
`;

export const TooltipTitleStyleWrapper = styled('div')`
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
  color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextSecondary};

  .not-saved-badge,
  .running-badge {
    .ant-badge-status-text {
      margin-left: 4px !important;
      font-size: 12px !important;
      color: ${({ theme }) =>
        theme.sharedTheme.uiToken.colorTextTertiary} !important;
    }
  }
`;

export const TabBarExtraContentStyleWrapper = styled('span')`
  margin-right: 12px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.sharedTheme.basic.colorPrimaryBgHover};
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }

  .tab-bar-extra-content-icon {
    font-size: 16px;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextSecondary};
  }
`;

export const ChromeStyleTabsWrapper = styled(DraggableTabs)`
  &.window-manager-wrapper-tabs {
    > .ant-tabs-nav {
      height: 36px;
      background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
      margin: 0;
      .ant-tabs-nav-container {
        height: 36px;
      }

      .ant-tabs-tab {
        position: relative;
        margin: 0 2px !important;
        max-width: 200px;
        min-width: 120px;
        height: 36px;
        padding: 0 12px;
        border: 1px solid
          ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
        border-bottom: none;
        border-radius: 10px 10px 0 0 !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextSecondary};
        font-size: 13px;
        font-weight: 500;
        overflow: hidden;

        &::after {
          display: none;
        }

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -6px;
          width: 6px;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            ${({ theme }) => theme.sharedTheme.uiToken.colorFillQuaternary}
          );
          border-radius: 0 0 0 8px;
          pointer-events: none;
        }

        &:hover {
          background: linear-gradient(
            to bottom,
            ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase},
            ${({ theme }) => theme.sharedTheme.uiToken.colorFillSecondary}
          );
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12),
            0 1px 3px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px) scale(1.02);
          color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
        }
      }

      .ant-tabs-tab-active {
        background-color: ${({ theme }) =>
          theme.sharedTheme.basic.colorPrimaryBgActive} !important;
        border-bottom: 1px solid
          ${({ theme }) => theme.sharedTheme.basic.colorPrimaryHover} !important;
        transform: translateY(-2px) scale(1.05);
        border-radius: 10px 10px 0 0 !important;

        &:hover {
          transform: translateY(-2px) scale(1.05);
        }

        .ant-tabs-tab-btn {
          color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
          font-weight: 600;
        }
      }

      .ant-tabs-nav-add {
        color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
        background: linear-gradient(
          to bottom,
          ${({ theme }) => theme.sharedTheme.uiToken.colorFillQuaternary},
          ${({ theme }) => theme.sharedTheme.uiToken.colorFillTertiary}
        );
        border: 1px solid
          ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
        border-radius: 6px;
        height: 28px;
        line-height: 26px;
        padding: 0 8px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          transform: translateY(-1px);
          color: ${({ theme }) => theme.sharedTheme.uiToken.colorPrimary};
        }
      }

      .ant-tabs-extra-content {
        height: 36px;
        line-height: 36px;
        padding-top: 4px;
      }
    }

    > .ant-tabs-content-holder > .ant-tabs-content {
      background: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
      border-top: 1px solid
        ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
          to right,
          rgba(24, 144, 255, 0) 0%,
          rgba(24, 144, 255, 0.3) 50%,
          rgba(24, 144, 255, 0) 100%
        );
      }
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.02) 0%,
        rgba(0, 0, 0, 0.05) 50%,
        transparent 100%
      );
      pointer-events: none;
      z-index: -1;
    }
  }
`;

export const WithConfirmModalStyleWrapper = styled('div')`
  height: 100%;
  overflow: auto;
  background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
  position: relative;
`;
