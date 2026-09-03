import { ModalStore } from '@/store/modal';
import { openNewSQLPage } from '@/store/helper/page';
import { IProject } from '@/d.ts/project';
import { DbObjectTypeMap } from '../constant';
import ActivityBarContext from '@/page/Workspace/context/ActivityBarContext';
import { useContext } from 'react';
import { ActivityBarItemType } from '@/page/Workspace/ActivityBar/type';
import {
  getShouldExpandedKeysByObject,
  getGroupKey
} from '@/page/Workspace/SideBar/ResourceTree/const';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { SearchStatus } from '../constant';
import { DbObjectType, IConnection } from '@/d.ts';
import { IDatabase, DatabaseGroup } from '@/d.ts/database';
import { ResourceNodeType } from '@/page/Workspace/SideBar/ResourceTree/type';

const useActions = (params: { modalStore: ModalStore; project: IProject }) => {
  const { modalStore, project } = params;
  const activituContext = useContext(ActivityBarContext);
  const context = useContext(ResourceTreeContext);
  const {
    groupMode,
    setCurrentObject,
    setShouldExpandedKeys,
    setGroupMode,
    dsNameFilterKeyword,
    setDsNameFilterKeyword
  } = context || {};

  /**
   * S3 AC-012：弹窗定位目标不在当前数据源名过滤结果内时，先清空侧栏关键词再定位。
   * 匹配口径与 S1 一致：一级节点名 includes(keyword)（大小写不敏感）。
   */
  const clearDsNameFilterIfTargetBlocked = (targetGroupName?: string) => {
    if (groupMode !== DatabaseGroup.dataSource) {
      return;
    }
    const kw = (dsNameFilterKeyword || '').trim();
    if (!kw) {
      return;
    }
    const name = (targetGroupName || '').toLowerCase();
    if (!name.includes(kw.toLowerCase())) {
      setDsNameFilterKeyword?.(null);
    }
  };

  /** 先关弹窗再改树状态，避免清过滤触发的父级重渲染冲掉 visible=false */
  const closeSearchModal = () => {
    modalStore?.changeDatabaseSearchModalVisible(false);
  };

  /** 打开SQL窗口 */
  const openSql = (e, db) => {
    e.stopPropagation();
    closeSearchModal();
    db.id && openNewSQLPage(db.id);
  };

  /** 申请库权限 */
  const applyPermission = (e, db: IDatabase) => {
    e.stopPropagation();
    modalStore.changeApplyDatabasePermissionModal(true, {
      projectId: db?.project?.id,
      databaseId: db?.id
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  /** 申请表/视图权限 */
  const applyTablePermission = (e, object, type) => {
    e.stopPropagation();
    const dbObj = [
      DbObjectType.table,
      DbObjectType.external_table,
      DbObjectType.view
    ]?.includes(type)
      ? object
      : object?.dbObject;
    const params = {
      projectId: dbObj?.database?.project?.id,
      databaseId: dbObj?.database?.id,
      tableName: dbObj?.name,
      tableId: dbObj?.id
    };
    modalStore.changeApplyTablePermissionModal(true, {
      ...params
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  /** 申请库权限 */
  const applyDbPermission = (e, db) => {
    e.stopPropagation();
    const dbObj = db?.dbObject?.database || db?.database || db;
    modalStore.changeApplyDatabasePermissionModal(true, {
      projectId: dbObj?.project?.id,
      databaseId: dbObj?.id
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  const hasPermission = (object) => {
    return (
      object?.database?.authorizedPermissionTypes?.length ||
      object?.dbObject?.database?.authorizedPermissionTypes?.length
    );
  };

  /** 打开对象信息窗口 */
  const openTree = (e, object) => {
    if (!hasPermission(object)) return;
    const type = object?.type || DbObjectType.column;
    e.stopPropagation();
    const databaseId = object?.dbObject?.database?.id || object?.database?.id;

    if (type === DbObjectType.external_table) {
      object.isExternalTable = true;
    }
    DbObjectTypeMap?.[type]?.openPage(object)(
      ...DbObjectTypeMap?.[type]?.getOpenTab(object, databaseId)
    );
    modalStore?.changeDatabaseSearchModalVisible(false);
  };

  /** 打开并定位资源树上数据库、对象 */
  const positionResourceTree = (parmas: {
    type?: DbObjectType;
    database?: IDatabase;
    name?: string;
    objectName?: string;
  }) => {
    activituContext.setActiveKey(ActivityBarItemType.Database);
    const { type, database, name, objectName } = parmas;
    // 先关弹窗，再清过滤/展开，避免父级 setState 批更新冲掉关闭
    closeSearchModal();
    // 一级过滤节点是数据源名；对象/库定位时按所属数据源判断是否被挡住
    clearDsNameFilterIfTargetBlocked(database?.dataSource?.name);
    const keyObject = getShouldExpandedKeysByObject({
      type,
      database,
      groupMode,
      name,
      objectName
    });
    setCurrentObject({
      value: keyObject.currentKey,
      type: keyObject.currentResourceNodeType
    });
    setShouldExpandedKeys(keyObject.shouldExpandedKeys as React.Key[]);
  };

  /** 打开并定位资源树上的项目/数据源 */
  const positionProjectOrDataSource = (params: {
    status: SearchStatus;
    object: IProject | IConnection;
  }) => {
    activituContext.setActiveKey(ActivityBarItemType.Database);
    const { status, object } = params;
    closeSearchModal();
    switch (status) {
      case SearchStatus.forDataSource:
      case SearchStatus.dataSourceforObject: {
        clearDsNameFilterIfTargetBlocked(object?.name);
        setCurrentObject({
          value: getGroupKey(object.id, DatabaseGroup.dataSource),
          type: ResourceNodeType.GroupNodeDataSource
        });
        setGroupMode(DatabaseGroup.dataSource);
        setShouldExpandedKeys([
          getGroupKey(object.id, DatabaseGroup.dataSource)
        ]);
        break;
      }
      case SearchStatus.forProject:
      case SearchStatus.projectforObject: {
        setCurrentObject({
          value: getGroupKey(object.id, DatabaseGroup.project),
          type: ResourceNodeType.GroupNodeProject
        });
        setGroupMode(DatabaseGroup.project);
        setShouldExpandedKeys([getGroupKey(object.id, DatabaseGroup.project)]);
      }
    }
  };

  return {
    openSql,
    applyPermission,
    applyTablePermission,
    applyDbPermission,
    openTree,
    positionResourceTree,
    positionProjectOrDataSource
  };
};

export default useActions;
