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

import { ConnectType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import Icon from '@ant-design/icons';
import { ReactComponent as DatabaseSvg } from '@/svgr/database.svg';
import { ResourceNodeType, TreeDataNode } from './type';
import { isPgDataDataSource } from '@/util/connection';

/** Align with product design: hide PG system schemas in the object tree. */
const PG_SYSTEM_SCHEMA_RE =
  /^(pg_catalog|information_schema|pg_toast($|_.*)|pg_temp($|_.*)|pg_toast_temp($|_.*))$/i;

export function parsePgCatalogSchemaName(
  name?: string
): { catalog: string; schema: string } | null {
  if (!name || !name.includes('.')) {
    return null;
  }
  const dot = name.indexOf('.');
  if (dot <= 0 || dot === name.length - 1) {
    return null;
  }
  return {
    catalog: name.slice(0, dot),
    schema: name.slice(dot + 1)
  };
}

export function isPgSystemSchema(schema: string): boolean {
  return PG_SYSTEM_SCHEMA_RE.test(String(schema || '').trim());
}

/**
 * Path A fold gate: only PostgreSQL databases whose name is already
 * `<catalog>.<schema>` participate in three-layer grouping.
 */
export function shouldFoldPgThreeLayer(db: IDatabase): boolean {
  const connectType = db?.connectType || db?.dataSource?.type;
  if (!isPgDataDataSource(connectType as ConnectType)) {
    return false;
  }
  return !!parsePgCatalogSchemaName(db?.name);
}

/**
 * Virtual Catalog node key.
 * Includes outer groupScope (project / env / … mapId) so the same
 * dataSource+catalog under different parents never collide in Ant Tree.
 */
export function pgCatalogNodeKey(
  dataSourceId: number | string | undefined,
  catalog: string,
  groupScope?: string | number | null
) {
  const scope =
    groupScope === undefined || groupScope === null || groupScope === ''
      ? 'none'
      : groupScope;
  return `PgCatalog-${scope}-${dataSourceId ?? 'na'}-${catalog}`;
}

/** Default scope when caller does not pass an outer group mapId. */
export function resolvePgCatalogGroupScope(
  db?: IDatabase,
  explicitScope?: string | number | null
): string | number {
  if (
    explicitScope !== undefined &&
    explicitScope !== null &&
    explicitScope !== ''
  ) {
    return explicitScope;
  }
  return db?.project?.id ?? 'none';
}

/**
 * Expand-key for the virtual Database (catalog) node above a folded schema.
 * Returns null when the db is not in PG three-layer fold mode.
 */
export function getPgCatalogExpandKey(
  db?: IDatabase,
  groupScope?: string | number | null
): string | null {
  if (!db || !shouldFoldPgThreeLayer(db)) {
    return null;
  }
  const parsed = parsePgCatalogSchemaName(db.name);
  if (!parsed || isPgSystemSchema(parsed.schema)) {
    return null;
  }
  return pgCatalogNodeKey(
    db.dataSource?.id,
    parsed.catalog,
    resolvePgCatalogGroupScope(db, groupScope)
  );
}

/**
 * Map a flat database list into tree children: PG dotted names become
 * Catalog → Schema(title=schema only); others stay as-is.
 * Catalog buckets are keyed by groupScope+dataSourceId+catalog so multi-DS /
 * multi-project groups never merge or collide same-named catalogs.
 *
 * @param groupScope outer group mapId (project/dataSource/…); when omitted,
 *   each db uses `project.id ?? 'none'`.
 */
export function mapDatabasesWithPgThreeLayer(
  databases: IDatabase[] | undefined,
  resolveDbNode: (db: IDatabase) => TreeDataNode | undefined,
  groupScope?: string | number | null
): TreeDataNode[] {
  if (!databases?.length) {
    return [];
  }

  const passthrough: TreeDataNode[] = [];
  const catalogOrder: string[] = [];
  const catalogMap = new Map<
    string,
    {
      catalog: string;
      dataSourceId?: number;
      groupScope: string | number;
      schemas: TreeDataNode[];
    }
  >();

  for (const db of databases) {
    if (!shouldFoldPgThreeLayer(db)) {
      const node = resolveDbNode(db);
      if (node) {
        passthrough.push(node);
      }
      continue;
    }

    const parsed = parsePgCatalogSchemaName(db.name);
    if (!parsed || isPgSystemSchema(parsed.schema)) {
      continue;
    }

    const base = resolveDbNode(db);
    if (!base) {
      continue;
    }
    const schemaNode: TreeDataNode = {
      ...base,
      title: parsed.schema
    };

    const dataSourceId = db.dataSource?.id;
    const scope = resolvePgCatalogGroupScope(db, groupScope);
    const bucketKey = `${scope}::${dataSourceId ?? 'na'}::${parsed.catalog}`;
    let bucket = catalogMap.get(bucketKey);
    if (!bucket) {
      bucket = {
        catalog: parsed.catalog,
        dataSourceId,
        groupScope: scope,
        schemas: []
      };
      catalogMap.set(bucketKey, bucket);
      catalogOrder.push(bucketKey);
    }
    bucket.schemas.push(schemaNode);
  }

  const catalogNodes: TreeDataNode[] = catalogOrder.map((bucketKey) => {
    const bucket = catalogMap.get(bucketKey)!;
    return {
      title: bucket.catalog,
      key: pgCatalogNodeKey(
        bucket.dataSourceId,
        bucket.catalog,
        bucket.groupScope
      ),
      isLeaf: bucket.schemas.length === 0,
      type: ResourceNodeType.PgCatalogGroup,
      data: {
        catalog: bucket.catalog,
        dataSourceId: bucket.dataSourceId,
        groupScope: bucket.groupScope
      },
      icon: (
        <Icon
          component={DatabaseSvg}
          style={{ color: '#3FA3FF', fontSize: 14 }}
        />
      ),
      children: bucket.schemas
    };
  });

  return [...catalogNodes, ...passthrough];
}
