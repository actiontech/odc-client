import { styled } from '@mui/material/styles';

const COLLAPSED_WIDTH = '48px';
const EXPANDED_WIDTH = '220px';

export const ActivityBarRootStyleWrapper = styled('div')<{
  $collapsed: boolean;
}>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  width: ${({ $collapsed }) => ($collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH)};
  height: 100%;
  overflow: hidden;
  transition: width 200ms ease-in-out;
  background-color: ${({ theme }) => theme.sharedTheme.uiToken.colorBgBase};
`;

export const TopSectionStyleWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 8px;
`;

export const BottomSectionStyleWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  padding: 12px;
`;

export const HeaderStyleWrapper = styled('div')`
  display: flex;
  align-items: center;
  padding-left: 8px;
  padding-right: 8px;
  padding-bottom: 8px;
`;

export const ItemsWrapperStyleWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 8px;
  padding-right: 8px;
  width: 100%;
`;

export const NavItemStyleWrapper = styled('div')<{
  $active?: boolean;
  $collapsed?: boolean;
}>`
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 4px;
  padding-left: 6px;
  padding-right: 6px;
  cursor: pointer;
  color: ${({ $active, theme }) =>
    $active
      ? theme.sharedTheme.uiToken.colorPrimary
      : theme.sharedTheme.uiToken.colorTextBase};
  background-color: ${({ $active }) =>
    $active ? 'var(--focus-color)' : 'transparent'};
  transition: background-color 120ms ease, color 120ms ease;
  &:hover {
    color: var(--text-color-primary);
    background-color: var(--hover-color);
  }
`;

export const ItemLabelStyleWrapper = styled('span')`
  margin-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 150ms ease;
`;

export const ToggleButtonStyleWrapper = styled('div')`
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 4px;
  padding-left: 6px;
  padding-right: 6px;
  cursor: pointer;
  color: var(--icon-color-normal);
  &:hover {
    color: var(--text-color-primary);
    background-color: var(--hover-color);
  }
`;

export const DividerLineStyleWrapper = styled('div')`
  height: 1px;
  background-color: ${({ theme }) =>
    (theme as any)?.sharedTheme?.uiToken?.colorSplit || 'var(--divider-color)'};
  margin: 8px 0;
`;
