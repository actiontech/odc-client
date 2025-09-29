import { styled } from '@mui/material';

export const TaskSideGroupItemStyleWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  line-height: 28px;
  cursor: pointer;
  border-radius: 6px;

  .ant-typography {
    line-height: 28px;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorTextSecondary};
  }

  &:hover {
    padding: 0 12px;
    background-color: ${({ theme }) =>
      theme.sharedTheme.basic.colorPrimaryBgActive};
  }

  &.selected {
    .ant-typography {
      color: ${({ theme }) => theme.sharedTheme.uiToken.colorPrimary};
    }
    background-color: ${({ theme }) =>
      theme.sharedTheme.basic.colorPrimaryBgHover};
  }
`;
