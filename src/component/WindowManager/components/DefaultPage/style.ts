import { styled } from '@mui/material';

export const DefaultPageStyleWrapper = styled('div')`
  height: 100%;
  background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
  display: flex;
  justify-content: center;

  .content {
    margin-top: 100px;
  }
`;

export const DefaultPageItemStyleWrapper = styled('div')`
  display: flex;
  align-items: center;
  width: 360px;
  height: 44px;
  margin-top: 12px;
  padding: 0px 16px;
  background-color: ${({ theme }) =>
    theme.sharedTheme.uiToken.colorFillSecondary};
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background-color: ${({ theme }) =>
      theme.sharedTheme.basic.colorPrimaryBgHover};
  }

  .icon {
    margin-right: 13px;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextQuaternary};
    font-size: 16px;
  }
  .label {
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextBase};
  }
`;
