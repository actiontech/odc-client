import { styled } from '@mui/material';

export const TableBaseInfoFormStyleWrapper = styled('section')`
  background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
  height: 100%;

  .editing-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 38px;
    height: 48px;
    border-bottom: 1px solid
      ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
    padding: 0px 12px;

    .ant-typography {
      margin-bottom: 0;
    }
  }

  .editing-content {
    padding: 12px;
  }
`;
