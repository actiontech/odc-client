import Icon from '@ant-design/icons';
import { styled } from '@mui/material/styles';

export const DatabaseGroupTriggerStyleWrapper = styled(Icon)<{
  $selected: boolean;
}>`
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme, $selected }) =>
    $selected
      ? theme.sharedTheme.uiToken.colorPrimary
      : theme.sharedTheme.uiToken.colorText} !important;
`;
