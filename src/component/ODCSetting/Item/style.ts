import { ToggleTokens } from '@actiontech/dms-kit';
import { styled } from '@mui/material';

export const ToggleTokensStyleWrapper = styled(ToggleTokens)`
  &.actiontech-toggle-tokens {
    .toggle-token-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      padding: 4px 12px;
      margin: 0 4px 0 0;
      font-size: 14px;
      border: 1px solid
        ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
      border-radius: 4px;
      background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
      color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextSecondary};
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;

      &:last-child {
        margin-right: 0;
      }
    }

    .toggle-token-item-checked {
      border-color: ${({ theme }) =>
        theme.sharedTheme.basic.colorPrimaryActive};
      background-color: ${({ theme }) =>
        theme.sharedTheme.basic.colorPrimaryBgActive};
      color: ${({ theme }) => theme.sharedTheme.uiToken.colorPrimary};
      font-weight: 500;

      &:hover {
        border-color: var(--icon-color-focus);
        color: var(--icon-color-focus);
      }
    }
  }
`;
