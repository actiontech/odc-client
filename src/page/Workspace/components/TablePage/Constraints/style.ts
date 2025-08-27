import { styled } from '@mui/material';
import { Space } from 'antd';

export const TableConstraintsStyleWrapper = styled(Space)`
  width: 100%;
  padding: 16px 16px;

  .itembox {
    border-radius: 4px;
    border: 1px solid
      ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
  }

  .title {
    height: 30px;
    padding: 5px 0;
    line-height: 20px;
  }
`;
