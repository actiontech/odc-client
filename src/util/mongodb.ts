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

import { ConnectType, DragInsertType } from '@/d.ts';

const VALID_COLLECTION_NAME = /^[A-Za-z_$][\w$]*$/;

export function formatMongoCollectionRef(collectionName: string): string {
  if (!collectionName) {
    return 'db.collection';
  }
  if (VALID_COLLECTION_NAME.test(collectionName)) {
    return `db.${collectionName}`;
  }
  return `db.getCollection(${JSON.stringify(collectionName)})`;
}

export function generateMongoCopyText(
  collectionName: string,
  copyType: DragInsertType,
  columnNames: string[] = []
): string {
  const collectionRef = formatMongoCollectionRef(collectionName);
  const fields = columnNames.filter(Boolean);

  switch (copyType) {
    case DragInsertType.NAME:
      return collectionName;
    case DragInsertType.SELECT:
      return `${collectionRef}.find({})`;
    case DragInsertType.INSERT: {
      if (!fields.length) {
        return `${collectionRef}.insertOne({ field: \${1:expr} })`;
      }
      const documentFields = fields
        .map((field, index) => `${field}: \${${index + 1}:expr}`)
        .join(', ');
      return `${collectionRef}.insertOne({ ${documentFields} })`;
    }
    case DragInsertType.UPDATE:
      return `${collectionRef}.updateOne({ \${1:filter} }, { $set: { \${2:field: value} } })`;
    case DragInsertType.DELETE:
      return `${collectionRef}.deleteOne({ \${1:filter} })`;
    default:
      return '';
  }
}

export function isMongoConnectType(type?: ConnectType): boolean {
  return type === ConnectType.MONGODB;
}

export function isMongoDBSession(session?: {
  connection?: { type?: ConnectType };
}): boolean {
  return isMongoConnectType(session?.connection?.type);
}

export function isDocumentOrKeyValueSession(session?: {
  connection?: { type?: ConnectType };
}): boolean {
  return (
    session?.connection?.type === ConnectType.MONGODB ||
    session?.connection?.type === ConnectType.REDIS
  );
}
