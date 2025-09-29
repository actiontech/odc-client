import { styled } from '@mui/material/styles';

export const DMSIframeModalStyleWrapper = styled('div')`
  height: 80vh;
  position: relative;

  .ant-spin-nested-loading {
    height: 100%;

    .ant-spin-container {
      height: 100%;
    }

    .dms-iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 4px;
      background: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
    }
  }
`;
