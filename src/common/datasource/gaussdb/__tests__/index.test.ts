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

    it('TestFeatures_GaussDB_sqlconsole_false', () => {
      // CR-8 - workbench SQL console is gated off until distributed SQL
      // parsing parity is verified. Identical to PG.
      const entry = gaussdbItems[ConnectType.GAUSSDB];
      expect(entry.features.sqlconsole).toBe(false);
    });

    it('TestFeatures_GaussDB_sessionManage_false', () => {
      // CR-8 - session manage tab disabled; identical to PG.
      const entry = gaussdbItems[ConnectType.GAUSSDB];
      expect(entry.features.sessionManage).toBe(false);
    });

    it('TestFeatures_GaussDB_sqlExplain_false', () => {
      // CR-8 - SQL Explain disabled (GaussDB explain plan format diverges
      // from PG). Identical to PG.
      const entry = gaussdbItems[ConnectType.GAUSSDB];
      expect(entry.features.sqlExplain).toBe(false);
    });

    it('TestFeatures_GaussDB_equals_PostgreSQL', () => {
      // CR-8 deep-equal contract: GaussDB and PG must share the same
      // workbench-gating features object so we never silently diverge
      // in production. A future GaussDB-only flip MUST come with a
      // design doc update + this test failing on purpose.
      const gauss = gaussdbItems[ConnectType.GAUSSDB];
      const pg = pgItems[ConnectType.PG];
      expect(gauss.features).toEqual(pg.features);
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
      expect(pg.connection.address.items).toEqual(['ip', 'port', 'catalogName']);
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
