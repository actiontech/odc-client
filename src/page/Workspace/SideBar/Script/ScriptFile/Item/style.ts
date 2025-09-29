import { styled } from '@mui/material';

export const ScriptFileItemStyleWrapper = styled('div')`
    position: relative;
    display: flex;
    align-items: center;
    height: 28px;
    padding: 0px 4px;
    cursor: pointer;
    border-radius: 6px;
    padding-left: 12px;

    .action {
      display: none;
      flex-grow: 0;
      flex-shrink: 0;
      align-items: center;
      margin-left: auto;
      padding: 0px 5px 0px 3px;
      line-height: 28px;
      :global {
        .anticon {
          cursor: pointer;
        }
      }
    }

    &:hover {
      background-color: ${({ theme }) =>
        theme.sharedTheme.basic.colorPrimaryBgActive};
      .action {
        display: flex;
      }
    }

    &.error {
      border-bottom: 1px solid ${({ theme }) =>
        theme.sharedTheme.uiToken.colorError};
      cursor: not-allowed;
      .label {
        color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextQuaternary};
      }
    }

    &.uploading {
      border-bottom: 1px solid ${({ theme }) =>
        theme.sharedTheme.uiToken.colorPrimary};
      cursor: progress;
      .label {
        color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextQuaternary};
      }
    }

    &.active {
      background-color: ${({ theme }) =>
        theme.sharedTheme.basic.colorPrimaryBgHover};
    }
  }

  .icon {
    flex: 0;
    margin-right: 4px;
  }

  .label {
    overflow: hidden;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextSecondary};
    white-space: nowrap;
    text-overflow: ellipsis;
    user-select: none;
    &.active {
      color: ${({ theme }) => theme.sharedTheme.uiToken.colorPrimary};
    }
`;
