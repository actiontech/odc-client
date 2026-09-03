import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import { SearchStatus } from '@/page/Workspace/SideBar/ResourceTree/DatabaseSearchModal/constant';
import { isMac } from '@/util/env';
import { useMemo } from 'react';
import styles from '../index.less';
import { SearchInput } from '@actiontech/dms-kit';
interface IProps {
  modalStore?: ModalStore;
  settingStore?: SettingStore;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  searchValue: string;
}

const DatabaseSearch: React.FC<IProps> = (props) => {
  const { modalStore, setSearchValue, searchValue } = props;

  const getShortcut = useMemo(() => {
    let str = '';
    if (isMac()) {
      str = '⌘ J';
    } else {
      str = 'Ctrl J';
    }
    return <span className={styles.shortCut}>{str}</span>;
  }, []);

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
        // S1 过渡：Enter 仍开弹窗；S2 再改为定位
        modalStore.changeDatabaseSearchModalVisible(true, {
          initStatus: SearchStatus.forDataSource,
          initSearchKey: searchValue
        });
      }}
    />
  );
};

export default inject('modalStore', 'settingStore')(observer(DatabaseSearch));
