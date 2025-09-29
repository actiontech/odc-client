import { formatMessage } from '@/util/intl';
import { TabsType } from '../index';
import { BasicSegmented } from '@actiontech/dms-kit';

interface IProps {
  setTab: React.Dispatch<React.SetStateAction<TabsType>>;
  tab: TabsType;
}
const DatabaseSelectTab: React.FC<IProps> = (props) => {
  const { tab, setTab } = props;

  return (
    <BasicSegmented
      className="database-select-tab"
      value={tab}
      onChange={(value) => {
        setTab(value as TabsType);
      }}
      options={[
        {
          label: formatMessage({
            id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.components.D9D77695',
            defaultMessage: '全部'
          }),
          value: TabsType.all
        },
        {
          label: formatMessage({
            id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.components.C13AC3B3',
            defaultMessage: '最近'
          }),
          value: TabsType.recentlyUsed
        }
      ]}
    />
  );
};

export default DatabaseSelectTab;
