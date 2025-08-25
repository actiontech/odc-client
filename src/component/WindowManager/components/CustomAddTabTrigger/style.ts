import { styled } from '@mui/material';

export const AddTabTriggerWrapper = styled('div')`
  display: flex;
  justify-content: stretch;
  flex-direction: row;
  height: 100%;
  align-items: center;
`;

export const AddMoreIconWrapper = styled('div')`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }
`;
