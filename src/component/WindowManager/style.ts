import { styled } from '@mui/material';

export const PageTitleStyleWrapper = styled('span')`
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.sharedTheme.basic.colorPrimaryHover};
    .extra-status-box {
      display: none;
    }

    .close-btn {
      display: inline;
    }
  }
`;

export const TitleTextStyleWrapper = styled('span')`
  display: inline-block;
  max-width: 104px;
  padding-left: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const IconStyleWrapper = styled('span')`
  display: flex;
  line-height: 1;
  font-size: 14px;
`;

export const ExtraStatusBoxStyleWrapper = styled('span')`
  display: inline-block;
  margin-left: 8px;
  margin-right: 0 !important;
  width: 8px;

  .ant-badge-status-text {
    display: none;
  }
`;

export const CloseButtonStyleWrapper = styled('span')`
  display: none;
  margin-right: 0 !important;
  margin-left: 8px;
  font-size: 8px;
  vertical-align: baseline;
  width: 8px;
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
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ theme }) =>
      theme.sharedTheme.basic.colorPrimaryBgHover};
    border-radius: 4px;
  }

  .tab-bar-extra-content-icon {
    font-size: 16px;
  }
`;

export const WithConfirmModalStyleWrapper = styled('div')`
  height: 100%;
  overflow: auto;
  background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
  position: relative;
`;
