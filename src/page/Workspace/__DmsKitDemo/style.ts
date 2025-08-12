import { styled } from '@mui/material/styles';

export const DmsKitDemoStyleWrapper = styled('div')`
  display: flex;
  background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorErrorBgHover};
  height: 100px;
  width: 100%;
`;
