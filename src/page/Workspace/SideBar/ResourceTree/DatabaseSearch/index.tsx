import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import { isMac } from '@/util/env';
import { useMemo } from 'react';
import { Tooltip } from 'antd';
import styles from '../index.less';
import { SearchInput } from '@actiontech/dms-kit';
interface IProps {
  modalStore?: ModalStore;
  settingStore?: SettingStore;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  searchValue: string;
  /** 有匹配且按数据源分组时显示 ⏎ */
  showEnterHint?: boolean;
  /** Enter：定位首项或静默；不得打开全局搜索弹窗 */
  onEnterLocate?: () => void;
}

const DatabaseSearch: React.FC<IProps> = (props) => {
  const { setSearchValue, searchValue, showEnterHint, onEnterLocate } = props;

  const enterHintTitle = formatMessage({
    id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearch.EnterLocateFirst',
    defaultMessage: '定位到第一个匹配的数据源'
  });

  const getShortcut = useMemo(() => {
    let str = '';
    if (isMac()) {
      str = '⌘ J';
    } else {
      str = 'Ctrl J';
    }
    return (
      <span className={styles.shortcutGroup}>
        {showEnterHint ? (
          <Tooltip title={enterHintTitle}>
            <span
              className={styles.shortCut}
              aria-label={enterHintTitle}
              data-testid="ds-enter-locate-hint"
            >
              ⏎
            </span>
          </Tooltip>
        ) : null}
        <span className={styles.shortCut}>{str}</span>
      </span>
    );
  }, [showEnterHint, enterHintTitle]);

  return (
    <SearchInput
      className={styles.searchInput}
      placeholder={formatMessage({
        id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearch.86200ED0',
        defaultMessage: '过滤数据源'
      })}
      size="small"
      value={searchValue ?? ''}
      onChange={(e) => {
        setSearchValue(e);
      }}
      suffix={getShortcut}
      onSearch={() => {
        // S2：Enter = 定位首项 / 静默；开弹窗留给放大镜与 ⌘J（S3）
        onEnterLocate?.();
      }}
    />
  );
};

export default inject('modalStore', 'settingStore')(observer(DatabaseSearch));
