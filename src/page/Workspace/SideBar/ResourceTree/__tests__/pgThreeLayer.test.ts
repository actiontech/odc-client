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

/**
 * Unit tests for ResourceTree/pgThreeLayer.tsx (AC-UT-FE-001)
 *
 * 覆盖：
 *   1. 三层分组：ConnectType.PG + 点号库名 → Database(catalog)→Schema→对象
 *   2. 非 PG / 无点号：原样扁平 passthrough
 *   3. 定位展开：getPgCatalogExpandKey 返回 PgCatalog-{scope}-{dsId}-{catalog} 中间键
 *   4. 外层分组：同 DS 同 catalog 跨 project 的 key 不碰撞
 */

jest.mock('@ant-design/icons', () => ({
  __esModule: true,
  default: function MockIcon() {
    return null;
  }
}));

jest.mock('@/svgr/database.svg', () => ({
  ReactComponent: function MockDatabaseSvg() {
    return null;
  }
}));

// Avoid pulling datasource/intl/SVG chain via @/util/connection → utils.
jest.mock('@/util/connection', () => ({
  isPgDataDataSource: (connectType: string) => connectType === 'POSTGRESQL'
}));

import { ConnectType } from '@/d.ts';
import {
  getPgCatalogExpandKey,
  isPgSystemSchema,
  mapDatabasesWithPgThreeLayer,
  parsePgCatalogSchemaName,
  pgCatalogNodeKey,
  shouldFoldPgThreeLayer
} from '@/page/Workspace/SideBar/ResourceTree/pgThreeLayer';
import { ResourceNodeType } from '@/page/Workspace/SideBar/ResourceTree/type';

function makeDb(partial: {
  id: number;
  name: string;
  connectType?: ConnectType;
  dataSource?: { id: number; type: ConnectType };
  project?: { id: number; name?: string };
}) {
  const { dataSource, connectType, project, ...rest } = partial;
  return {
    existed: true,
    environment: { id: 1 },
    connectType: connectType || ConnectType.PG,
    dataSource: {
      id: 100,
      type: ConnectType.PG,
      ...(dataSource || {})
    },
    project: project || undefined,
    ...rest
  } as any;
}

function resolveDbNode(db: any) {
  return {
    title: db.name,
    key: db.id,
    isLeaf: false,
    type: ResourceNodeType.Database,
    data: db,
    children: [
      {
        title: '表',
        key: `${db.id}-${db.name}-table`,
        isLeaf: false,
        type: ResourceNodeType.TableRoot,
        data: db
      }
    ]
  };
}

describe('pgThreeLayer parse / gate helpers', () => {
  const parseCases: Array<{
    name: string;
    input?: string;
    expected: { catalog: string; schema: string } | null;
  }> = [
    {
      name: 'catalog.schema',
      input: 'testdb.biz_schema',
      expected: { catalog: 'testdb', schema: 'biz_schema' }
    },
    {
      name: 'catalog.public',
      input: 'testdb.public',
      expected: { catalog: 'testdb', schema: 'public' }
    },
    { name: 'no dot', input: 'testdb', expected: null },
    { name: 'empty', input: '', expected: null },
    { name: 'undefined', input: undefined, expected: null },
    { name: 'leading dot', input: '.public', expected: null },
    { name: 'trailing dot', input: 'testdb.', expected: null }
  ];

  parseCases.forEach(({ name, input, expected }) => {
    it(`parsePgCatalogSchemaName: ${name}`, () => {
      expect(parsePgCatalogSchemaName(input)).toEqual(expected);
    });
  });

  const systemCases = [
    { schema: 'pg_catalog', expected: true },
    { schema: 'information_schema', expected: true },
    { schema: 'pg_toast', expected: true },
    { schema: 'pg_toast_123', expected: true },
    { schema: 'pg_temp', expected: true },
    { schema: 'pg_temp_1', expected: true },
    { schema: 'public', expected: false },
    { schema: 'biz_schema', expected: false }
  ];

  systemCases.forEach(({ schema, expected }) => {
    it(`isPgSystemSchema(${schema}) === ${expected}`, () => {
      expect(isPgSystemSchema(schema)).toBe(expected);
    });
  });
});

