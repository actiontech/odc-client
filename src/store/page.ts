/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getMetaStoreInstance } from '@/common/metaStore';
import { IPage, PageType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { message } from 'antd';
import { isNil } from 'lodash';
import { action, computed, observable } from 'mobx';
import { Page } from './helper/page/pages/base';
import login from './login';
import { autoSave } from './utils/metaSync';

export interface IPageOptions {
  title?: string;
  key?: string;
  updateKey?: string;
  path?: string;
  isSaved?: boolean;
  startSaving?: boolean;
}

export class PageStore {
  private _saveDisposers: (() => void)[] = [];

  @observable
  public pages: IPage[] = [];

  @observable
  public activePageKey: string | null = null;

  @computed public get activePage() {
    return this.pages.find((p) => p.key === this.activePageKey);
  }

  @action
  getPageByKey(pageKey: string) {
    return this.pages.find((p) => p.key === pageKey);
  }

  /** 获取默认页面数据 */
  private getDefaultPages(): IPage[] {
    return [
      {
        key: 'default-sql',
        title: 'SQL查询页',
        type: PageType.SQL,
        isSaved: true,
        params: { type: PageType.SQL }
      }
      // {
      //   key: 'default-pl',
      //   title: 'PL查询页',
      //   type: PageType.PL,
      //   isSaved: true,
      //   params: { type: PageType.PL }
      // }
      // {
      //   key: 'default-create-table',
      //   title: '创建表',
      //   type: PageType.CREATE_TABLE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-table',
      //   title: '表详情',
      //   type: PageType.TABLE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-session-param',
      //   title: '会话参数',
      //   type: PageType.SESSION_PARAM,
      //   isSaved: true
      // },
      // {
      //   key: 'default-session-management',
      //   title: '会话管理',
      //   type: PageType.SESSION_MANAGEMENT,
      //   isSaved: true
      // },
      // {
      //   key: 'default-recycle-bin',
      //   title: '回收站',
      //   type: PageType.RECYCLE_BIN,
      //   isSaved: true
      // },
      // {
      //   key: 'default-tasks',
      //   title: '任务管理',
      //   type: PageType.TASKS,
      //   isSaved: true
      // },
      // {
      //   key: 'default-create-view',
      //   title: '创建视图',
      //   type: PageType.CREATE_VIEW,
      //   isSaved: true
      // },
      // {
      //   key: 'default-view',
      //   title: '视图详情',
      //   type: PageType.VIEW,
      //   isSaved: true
      // },
      // {
      //   key: 'default-create-materialized-view',
      //   title: '创建物化视图',
      //   type: PageType.CREATE_MATERIALIZED_VIEW,
      //   isSaved: true
      // },
      // {
      //   key: 'default-materialized-view',
      //   title: '物化视图详情',
      //   type: PageType.MATERIALIZED_VIEW,
      //   isSaved: true
      // },
      // {
      //   key: 'default-create-function',
      //   title: '创建函数',
      //   type: PageType.CREATE_FUNCTION,
      //   isSaved: true
      // },
      // {
      //   key: 'default-function',
      //   title: '函数详情',
      //   type: PageType.FUNCTION,
      //   isSaved: true
      // },
      // {
      //   key: 'default-create-procedure',
      //   title: '创建存储过程',
      //   type: PageType.CREATE_PROCEDURE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-procedure',
      //   title: '存储过程详情',
      //   type: PageType.PROCEDURE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-create-sequence',
      //   title: '创建序列',
      //   type: PageType.CREATE_SEQUENCE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-sequence',
      //   title: '序列详情',
      //   type: PageType.SEQUENCE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-create-package',
      //   title: '创建包',
      //   type: PageType.CREATE_PACKAGE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-package',
      //   title: '包详情',
      //   type: PageType.PACKAGE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-ob-client',
      //   title: 'OB客户端',
      //   type: PageType.OB_CLIENT,
      //   isSaved: true
      // },
      // {
      //   key: 'default-create-trigger',
      //   title: '创建触发器',
      //   type: PageType.CREATE_TRIGGER,
      //   isSaved: true
      // },
      // {
      //   key: 'default-create-trigger-sql',
      //   title: '触发器创建SQL',
      //   type: PageType.CREATE_TRIGGER_SQL,
      //   isSaved: true
      // },
      // {
      //   key: 'default-create-synonym',
      //   title: '创建同义词',
      //   type: PageType.CREATE_SYNONYM,
      //   isSaved: true
      // },
      // {
      //   key: 'default-trigger',
      //   title: '触发器详情',
      //   type: PageType.TRIGGER,
      //   isSaved: true
      // },
      // {
      //   key: 'default-synonym',
      //   title: '同义词详情',
      //   type: PageType.SYNONYM,
      //   isSaved: true
      // },
      // {
      //   key: 'default-type',
      //   title: '类型详情',
      //   type: PageType.TYPE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-create-type',
      //   title: '创建类型',
      //   type: PageType.CREATE_TYPE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-sql-resultset-view',
      //   title: 'SQL结果集查看',
      //   type: PageType.SQL_RESULTSET_VIEW,
      //   isSaved: true
      // },
      // {
      //   key: 'default-batch-compile-function',
      //   title: '批量编译函数',
      //   type: PageType.BATCH_COMPILE_FUNCTION,
      //   isSaved: true
      // },
      // {
      //   key: 'default-batch-compile-package',
      //   title: '批量编译包',
      //   type: PageType.BATCH_COMPILE_PACKAGE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-batch-compile-procedure',
      //   title: '批量编译存储过程',
      //   type: PageType.BATCH_COMPILE_PROCEDURE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-batch-compile-trigger',
      //   title: '批量编译触发器',
      //   type: PageType.BATCH_COMPILE_TRIGGER,
      //   isSaved: true
      // },
      // {
      //   key: 'default-batch-compile-type',
      //   title: '批量编译类型',
      //   type: PageType.BATCH_COMPILE_TYPE,
      //   isSaved: true
      // },
      // {
      //   key: 'default-tutorial',
      //   title: '教程页',
      //   type: PageType.TUTORIAL,
      //   isSaved: true,
      //   params: { scriptType: PageType.SQL }
      // }
    ];
  }

  /** 初始化store */
  @action
  public async initStore() {
    this._saveDisposers.map((disposer) => {
      disposer();
    });
    this._saveDisposers = [];
    this._saveDisposers.push(await autoSave(this, 'pages', 'pages', []));
    this._saveDisposers.push(
      await autoSave(this, 'activePageKey', 'activePageKey', null)
    );

    // 如果pages为空，则设置默认页面数据
    if (!this.pages || this.pages.length === 0) {
      this.pages = this.getDefaultPages();
    }
  }
  /** 切换打开的page，更新一下URL */
  @action
  public async setActivePageKeyAndPushUrl(activePageKey: string | null) {
    await this.updateActiveKey(() => {
      return activePageKey;
    });
  }

  @action
  public async openPage(page: Page, insertHead?: boolean) {
    const { pageTitle, pageKey, pageParams, pageType } = page;
    const existed = !!this.pages.find((p) => p.key === pageKey);
    switch (pageType) {
      case PageType.SQL:
      case PageType.PL: {
        if (!existed) {
          const count = this.pages.filter((page) => {
            return page.type == pageType;
          }).length;
          if (count >= 32) {
            message.error(
              (pageType == PageType.PL ? 'PL' : 'SQL') +
                formatMessage({
                  id: 'odc.src.store.page.TheNumberOfWindowsCannot',
                  defaultMessage: '窗口不能超过 32 个'
                })
            );
            return;
          }
        }
        break;
      }
      default: {
      }
    }

    /** 未打开的page或者未保存的page，则push进pages。 */
    if (!existed) {
      const newPage = {
        key: pageKey,
        title: pageTitle,
        type: pageType,
        isSaved: true,
        params: pageParams
      };

      if (insertHead) {
        this.pages = [].concat(newPage).concat(this.pages);
      } else {
        this.pages = this.pages.concat(newPage);
      }
    }
    if (open) {
      await this.setActivePageKeyAndPushUrl(pageKey);
    }
    await this.updatePage(pageKey, undefined, pageParams);
  }

  /** New!!!更新page */
  @action
  public async updatePage(
    targetPageKey: string,
    options: IPageOptions = {},
    pageData: any = {}
  ) {
    const { title, isSaved, startSaving, updateKey } = options;
    await this.updatePages(async (pages) => {
      const newPages = [];
      for (let i = 0; i < pages.length; i++) {
        const p = { ...pages[i] };
        if (p.key === targetPageKey) {
          // 更新标题
          if (title) {
            p.title = title;
          }

          // 更新参数
          p.params = {
            ...p.params,
            ...pageData
          };

          // 更新页面状态
          if (isSaved !== undefined) {
            p.isSaved = isSaved;
          }
          // 更新页面状态
          if (startSaving !== undefined) {
            p.startSaving = startSaving;
          }

          // 更新 pageKey
          if (updateKey) {
            p.key = updateKey;
            await this.setActivePageKeyAndPushUrl(p.key);
          }
        }
        newPages.push(p);
      }
      return newPages;
    });
  }

  @action
  public updatePageColor(title: string, isDisabled: boolean) {
    const targetPage = this.pages.find((page: IPage) => page.title === title);
    if (targetPage) {
      this.updatePage(targetPage.key, undefined, {
        isDisabled
      });
    }
  }

  @action
  public async close(targetPageKey: string) {
    let activeKey = this.activePageKey;
    let lastIndex = -1;
    this.pages.forEach((page, i) => {
      if (page.key === targetPageKey) {
        lastIndex = i - 1;
      }
    });
    const pages = this.pages.filter((page) => page.key !== targetPageKey);
    if (pages.length && activeKey === targetPageKey) {
      activeKey = lastIndex >= 0 ? pages[lastIndex].key : pages[0].key;
    }
    await this.updatePages(async (oldPages) => {
      return pages;
    });
    await this.setActivePageKeyAndPushUrl(activeKey);
  }

  /** 清除全部页面，适用于返回连接列表页完全退出工作台的场景
   *
   * updated: 保留页面的数据，48小时过期
   */
  @action
  public async clear() {
    await this.updatePages(async (pages) => {
      return [];
    });
    await this.updateActiveKey(() => {
      return null;
    });
  }

  /** 部分常驻页面不应该被清除，也保留SQL和匿名快 */
  @action
  public async clearExceptResidentPages() {
    // 只保留常驻页面
    await this.updatePages(async (pages) => {
      return pages.filter(
        (p) =>
          p.params.isDocked ||
          [PageType.SQL, PageType.OB_CLIENT, PageType.TASKS].includes(p.type) ||
          (p.type == PageType.PL && !p.params?.plName)
      );
    });
    await this.updateActiveKey((pages, activeKey) => {
      return pages[0]?.key;
    });
  }

  @action
  public async save(targetPageKey: string) {
    await this.updatePageByKey(targetPageKey, (oldPage) => {
      return {
        ...oldPage,
        startSaving: false,
        isSaved: true
      };
    });
  }

  @action
  public startSaving(targetPageKey: string) {
    this.updatePageByKey(targetPageKey, (oldPage) => {
      return {
        ...oldPage,
        startSaving: true
      };
    });
  }

  @action
  public cancelSaving(targetPageKey: string) {
    this.updatePageByKey(targetPageKey, (oldPage) => {
      return {
        ...oldPage,
        startSaving: false
      };
    });
  }

  @action
  public setPageUnsaved(targetPageKey: string) {
    this.updatePageByKey(targetPageKey, (oldPage) => {
      return {
        ...oldPage,
        isSaved: false
      };
    });
  }

  /** 更新单个page */
  private async updatePageByKey(
    pageKey: string,
    getNewPage: (oldPage: IPage) => IPage
  ) {
    this.pages = this.pages.map((p, i) => {
      if (p.key === pageKey) {
        return getNewPage(p);
      }
      return p;
    });
  }

  /** 更新多个page */
  public async updatePages(
    getNewPages: (oldPages: IPage[]) => Promise<IPage[]>
  ) {
    this.pages = await getNewPages(this.pages);
  }

  /** 更新activeKey */
  private async updateActiveKey(
    fn: (pages: IPage[], oldActiveKey: any) => any
  ) {
    this.activePageKey = fn(this.pages, this.activePageKey);
    const pageType = this.getPageByKey(this.activePageKey)?.type;
    pageType && tracert.expoPage(pageType);
  }

  public async patchMetaStoreUserId() {
    const userId = login.user?.id;
    if (isNil(userId)) {
      return;
    }
    const result = await getMetaStoreInstance().getAllItem();
    for (const [key, value] of result) {
      if (isNil(value?.userId)) {
        await getMetaStoreInstance().setItem(key, { ...value, userId });
      }
    }
  }

  @action
  public restore(pages: IPage[]) {
    // TODO: 从缓存中恢复全部页面
  }
}

export default new PageStore();
