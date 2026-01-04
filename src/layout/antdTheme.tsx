import {
  ComponentControlHeight,
  DEFAULT_THEME_DATA,
  SupportTheme
} from '@actiontech/dms-kit';
import { ThemeConfig } from 'antd/es';
import { theme as antdTheme } from 'antd';

export const getTheme = (themeType: SupportTheme): ThemeConfig => {
  const themeData = DEFAULT_THEME_DATA[themeType];
  return {
    components: {
      Input: {
        controlHeight: ComponentControlHeight.default,
        controlHeightLG: ComponentControlHeight.lg,
        controlHeightSM: ComponentControlHeight.sm
      },
      Button: {
        controlHeight: 32,
        controlHeightLG: 36,
        controlHeightSM: 28
      },
      DatePicker: {
        controlHeight: ComponentControlHeight.default,
        controlHeightLG: ComponentControlHeight.lg,
        controlHeightSM: ComponentControlHeight.sm
      },
      Select: {
        controlHeight: ComponentControlHeight.default,
        controlHeightLG: ComponentControlHeight.lg,
        controlHeightSM: ComponentControlHeight.sm
      },
      Pagination: {
        itemSize: 28
      },
      Table: {
        fontSize: 13,
        fontWeightStrong: 500
      },
      Dropdown: {
        fontSize: 13
      }
    },
    algorithm:
      themeType === SupportTheme.DARK
        ? antdTheme.darkAlgorithm
        : antdTheme.defaultAlgorithm,
    token: {
      fontFamily: `PlusJakartaSans Medium, -apple-system, 'Microsoft YaHei', BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
'Noto Color Emoji'`,
      fontSize: 14,
      colorInfo: themeData.sharedTheme.uiToken.colorInfo,
      colorPrimary: themeData.sharedTheme.uiToken.colorPrimary,
      colorSuccess: themeData.sharedTheme.uiToken.colorSuccess,
      colorWarning: themeData.sharedTheme.uiToken.colorWarning,
      colorError: themeData.sharedTheme.uiToken.colorError,
      colorTextBase: themeData.sharedTheme.uiToken.colorTextBase,
      colorBgBase: themeData.sharedTheme.uiToken.colorBgBase,
      colorText: themeData.sharedTheme.uiToken.colorText,
      colorTextSecondary: themeData.sharedTheme.uiToken.colorTextSecondary,
      colorTextTertiary: themeData.sharedTheme.uiToken.colorTextTertiary,
      colorTextQuaternary: themeData.sharedTheme.uiToken.colorTextQuaternary,
      colorBorderSecondary: themeData.sharedTheme.uiToken.colorBorderSecondary,
      colorBorder: themeData.sharedTheme.uiToken.colorBorder,
      colorFill: themeData.sharedTheme.uiToken.colorFill,
      colorFillSecondary: themeData.sharedTheme.uiToken.colorFillSecondary,
      colorFillTertiary: themeData.sharedTheme.uiToken.colorFillTertiary,
      colorFillQuaternary: themeData.sharedTheme.uiToken.colorFillQuaternary,
      colorBgLayout: themeData.sharedTheme.uiToken.colorBgLayout,
      colorWarningBgHover: themeData.sharedTheme.uiToken.colorWarningBgHover,
      colorErrorBgHover: themeData.sharedTheme.uiToken.colorErrorBgHover
    }
  };
};