describe('pgThreeLayer three-layer grouping (AC-UT-FE-001)', () => {
  it('folds PG dotted databases into Database → Schema → object folder', () => {
    const databases = [
      makeDb({ id: 1, name: 'testdb.public' }),
      makeDb({ id: 2, name: 'testdb.biz_schema' }),
      makeDb({ id: 3, name: 'testdb_pg_schema.public' })
    ];

    const tree = mapDatabasesWithPgThreeLayer(databases, resolveDbNode);

    expect(tree).toHaveLength(2);
    expect(tree[0].type).toBe(ResourceNodeType.PgCatalogGroup);
    expect(tree[0].title).toBe('testdb');
    expect(tree[0].key).toBe(pgCatalogNodeKey(100, 'testdb', 'none'));
    expect(tree[0].children!.map((c) => c.title)).toEqual([
      'public',
      'biz_schema'
    ]);
    expect((tree[0].children![0] as any).data.name).toBe('testdb.public');
    expect(tree[0].children![0].children![0].title).toBe('表');

    expect(tree[1].title).toBe('testdb_pg_schema');
    expect(tree[1].children!.map((c) => c.title)).toEqual(['public']);
  });

  it('hides PG system schemas from the folded tree', () => {
    const databases = [
      makeDb({ id: 1, name: 'testdb.public' }),
      makeDb({ id: 2, name: 'testdb.pg_catalog' }),
      makeDb({ id: 3, name: 'testdb.information_schema' })
    ];

    const tree = mapDatabasesWithPgThreeLayer(databases, resolveDbNode);
    expect(tree).toHaveLength(1);
    expect(tree[0].children!.map((c) => c.title)).toEqual(['public']);
  });

  it('isolates same catalog name across different dataSources', () => {
    const databases = [
      makeDb({
        id: 1,
        name: 'testdb.public',
        dataSource: { id: 10, type: ConnectType.PG }
      }),
      makeDb({
        id: 2,
        name: 'testdb.public',
        dataSource: { id: 20, type: ConnectType.PG }
      })
    ];

    const tree = mapDatabasesWithPgThreeLayer(databases, resolveDbNode);
    expect(tree).toHaveLength(2);
    expect(tree[0].key).toBe(pgCatalogNodeKey(10, 'testdb', 'none'));
    expect(tree[1].key).toBe(pgCatalogNodeKey(20, 'testdb', 'none'));
  });

  it('isolates same catalog across projects via groupScope (AC-RV-FE-002)', () => {
    const databases = [
      makeDb({
        id: 1,
        name: 'testdb.public',
        project: { id: 701 },
        dataSource: { id: 100, type: ConnectType.PG }
      }),
      makeDb({
        id: 2,
        name: 'testdb.public',
        project: { id: 702 },
        dataSource: { id: 100, type: ConnectType.PG }
      })
    ];
    // Flat list without explicit scope → each db uses project.id
    const flat = mapDatabasesWithPgThreeLayer(databases, resolveDbNode);
    expect(flat).toHaveLength(2);
    expect(flat[0].key).toBe(pgCatalogNodeKey(100, 'testdb', 701));
    expect(flat[1].key).toBe(pgCatalogNodeKey(100, 'testdb', 702));
    expect(flat[0].key).not.toBe(flat[1].key);

    // Explicit outer groupScope (as ResourceTree passes groupItem.mapId)
    const underProject701 = mapDatabasesWithPgThreeLayer(
      [databases[0]],
      resolveDbNode,
      701
    );
    expect(underProject701[0].key).toBe(pgCatalogNodeKey(100, 'testdb', 701));
  });
});

