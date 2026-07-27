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

import { getDataSourceModeConfig } from '@/common/datasource';
import { TaskType } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import setting from '@/store/setting';
import { ResourceNodeType } from '../../type';

export function isSupportExport(session: SessionStore) {
  return (
    setting.enableDBExport &&
    getDataSourceModeConfig(
      session?.connection?.type
    )?.features?.task?.includes(TaskType.EXPORT)
  );
}

export function isSupportPLEdit(session: SessionStore) {
  return getDataSourceModeConfig(session?.odcDatabase?.dataSource?.type)
    ?.features?.plEdit;
}

/**
 * CSVW: always hide — used by config items that are never allowed on non-table.
 */
export function isHiddenForCsvwNonTable(): boolean {
  return true;
}

/** Non-table resource-tree node types whose context menu is view/refresh only. */
export const CSVW_NONTABLE_MENU_TYPES: ReadonlySet<ResourceNodeType> = new Set([
  ResourceNodeType.ViewRoot,
  ResourceNodeType.View,
  ResourceNodeType.ViewColumnRoot,
  ResourceNodeType.ViewColumn,
  ResourceNodeType.FunctionRoot,
  ResourceNodeType.Function,
  ResourceNodeType.FunctionParamRoot,
  ResourceNodeType.FunctionParam,
  ResourceNodeType.FunctionVariableRoot,
  ResourceNodeType.FunctionVariable,
  ResourceNodeType.FunctionReturnTypeRoot,
  ResourceNodeType.FunctionReturnType,
  ResourceNodeType.ProcedureRoot,
  ResourceNodeType.Procedure,
  ResourceNodeType.ProcedureParamRoot,
  ResourceNodeType.ProcedureParam,
  ResourceNodeType.ProcedureVariableRoot,
  ResourceNodeType.ProcedureVariable,
  ResourceNodeType.PackageRoot,
  ResourceNodeType.Package,
  ResourceNodeType.PackageHead,
  ResourceNodeType.PackageHeadVariableRoot,
  ResourceNodeType.PackageHeadVariable,
  ResourceNodeType.PackageHeadProgramRoot,
  ResourceNodeType.PackageBody,
  ResourceNodeType.PackageBodyVariableRoot,
  ResourceNodeType.PackageBodyVariable,
  ResourceNodeType.PackageBodyProgramRoot,
  ResourceNodeType.PackageHeadFunction,
  ResourceNodeType.PackageHeadProcedure,
  ResourceNodeType.PackageBodyFunction,
  ResourceNodeType.PackageBodyProcedure,
  ResourceNodeType.TriggerRoot,
  ResourceNodeType.Trigger,
  ResourceNodeType.SequenceRoot,
  ResourceNodeType.Sequence,
  ResourceNodeType.SynonymRoot,
  ResourceNodeType.Synonym,
  ResourceNodeType.PublicSynonymRoot,
  ResourceNodeType.PublicSynonym,
  ResourceNodeType.TypeRoot,
  ResourceNodeType.Type,
  ResourceNodeType.TypeVariableRoot,
  ResourceNodeType.TypeVariable,
  ResourceNodeType.TypeProgramRoot,
  ResourceNodeType.TypeFunction,
  ResourceNodeType.TypeProcedure,
  ResourceNodeType.ExternalTableRoot,
  ResourceNodeType.ExternalTable,
  ResourceNodeType.ExternalTableColumnRoot,
  ResourceNodeType.MaterializedViewRoot,
  ResourceNodeType.MaterializedView,
  ResourceNodeType.MaterializedViewColumnRoot,
  ResourceNodeType.MaterializedViewColumn,
  ResourceNodeType.MaterializedViewIndexRoot,
  ResourceNodeType.MaterializedViewIndex,
  ResourceNodeType.MaterializedViewPartitionRoot,
  ResourceNodeType.MaterializedViewPartition,
  ResourceNodeType.MaterializedViewConstraintRoot,
  ResourceNodeType.MaterializedViewConstraint
]);

export function isCsvwNonTableMenuType(
  type: ResourceNodeType | string | undefined | null
): boolean {
  if (type === undefined || type === null || type === '') {
    return false;
  }
  return CSVW_NONTABLE_MENU_TYPES.has(type as ResourceNodeType);
}

/**
 * Allowed menu keys for CSVW non-table objects: view / refresh only.
 */
export function isCsvwNonTableMenuAllowed(
  key: string | undefined | null
): boolean {
  if (!key) {
    return false;
  }
  const k = String(key).toUpperCase();
  if (k === 'REFRESH' || k.startsWith('REFRESH_')) {
    return true;
  }
  if (k === 'VIEW' || k === 'OVERVIEW' || k.startsWith('OVERVIEW_')) {
    return true;
  }
  if (
    k === 'BROWSER_SCHEMA' ||
    k === 'BROWSER_DATA' ||
    k === 'BROWSER_COLUMNS' ||
    k === 'BROWSER_INDEXES' ||
    k === 'BROWSER_PARTITIONS' ||
    k === 'BROWSER_CONSTRAINTS' ||
    k === 'BROWSER_DDL'
  ) {
    return true;
  }
  return false;
}

/** Hide when key is not view/refresh (for CSVW non-table menus). */
export function isHiddenForCsvwNonTableAction(key: string): boolean {
  return !isCsvwNonTableMenuAllowed(key);
}

/**
 * CSVW: non-table detail toolbars are view/refresh only
 * (hide edit / enable-disable / compile / run entry points).
 */
export function isCsvwNonTableDetailReadonly(): boolean {
  return true;
}
