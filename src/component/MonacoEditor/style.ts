import { styled } from '@mui/material/styles';

export const MonacoEditorContainerStyleWrapper = styled('div')`
  height: 100%;
  border: ${({ theme }) =>
    theme.sharedTheme.components.customMonacoEditor.border};
  border-radius: 6px;
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;

  .editor {
    width: 100%;
    height: 100%;
  }
`;