describe('pgThreeLayer non-PG / undotted passthrough (AC-UT-FE-001)', () => {
  const passthroughCases = [
    {
      name: 'MySQL database stays flat',
      db: makeDb({
        id: 11,
        name: 'mysql_db',
        connectType: ConnectType.MYSQL,
        dataSource: { id: 200, type: ConnectType.MYSQL }
      })
    },
    {
      name: 'OB MySQL stays flat',
      db: makeDb({
        id: 12,
        name: 'ob_db',
        connectType: ConnectType.OB_MYSQL,
        dataSource: { id: 201, type: ConnectType.OB_MYSQL }
      })
    },
    {
      name: 'PG without dotted name stays flat',
      db: makeDb({ id: 13, name: 'legacy_testdb' })
    },
    {
      name: 'GaussDB dotted name does not fold',
      db: makeDb({
        id: 14,
        name: 'gauss.schema',
        connectType: ConnectType.GAUSSDB,
        dataSource: { id: 202, type: ConnectType.GAUSSDB }
      })
    }
  ];

  passthroughCases.forEach(({ name, db }) => {
    it(name, () => {
      expect(shouldFoldPgThreeLayer(db)).toBe(false);
      const tree = mapDatabasesWithPgThreeLayer([db], resolveDbNode);
      expect(tree).toHaveLength(1);
      expect(tree[0].type).toBe(ResourceNodeType.Database);
      expect(tree[0].title).toBe(db.name);
      expect(tree[0].key).toBe(db.id);
    });
  });

  it('mixes folded PG catalogs with non-PG passthrough nodes', () => {
    const databases = [
      makeDb({ id: 1, name: 'testdb.public' }),
      makeDb({
        id: 2,
        name: 'mysql_db',
        connectType: ConnectType.MYSQL,
        dataSource: { id: 300, type: ConnectType.MYSQL }
      })
    ];
    const tree = mapDatabasesWithPgThreeLayer(databases, resolveDbNode);
    expect(tree[0].type).toBe(ResourceNodeType.PgCatalogGroup);
    expect(tree[1].type).toBe(ResourceNodeType.Database);
    expect(tree[1].title).toBe('mysql_db');
  });
});

describe('pgThreeLayer locate expand PgCatalog intermediate key (AC-UT-FE-001)', () => {
  it('returns PgCatalog-{scope}-{dataSourceId}-{catalog} for foldable PG db', () => {
    const db = makeDb({ id: 1, name: 'testdb.biz_schema' });
    expect(getPgCatalogExpandKey(db)).toBe('PgCatalog-none-100-testdb');
    expect(getPgCatalogExpandKey(db)).toBe(
      pgCatalogNodeKey(db.dataSource.id, 'testdb', 'none')
    );
    expect(getPgCatalogExpandKey(db, 700300)).toBe(
      pgCatalogNodeKey(db.dataSource.id, 'testdb', 700300)
    );
  });

  it('returns null for non-foldable / system / missing db', () => {
    expect(getPgCatalogExpandKey(undefined)).toBeNull();
    expect(
      getPgCatalogExpandKey(makeDb({ id: 1, name: 'legacy_testdb' }))
    ).toBeNull();
    expect(
      getPgCatalogExpandKey(
        makeDb({
          id: 2,
          name: 'mysql.db',
          connectType: ConnectType.MYSQL,
          dataSource: { id: 9, type: ConnectType.MYSQL }
        })
      )
    ).toBeNull();
    expect(
      getPgCatalogExpandKey(makeDb({ id: 3, name: 'testdb.pg_catalog' }))
    ).toBeNull();
  });

  it('expand key matches catalog node key used by mapDatabasesWithPgThreeLayer', () => {
    const db = makeDb({ id: 1, name: 'testdb.public' });
    const tree = mapDatabasesWithPgThreeLayer([db], resolveDbNode);
    expect(tree[0].key).toBe(getPgCatalogExpandKey(db));
  });
});
