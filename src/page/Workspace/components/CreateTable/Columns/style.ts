import { styled } from '@mui/material';

export const ColumnsContentStyleWrapper = styled('main')`
  &.main {
    position: relative;
    height: 100%;
    overflow: hidden;
    .contentWithExtraColumn {
      padding-bottom: 200px;
    }
    .content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .bottom {
      background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 210px;
      padding: 12px;
      overflow-y: auto;
      border-top: 1px solid
        ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
    }
  }
`;
