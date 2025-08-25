import { styled } from '@mui/material';

export const ToolbarStyleWrapper = styled('div')<{ compact?: boolean }>`
  display: flex;
  align-items: center;
  height: 38px;
  overflow: hidden;
  overflow-x: auto;
  font-size: 14px;
  background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
  border-bottom: ${({ theme }) =>
    theme.sharedTheme.uiToken.colorBorderSecondary};

  .tools-left {
    display: flex;
    align-items: center;
  }

  .tools-right {
    display: flex;
    align-items: center;
    margin-left: auto;
    padding-right: 10px;
  }

  .anticon-redo {
    transform: rotate(270deg);
  }
`;

export const ButtonStyleWrapper = styled('span')<{
  disabled?: boolean;
  isRunning?: boolean;
  isActive?: boolean;
  compact?: boolean;
}>`
  display: flex;
  align-items: center;
  margin: 5px 0 5px 8px;
  padding: 5px;
  font-size: 16px;
  font-family: PingFangSC-Regular;

  color: ${({ disabled, isActive }) => {
    if (isActive) {
      return 'var(--icon-color-focus)';
    }
    if (disabled) {
      return 'var(--icon-color-disable)';
    }
    return 'var(--icon-color-normal)';
  }};

  background: ${({ isActive }) => {
    if (isActive) {
      return 'var(--hover-color)';
    }
    return 'transparent';
  }};

  cursor: ${({ disabled, isRunning }) => {
    if (disabled) {
      return 'auto';
    }
    if (isRunning) {
      return 'progress';
    }
    return 'pointer';
  }};

  &:hover {
    background: ${({ disabled, isRunning, isActive }) => {
      if (disabled || isRunning) {
        return isActive ? 'var(--hover-color)' : 'transparent';
      }
      return 'var(--hover-color)';
    }};

    cursor: ${({ disabled, isRunning }) => {
      if (disabled) {
        return 'auto';
      }
      if (isRunning) {
        return 'progress';
      }
      return 'pointer';
    }};

    i,
    span {
      cursor: ${({ disabled, isRunning }) => {
        if (disabled) {
          return 'auto';
        }
        if (isRunning) {
          return 'progress';
        }
        return 'pointer';
      }};
    }
  }

  & > span {
    font-size: 12px;
    white-space: nowrap;
    padding-left: ${({ compact }) => (compact ? '4px' : '0')};

    &.anticon {
      padding-left: 0;
      font-size: 16px;
    }

    &.anticon-caret-down {
      margin-left: 5px;
    }
  }
`;

export const ButtonTextStyleWrapper = styled('span')`
  margin-left: 5px;
  line-height: 1;
  color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextBase};
`;

export const DividerStyleWrapper = styled('div')<{ compact?: boolean }>`
  top: 0;
  height: 1em;
  margin-right: 0;
  margin-left: ${({ compact }) => (compact ? '8px' : '0')};
`;
