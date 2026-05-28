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

// Stub the heavy oceanbase ColumnExtra React tree out so we can import the
// datasource entries in a pure JSDOM/jest environment without pulling in
// dozens of page components (Workspace/CreateTable/...). Both pg/index.tsx
// and gaussdb/index.tsx reference the same module from the same relative
// path, so a single mock factory is sufficient for both files.
jest.mock('../../oceanbase/MySQLColumnExtra', () => ({
  __esModule: true,
  default: function MySQLColumnExtraStub() {
    return null;
  }
}));

import { ConnectType, ConnectionMode, AuditEventDialectType } from '@/d.ts';
import { IDataSourceType } from '@/d.ts/datasource';
import gaussdbItems from '../index';
import pgItems from '../../pg';

describe('common/datasource/gaussdb', () => {
  describe('4 enum files contain an independent GAUSSDB value', () => {
    // CR-7 hard constraint - GaussDB must NOT reuse the PostgreSQL string
    // alias. Each of the four enums must carry an independent member whose
    // literal value differs from the PostgreSQL one.

    it('TestEnum_ConnectType_GAUSSDB_independent', () => {
      expect(ConnectType.GAUSSDB).toBeDefined();
      expect(ConnectType.GAUSSDB).toBe('GAUSSDB');
      expect(ConnectType.GAUSSDB).not.toBe(ConnectType.PG);
    });

    it('TestEnum_ConnectionMode_GAUSSDB_independent', () => {
      expect(ConnectionMode.GAUSSDB).toBeDefined();
      expect(ConnectionMode.GAUSSDB).toBe('GAUSSDB');
      expect(ConnectionMode.GAUSSDB).not.toBe(ConnectionMode.PG);
    });

    it('TestEnum_AuditEventDialectType_GAUSSDB_independent', () => {
      expect(AuditEventDialectType.GAUSSDB).toBeDefined();
      expect(AuditEventDialectType.GAUSSDB).toBe('GAUSSDB');
      expect(AuditEventDialectType.GAUSSDB).not.toBe(AuditEventDialectType.PG);
    });

    it('TestEnum_IDataSourceType_GaussDB_independent', () => {
      expect(IDataSourceType.GaussDB).toBeDefined();
      expect(IDataSourceType.GaussDB).toBe('gaussdb');
      expect(IDataSourceType.GaussDB).not.toBe(IDataSourceType.PG);
    });
  });

  describe('gaussdb/index.tsx entry shape', () => {
    it('TestRegistry_contains_GaussDB_entry', () => {
      // The gaussdb datasource module must export a record keyed by
      // ConnectType.GAUSSDB. When haveOCP() is true the entry is deleted
      // at module-load time; in the jest env haveOCP() defaults to false
      // so the entry must be present.
      const entry = gaussdbItems[ConnectType.GAUSSDB];
      expect(entry).toBeDefined();
      expect(entry).not.toBeNull();
    });

    it('TestFeatures_GaussDB_sqlconsole_true_post_fix_20260528', () => {
      // Fix-Session-20260528-090430: enable SQL Console for GaussDB after
      // case-4-1-1 / case-4-2-1 / case-3-3-x / case-4-x web regression
      // already proved the OG Console path end-to-end (report_index.md).
      // Intentional divergence from PG.
      const entry = gaussdbItems[ConnectType.GAUSSDB];
      expect(entry.features.sqlconsole).toBe(true);
    });

    it('TestFeatures_GaussDB_sessionManage_true_post_fix_20260528', () => {
      // Fix-Session-20260528-090430: GaussDBSessionExtension exposes
      // pg_cancel_backend / pg_terminate_backend; backend is ready, so the
      // workbench session-management tab can be enabled. case-4-6-1 in
      // report_index.md proves pg_stat_activity is queryable.
      const entry = gaussdbItems[ConnectType.GAUSSDB];
      expect(entry.features.sessionManage).toBe(true);
    });

    it('TestFeatures_GaussDB_sqlExplain_true_post_fix_20260528', () => {
      // Fix-Session-20260528-090430: GaussDB / openGauss support PG-style
      // EXPLAIN / EXPLAIN ANALYZE; Task-005-FIX (odc de8e287) already routes
      // PG-family through the right SqlCommentProcessor split path used
      // by the explain action.
      const entry = gaussdbItems[ConnectType.GAUSSDB];
      expect(entry.features.sqlExplain).toBe(true);
    });

    it('TestFeatures_GaussDB_groupResourceTree_true', () => {
      // Task-004-FIX root cause: DatabaseTree filter at
      // page/Workspace/SideBar/ResourceTree/DatabaseTree/index.tsx:L43-49
      // drops every physical database whose datasource type has
      // features.groupResourceTree === false. GaussDB must therefore
      // enable groupResourceTree so its databases appear in the ODC
      // workbench left-side tree (REQ-2 EARS-2.1 / case 2.1.1, 2.2.1,
      // 2.1.2, 2.2.2). Diverges from PG on purpose.
      const entry = gaussdbItems[ConnectType.GAUSSDB];
      expect(entry.features.groupResourceTree).toBe(true);
    });

    it('TestFeatures_GaussDB_diverges_from_PostgreSQL_on_multiple_flags', () => {
      // After Fix-Session-20260528-090430 the GaussDB entry intentionally
      // diverges from PG on FOUR flags: groupResourceTree (Task-004-FIX)
      // plus sqlconsole / sessionManage / sqlExplain (Fix-20260528-090430).
      // The remaining features must still match PG so accidental flips
      // surface immediately in CI.
      const gauss = gaussdbItems[ConnectType.GAUSSDB];
      const pg = pgItems[ConnectType.PG];
      expect(gauss.features.groupResourceTree).toBe(true);
      expect(pg.features.groupResourceTree).toBe(false);
      expect(gauss.features.sqlconsole).toBe(true);
      expect(pg.features.sqlconsole).toBe(false);
      expect(gauss.features.sessionManage).toBe(true);
      expect(pg.features.sessionManage).toBe(false);
      expect(gauss.features.sqlExplain).toBe(true);
      expect(pg.features.sqlExplain).toBe(false);
      // Every feature except the four divergence flags must remain identical.
      const {
        groupResourceTree: _g,
        sqlconsole: _sc,
        sessionManage: _sm,
        sqlExplain: _se,
        ...gaussRest
      } = gauss.features;
      const {
        groupResourceTree: _gp,
        sqlconsole: _scp,
        sessionManage: _smp,
        sqlExplain: _sep,
        ...pgRest
      } = pg.features;
      expect(gaussRest).toEqual(pgRest);
    });

    it('TestPg_entry_unchanged', () => {
      // EARS-7.4 / KF-3 hard constraint: PG entry must remain identical
      // to its prior shape. We snapshot the public attributes here so any
      // accidental edit of pg/index.tsx during a GaussDB change set will
      // surface immediately in CI.
      const pg = pgItems[ConnectType.PG];
      expect(pg.connection.account).toBe(true);
      expect(pg.connection.sys).toBe(false);
      expect(pg.connection.ssl).toBe(false);
      expect(pg.connection.disableURLParse).toBe(true);
      expect(pg.connection.jdbcDoc).toBe(
        'https://jdbc.postgresql.org/documentation/use/'
      );
      expect(pg.connection.address.items).toEqual([
        'ip',
        'port',
        'catalogName'
      ]);
      expect(pg.features.sqlconsole).toBe(false);
      expect(pg.features.sessionManage).toBe(false);
      expect(pg.features.sqlExplain).toBe(false);
      expect(pg.features.recycleBin).toBe(false);
      expect(pg.features.obclient).toBe(false);
      expect(pg.features.sessionParams).toBe(false);
      expect(pg.features.groupResourceTree).toBe(false);
      expect(pg.schema.innerSchema).toEqual(['postgres']);
      expect(pg.sql.language).toBe('mysql');
      expect(pg.sql.escapeChar).toBe('"');
      expect(pg.sql.caseSensitivity).toBe(true);
    });

    it('TestRegistry_GaussDB_entry_snapshot', () => {
      // Snapshot the full gaussdb entry. This is the per-file independent
      // snapshot (no shared snapshot file with pg/__tests__) requested by
      // todo.md Task-D03 §5.2: gaussdb-only snapshot, pg snapshots
      // untouched.
      const entry = gaussdbItems[ConnectType.GAUSSDB];
      expect({
        connection: entry.connection,
        features: entry.features,
        schema: { innerSchema: entry.schema.innerSchema },
        sql: entry.sql
      }).toMatchSnapshot();
    });
  });
});
