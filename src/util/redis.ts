import { ConnectType, DragInsertType } from '@/d.ts';

function keyPattern(keyName: string): string {
  return keyName ? `${keyName}:*` : '*';
}

function isConcreteKey(keyName: string): boolean {
  return keyName.includes(':');
}

export function generateRedisCopyText(
  keyName: string,
  copyType: DragInsertType
): string {
  switch (copyType) {
    case DragInsertType.NAME:
      return keyName;
    case DragInsertType.SELECT:
      if (keyName && isConcreteKey(keyName)) {
        return `GET ${keyName}`;
      }
      return `SCAN 0 MATCH ${keyPattern(keyName)} COUNT 100`;
    case DragInsertType.INSERT:
      return `SET ${keyName || '${1:key}'} ${
        keyName ? '${1:value}' : '${2:value}'
      }`;
    case DragInsertType.UPDATE:
      return `SET ${keyName || '${1:key}'} ${
        keyName ? '${1:value}' : '${2:value}'
      }`;
    case DragInsertType.DELETE:
      return `DEL ${keyName || '${1:key}'}`;
    default:
      return '';
  }
}

export function isRedisConnectType(type?: ConnectType): boolean {
  return type === ConnectType.REDIS;
}

export function isRedisSession(session?: {
  connection?: { type?: ConnectType };
}): boolean {
  return isRedisConnectType(session?.connection?.type);
}
