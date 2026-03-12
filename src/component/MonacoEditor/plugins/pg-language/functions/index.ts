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

export interface IFunction {
  name: string;
  desc: string;
  params?: IFunctionParam[];
  isNotSupport?: boolean;
  body?: string;
}

export interface IFunctionParamRich {
  name: string;
  desc?: string;
  dataType?: string;
}

export type IFunctionParam = IFunctionParamRich | string;

/**
 * 字符串函数
 */
const stringFunctions: IFunction[] = [
  {
    name: 'LENGTH',
    params: [{ name: 'string' }],
    desc: '返回字符串中的字符数。'
  },
  {
    name: 'CHAR_LENGTH',
    params: [{ name: 'string' }],
    desc: '返回字符串中的字符数。'
  },
  {
    name: 'SUBSTRING',
    params: [{ name: 'string' }, { name: 'start' }, { name: 'length' }],
    desc: '提取子字符串。'
  },
  {
    name: 'SUBSTR',
    params: [{ name: 'string' }, { name: 'start' }, { name: 'length' }],
    desc: '提取子字符串。'
  },
  {
    name: 'UPPER',
    params: [{ name: 'string' }],
    desc: '将字符串转换为大写。'
  },
  {
    name: 'LOWER',
    params: [{ name: 'string' }],
    desc: '将字符串转换为小写。'
  },
  {
    name: 'INITCAP',
    params: [{ name: 'string' }],
    desc: '将字符串中每个单词的首字母转换为大写。'
  },
  {
    name: 'TRIM',
    params: [{ name: 'string' }],
    desc: '删除字符串开头和结尾的空白字符。'
  },
  {
    name: 'LTRIM',
    params: [{ name: 'string' }],
    desc: '删除字符串开头的空白字符。'
  },
  {
    name: 'RTRIM',
    params: [{ name: 'string' }],
    desc: '删除字符串结尾的空白字符。'
  },
  {
    name: 'LPAD',
    params: [{ name: 'string' }, { name: 'length' }, { name: 'fill' }],
    desc: '将字符串填充到指定长度，在左侧添加填充字符。'
  },
  {
    name: 'RPAD',
    params: [{ name: 'string' }, { name: 'length' }, { name: 'fill' }],
    desc: '将字符串填充到指定长度，在右侧添加填充字符。'
  },
  {
    name: 'REPLACE',
    params: [{ name: 'string' }, { name: 'from' }, { name: 'to' }],
    desc: '替换字符串中所有匹配的子字符串。'
  },
  {
    name: 'OVERLAY',
    params: [{ name: 'string' }, { name: 'placing' }, { name: 'from' }, { name: 'for' }],
    desc: '覆盖子字符串。'
  },
  {
    name: 'POSITION',
    params: [{ name: 'substring' }, { name: 'IN' }, { name: 'string' }],
    desc: '返回子字符串在字符串中的位置。'
  },
  {
    name: 'STRPOS',
    params: [{ name: 'string' }, { name: 'substring' }],
    desc: '返回子字符串在字符串中的位置。'
  },
  {
    name: 'SPLIT_PART',
    params: [{ name: 'string' }, { name: 'delimiter' }, { name: 'field' }],
    desc: '按分隔符分割字符串并返回指定字段。'
  },
  {
    name: 'CONCAT',
    params: [{ name: 'str1' }, { name: 'str2' }],
    desc: '连接两个或更多字符串。'
  },
  {
    name: 'CONCAT_WS',
    params: [{ name: 'separator' }, { name: 'str1' }, { name: 'str2' }],
    desc: '使用分隔符连接字符串。'
  },
  {
    name: 'REVERSE',
    params: [{ name: 'string' }],
    desc: '返回反转的字符串。'
  },
  {
    name: 'REPEAT',
    params: [{ name: 'string' }, { name: 'number' }],
    desc: '重复字符串指定次数。'
  },
  {
    name: 'LEFT',
    params: [{ name: 'string' }, { name: 'n' }],
    desc: '返回字符串左侧前 n 个字符。'
  },
  {
    name: 'RIGHT',
    params: [{ name: 'string' }, { name: 'n' }],
    desc: '返回字符串右侧后 n 个字符。'
  },
  {
    name: 'MD5',
    params: [{ name: 'string' }],
    desc: '计算字符串的 MD5 哈希值。'
  },
  {
    name: 'ENCODE',
    params: [{ name: 'data' }, { name: 'format' }],
    desc: '将二进制数据编码为文本表示。'
  },
  {
    name: 'DECODE',
    params: [{ name: 'string' }, { name: 'format' }],
    desc: '将文本解码为二进制数据。'
  },
  {
    name: 'QUOTE_IDENT',
    params: [{ name: 'string' }],
    desc: '返回适当地引用的字符串作为 SQL 标识符。'
  },
  {
    name: 'QUOTE_LITERAL',
    params: [{ name: 'string' }],
    desc: '返回适当地引用的字符串作为 SQL 字符串字面量。'
  },
  {
    name: 'QUOTE_NULLABLE',
    params: [{ name: 'value' }],
    desc: '返回适当地引用的值作为 SQL 字符串字面量，可以为空。'
  },
  {
    name: 'REGEXP_MATCHES',
    params: [{ name: 'string' }, { name: 'pattern' }, { name: 'flags' }],
    desc: '返回匹配 POSIX 正则表达式的所有子串。'
  },
  {
    name: 'REGEXP_REPLACE',
    params: [{ name: 'string' }, { name: 'pattern' }, { name: 'replacement' }, { name: 'flags' }],
    desc: '替换匹配 POSIX 正则表达式的子串。'
  },
  {
    name: 'REGEXP_SPLIT_TO_ARRAY',
    params: [{ name: 'string' }, { name: 'pattern' }, { name: 'flags' }],
    desc: '使用 POSIX 正则表达式作为分隔符分割字符串为数组。'
  },
  {
    name: 'REGEXP_SPLIT_TO_TABLE',
    params: [{ name: 'string' }, { name: 'pattern' }, { name: 'flags' }],
    desc: '使用 POSIX 正则表达式作为分隔符分割字符串为表行。'
  }
];

/**
 * 日期和时间函数
 */
const dateTimeFunctions: IFunction[] = [
  {
    name: 'CURRENT_DATE',
    params: [],
    desc: '返回当前日期。'
  },
  {
    name: 'CURRENT_TIME',
    params: [{ name: 'precision' }],
    desc: '返回当前时间。'
  },
  {
    name: 'CURRENT_TIMESTAMP',
    params: [{ name: 'precision' }],
    desc: '返回当前日期和时间。'
  },
  {
    name: 'LOCALTIME',
    params: [{ name: 'precision' }],
    desc: '返回当前时间（不含时区）。'
  },
  {
    name: 'LOCALTIMESTAMP',
    params: [{ name: 'precision' }],
    desc: '返回当前日期和时间（不含时区）。'
  },
  {
    name: 'NOW',
    params: [],
    desc: '返回当前日期和时间。'
  },
  {
    name: 'TRANSACTION_TIMESTAMP',
    params: [],
    desc: '返回当前事务开始时的日期和时间。'
  },
  {
    name: 'STATEMENT_TIMESTAMP',
    params: [],
    desc: '返回当前语句开始时的日期和时间。'
  },
  {
    name: 'CLOCK_TIMESTAMP',
    params: [],
    desc: '返回当前实际日期和时间。'
  },
  {
    name: 'TIMEOFDAY',
    params: [],
    desc: '返回当前日期和时间作为文本字符串。'
  },
  {
    name: 'TODAY',
    params: [],
    desc: '返回当前日期。'
  },
  {
    name: 'TOMORROW',
    params: [],
    desc: '返回明天的日期。'
  },
  {
    name: 'YESTERDAY',
    params: [],
    desc: '返回昨天的日期。'
  },
  {
    name: 'AGE',
    params: [{ name: 'timestamp' }, { name: 'timestamp' }],
    desc: '计算两个时间戳之间的时间间隔。'
  },
  {
    name: 'DATE_PART',
    params: [{ name: 'field' }, { name: 'timestamp' }],
    desc: '提取时间戳的指定部分。'
  },
  {
    name: 'EXTRACT',
    body: 'EXTRACT(${1:field} FROM ${2:timestamp})',
    desc: '从时间戳中提取指定部分。'
  },
  {
    name: 'DATE_TRUNC',
    params: [{ name: 'field' }, { name: 'timestamp' }],
    desc: '将时间戳截断到指定精度。'
  },
  {
    name: 'DATE_BIN',
    params: [{ name: 'stride' }, { name: 'source' }, { name: 'origin' }],
    desc: '将时间戳对齐到指定间隔。'
  },
  {
    name: 'TO_DATE',
    params: [{ name: 'string' }, { name: 'format' }],
    desc: '将字符串转换为日期。'
  },
  {
    name: 'TO_TIMESTAMP',
    params: [{ name: 'string' }, { name: 'format' }],
    desc: '将字符串转换为时间戳。'
  },
  {
    name: 'TO_TIMESTAMP',
    params: [{ name: 'epoch' }],
    desc: '将 Unix 纪元时间转换为时间戳。'
  },
  {
    name: 'MAKE_DATE',
    params: [{ name: 'year' }, { name: 'month' }, { name: 'day' }],
    desc: '从年、月、日创建日期。'
  },
  {
    name: 'MAKE_TIME',
    params: [{ name: 'hour' }, { name: 'min' }, { name: 'sec' }],
    desc: '从时、分、秒创建时间。'
  },
  {
    name: 'MAKE_TIMESTAMP',
    params: [{ name: 'year' }, { name: 'month' }, { name: 'day' }, { name: 'hour' }, { name: 'min' }, { name: 'sec' }],
    desc: '从各部分创建时间戳。'
  },
  {
    name: 'MAKE_TIMESTAMPTZ',
    params: [{ name: 'year' }, { name: 'month' }, { name: 'day' }, { name: 'hour' }, { name: 'min' }, { name: 'sec' }, { name: 'timezone' }],
    desc: '从各部分创建带时区的时间戳。'
  },
  {
    name: 'ISFINITE',
    params: [{ name: 'date' }],
    desc: '检查日期是否为有限值（不是无限或无效）。'
  },
  {
    name: 'JUSTIFY_DAYS',
    params: [{ name: 'interval' }],
    desc: '调整间隔中的天数部分为月和日。'
  },
  {
    name: 'JUSTIFY_HOURS',
    params: [{ name: 'interval' }],
    desc: '调整间隔中的小时部分为天。'
  },
  {
    name: 'JUSTIFY_INTERVAL',
    params: [{ name: 'interval' }],
    desc: '调整间隔使用 justify_days 和 justify_hours。'
  },
  {
    name: 'PG_SLEEP',
    params: [{ name: 'seconds' }],
    desc: '使服务器进程休眠指定的秒数。'
  },
  {
    name: 'PG_SLEEP_FOR',
    params: [{ name: 'interval' }],
    desc: '使服务器进程休眠指定的时间间隔。'
  },
  {
    name: 'PG_SLEEP_UNTIL',
    params: [{ name: 'timestamp' }],
    desc: '使服务器进程休眠直到指定的时间戳。'
  }
];

/**
 * 数学函数
 */
const mathFunctions: IFunction[] = [
  {
    name: 'ABS',
    params: [{ name: 'number' }],
    desc: '返回绝对值。'
  },
  {
    name: 'CEIL',
    params: [{ name: 'number' }],
    desc: '返回大于或等于参数的最小整数。'
  },
  {
    name: 'CEILING',
    params: [{ name: 'number' }],
    desc: '返回大于或等于参数的最小整数。'
  },
  {
    name: 'FLOOR',
    params: [{ name: 'number' }],
    desc: '返回小于或等于参数的最大整数。'
  },
  {
    name: 'ROUND',
    params: [{ name: 'number' }, { name: 'decimals' }],
    desc: '将数字四舍五入到指定的小数位数。'
  },
  {
    name: 'TRUNC',
    params: [{ name: 'number' }, { name: 'decimals' }],
    desc: '将数字截断到指定的小数位数。'
  },
  {
    name: 'DIV',
    params: [{ name: 'a' }, { name: 'b' }],
    desc: '返回整数除法的整数商。'
  },
  {
    name: 'MOD',
    params: [{ name: 'a' }, { name: 'b' }],
    desc: '返回整数除法的余数。'
  },
  {
    name: 'POWER',
    params: [{ name: 'a' }, { name: 'b' }],
    desc: '返回 a 的 b 次幂。'
  },
  {
    name: 'SQRT',
    params: [{ name: 'number' }],
    desc: '返回平方根。'
  },
  {
    name: 'CBRT',
    params: [{ name: 'number' }],
    desc: '返回立方根。'
  },
  {
    name: 'SIGN',
    params: [{ name: 'number' }],
    desc: '返回数字的符号（-1, 0, 1）。'
  },
  {
    name: 'EXP',
    params: [{ name: 'number' }],
    desc: '返回 e 的指定次幂。'
  },
  {
    name: 'LN',
    params: [{ name: 'number' }],
    desc: '返回自然对数。'
  },
  {
    name: 'LOG',
    params: [{ name: 'number' }],
    desc: '返回以 10 为底的对数。'
  },
  {
    name: 'LOG',
    params: [{ name: 'base' }, { name: 'number' }],
    desc: '返回指定底数的对数。'
  },
  {
    name: 'PI',
    params: [],
    desc: '返回 π 的值。'
  },
  {
    name: 'DEGREES',
    params: [{ name: 'radians' }],
    desc: '将弧度转换为角度。'
  },
  {
    name: 'RADIANS',
    params: [{ name: 'degrees' }],
    desc: '将角度转换为弧度。'
  },
  {
    name: 'SIN',
    params: [{ name: 'radians' }],
    desc: '返回正弦值。'
  },
  {
    name: 'COS',
    params: [{ name: 'radians' }],
    desc: '返回余弦值。'
  },
  {
    name: 'TAN',
    params: [{ name: 'radians' }],
    desc: '返回正切值。'
  },
  {
    name: 'COT',
    params: [{ name: 'radians' }],
    desc: '返回余切值。'
  },
  {
    name: 'ASIN',
    params: [{ name: 'number' }],
    desc: '返回反正弦值。'
  },
  {
    name: 'ACOS',
    params: [{ name: 'number' }],
    desc: '返回反余弦值。'
  },
  {
    name: 'ATAN',
    params: [{ name: 'number' }],
    desc: '返回反正切值。'
  },
  {
    name: 'ATAN2',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '返回 y/x 的反正切值。'
  },
  {
    name: 'RANDOM',
    params: [],
    desc: '返回 0.0 到 1.0 之间的随机数。'
  },
  {
    name: 'SETSEED',
    params: [{ name: 'seed' }],
    desc: '设置随机数生成器的种子。'
  },
  {
    name: 'WIDTH_BUCKET',
    params: [{ name: 'operand' }, { name: 'b1' }, { name: 'b2' }, { name: 'count' }],
    desc: '返回操作数所在的桶编号。'
  }
];

/**
 * 聚合函数
 */
const aggregateFunctions: IFunction[] = [
  {
    name: 'AVG',
    params: [{ name: 'expression' }],
    desc: '计算平均值。'
  },
  {
    name: 'COUNT',
    params: [{ name: 'expression' }],
    desc: '返回非空值的数量。'
  },
  {
    name: 'MAX',
    params: [{ name: 'expression' }],
    desc: '返回最大值。'
  },
  {
    name: 'MIN',
    params: [{ name: 'expression' }],
    desc: '返回最小值。'
  },
  {
    name: 'SUM',
    params: [{ name: 'expression' }],
    desc: '计算总和。'
  },
  {
    name: 'BIT_AND',
    params: [{ name: 'expression' }],
    desc: '计算位与聚合。'
  },
  {
    name: 'BIT_OR',
    params: [{ name: 'expression' }],
    desc: '计算位或聚合。'
  },
  {
    name: 'BOOL_AND',
    params: [{ name: 'expression' }],
    desc: '如果所有输入都为真，则返回真。'
  },
  {
    name: 'BOOL_OR',
    params: [{ name: 'expression' }],
    desc: '如果至少有一个输入为真，则返回真。'
  },
  {
    name: 'EVERY',
    params: [{ name: 'expression' }],
    desc: '等同于 BOOL_AND。'
  },
  {
    name: 'ARRAY_AGG',
    params: [{ name: 'expression' }],
    desc: '将值聚合为数组。'
  },
  {
    name: 'STRING_AGG',
    params: [{ name: 'expression' }, { name: 'delimiter' }],
    desc: '将值聚合并用分隔符连接。'
  },
  {
    name: 'XMLAGG',
    params: [{ name: 'expression' }],
    desc: '将 XML 值聚合为单个 XML 值。'
  },
  {
    name: 'JSON_AGG',
    params: [{ name: 'expression' }],
    desc: '将值聚合为 JSON 数组。'
  },
  {
    name: 'JSONB_AGG',
    params: [{ name: 'expression' }],
    desc: '将值聚合为 JSONB 数组。'
  },
  {
    name: 'JSON_OBJECT_AGG',
    params: [{ name: 'key' }, { name: 'value' }],
    desc: '将键值对聚合为 JSON 对象。'
  },
  {
    name: 'JSONB_OBJECT_AGG',
    params: [{ name: 'key' }, { name: 'value' }],
    desc: '将键值对聚合为 JSONB 对象。'
  },
  {
    name: 'STDDEV',
    params: [{ name: 'expression' }],
    desc: '计算样本标准差。'
  },
  {
    name: 'STDDEV_SAMP',
    params: [{ name: 'expression' }],
    desc: '计算样本标准差。'
  },
  {
    name: 'STDDEV_POP',
    params: [{ name: 'expression' }],
    desc: '计算总体标准差。'
  },
  {
    name: 'VARIANCE',
    params: [{ name: 'expression' }],
    desc: '计算样本方差。'
  },
  {
    name: 'VAR_SAMP',
    params: [{ name: 'expression' }],
    desc: '计算样本方差。'
  },
  {
    name: 'VAR_POP',
    params: [{ name: 'expression' }],
    desc: '计算总体方差。'
  },
  {
    name: 'CORR',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算相关系数。'
  },
  {
    name: 'COVAR_POP',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算总体协方差。'
  },
  {
    name: 'COVAR_SAMP',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算样本协方差。'
  },
  {
    name: 'REGR_AVGX',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算自变量的平均值。'
  },
  {
    name: 'REGR_AVGY',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算因变量的平均值。'
  },
  {
    name: 'REGR_COUNT',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算非空行数。'
  },
  {
    name: 'REGR_INTERCEPT',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算线性回归的 y 截距。'
  },
  {
    name: 'REGR_R2',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算决定系数 R²。'
  },
  {
    name: 'REGR_SLOPE',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算线性回归的斜率。'
  },
  {
    name: 'REGR_SXX',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算 sum(X²) - sum(X)²/N。'
  },
  {
    name: 'REGR_SXY',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算 sum(X*Y) - sum(X)sum(Y)/N。'
  },
  {
    name: 'REGR_SYY',
    params: [{ name: 'y' }, { name: 'x' }],
    desc: '计算 sum(Y²) - sum(Y)²/N。'
  }
];

/**
 * 窗口函数
 */
const windowFunctions: IFunction[] = [
  {
    name: 'ROW_NUMBER',
    params: [],
    desc: '为分区中的行分配唯一序号。'
  },
  {
    name: 'RANK',
    params: [],
    desc: '返回当前行的排名，带间隙。'
  },
  {
    name: 'DENSE_RANK',
    params: [],
    desc: '返回当前行的排名，不带间隙。'
  },
  {
    name: 'PERCENT_RANK',
    params: [],
    desc: '返回当前行的相对排名。'
  },
  {
    name: 'CUME_DIST',
    params: [],
    desc: '返回累积分布。'
  },
  {
    name: 'NTILE',
    params: [{ name: 'num_buckets' }],
    desc: '将行分配到指定数量的桶中。'
  },
  {
    name: 'LAG',
    params: [{ name: 'value' }, { name: 'offset' }, { name: 'default' }],
    desc: '返回分区中前一个行的值。'
  },
  {
    name: 'LEAD',
    params: [{ name: 'value' }, { name: 'offset' }, { name: 'default' }],
    desc: '返回分区中后一个行的值。'
  },
  {
    name: 'FIRST_VALUE',
    params: [{ name: 'value' }],
    desc: '返回窗口中第一行的值。'
  },
  {
    name: 'LAST_VALUE',
    params: [{ name: 'value' }],
    desc: '返回窗口中最后一行的值。'
  },
  {
    name: 'NTH_VALUE',
    params: [{ name: 'value' }, { name: 'nth' }],
    desc: '返回窗口中第 n 行的值。'
  }
];

/**
 * JSON 函数
 */
const jsonFunctions: IFunction[] = [
  {
    name: 'JSON_ARRAY_LENGTH',
    params: [{ name: 'json' }],
    desc: '返回 JSON 数组的长度。'
  },
  {
    name: 'JSONB_ARRAY_LENGTH',
    params: [{ name: 'jsonb' }],
    desc: '返回 JSONB 数组的长度。'
  },
  {
    name: 'JSON_EACH',
    params: [{ name: 'json' }],
    desc: '将 JSON 对象扩展为键值对集合。'
  },
  {
    name: 'JSONB_EACH',
    params: [{ name: 'jsonb' }],
    desc: '将 JSONB 对象扩展为键值对集合。'
  },
  {
    name: 'JSON_EXTRACT_PATH',
    params: [{ name: 'json' }, { name: 'path' }],
    desc: '从 JSON 值中提取指定路径的值。'
  },
  {
    name: 'JSONB_EXTRACT_PATH',
    params: [{ name: 'jsonb' }, { name: 'path' }],
    desc: '从 JSONB 值中提取指定路径的值。'
  },
  {
    name: 'JSON_EXTRACT_PATH_TEXT',
    params: [{ name: 'json' }, { name: 'path' }],
    desc: '从 JSON 值中提取指定路径的值作为文本。'
  },
  {
    name: 'JSONB_EXTRACT_PATH_TEXT',
    params: [{ name: 'jsonb' }, { name: 'path' }],
    desc: '从 JSONB 值中提取指定路径的值作为文本。'
  },
  {
    name: 'JSON_OBJECT_KEYS',
    params: [{ name: 'json' }],
    desc: '返回 JSON 对象的键集合。'
  },
  {
    name: 'JSONB_OBJECT_KEYS',
    params: [{ name: 'jsonb' }],
    desc: '返回 JSONB 对象的键集合。'
  },
  {
    name: 'JSON_POPULATE_RECORD',
    params: [{ name: 'base' }, { name: 'json' }],
    desc: '从 JSON 对象创建记录。'
  },
  {
    name: 'JSONB_POPULATE_RECORD',
    params: [{ name: 'base' }, { name: 'jsonb' }],
    desc: '从 JSONB 对象创建记录。'
  },
  {
    name: 'JSON_STRIP_NULLS',
    params: [{ name: 'json' }],
    desc: '删除 JSON 值中的空值字段。'
  },
  {
    name: 'JSONB_STRIP_NULLS',
    params: [{ name: 'jsonb' }],
    desc: '删除 JSONB 值中的空值字段。'
  },
  {
    name: 'JSON_TYPEOF',
    params: [{ name: 'json' }],
    desc: '返回 JSON 值的类型。'
  },
  {
    name: 'JSONB_TYPEOF',
    params: [{ name: 'jsonb' }],
    desc: '返回 JSONB 值的类型。'
  },
  {
    name: 'JSON_TO_RECORD',
    params: [{ name: 'json' }],
    desc: '将 JSON 对象转换为记录。'
  },
  {
    name: 'JSONB_TO_RECORD',
    params: [{ name: 'jsonb' }],
    desc: '将 JSONB 对象转换为记录。'
  },
  {
    name: 'TO_JSON',
    params: [{ name: 'value' }],
    desc: '将 SQL 值转换为 JSON。'
  },
  {
    name: 'TO_JSONB',
    params: [{ name: 'value' }],
    desc: '将 SQL 值转换为 JSONB。'
  },
  {
    name: 'JSON_BUILD_ARRAY',
    params: [{ name: 'elements' }],
    desc: '从元素构建 JSON 数组。'
  },
  {
    name: 'JSONB_BUILD_ARRAY',
    params: [{ name: 'elements' }],
    desc: '从元素构建 JSONB 数组。'
  },
  {
    name: 'JSON_BUILD_OBJECT',
    params: [{ name: 'keys_and_values' }],
    desc: '从键值对构建 JSON 对象。'
  },
  {
    name: 'JSONB_BUILD_OBJECT',
    params: [{ name: 'keys_and_values' }],
    desc: '从键值对构建 JSONB 对象。'
  },
  {
    name: 'JSONB_PRETTY',
    params: [{ name: 'jsonb' }],
    desc: '返回格式化的 JSONB。'
  },
  {
    name: 'JSONB_PATH_QUERY',
    params: [{ name: 'target' }, { name: 'path' }],
    desc: '从 JSONB 中查询匹配 SQL/JSON 路径的项。'
  },
  {
    name: 'JSONB_PATH_QUERY_ARRAY',
    params: [{ name: 'target' }, { name: 'path' }],
    desc: '从 JSONB 中查询匹配 SQL/JSON 路径的项作为数组。'
  },
  {
    name: 'JSONB_PATH_QUERY_FIRST',
    params: [{ name: 'target' }, { name: 'path' }],
    desc: '从 JSONB 中查询第一个匹配 SQL/JSON 路径的项。'
  }
];

/**
 * 系统函数
 */
const systemFunctions: IFunction[] = [
  {
    name: 'CAST',
    body: 'CAST(${1:expression} AS ${2:type})',
    desc: '类型转换。'
  },
  {
    name: 'COALESCE',
    params: [{ name: 'value1' }, { name: 'value2' }],
    desc: '返回第一个非空参数。'
  },
  {
    name: 'NULLIF',
    params: [{ name: 'value1' }, { name: 'value2' }],
    desc: '如果两个值相等，返回 NULL。'
  },
  {
    name: 'GREATEST',
    params: [{ name: 'value1' }, { name: 'value2' }],
    desc: '返回参数中的最大值。'
  },
  {
    name: 'LEAST',
    params: [{ name: 'value1' }, { name: 'value2' }],
    desc: '返回参数中的最小值。'
  },
  {
    name: 'GENERATE_SERIES',
    params: [{ name: 'start' }, { name: 'stop' }, { name: 'step' }],
    desc: '生成一个整数序列。'
  },
  {
    name: 'GENERATE_SUBSCRIPTS',
    params: [{ name: 'array' }, { name: 'dimension' }],
    desc: '生成数组下标序列。'
  },
  {
    name: 'CURRENT_DATABASE',
    params: [],
    desc: '返回当前数据库名。'
  },
  {
    name: 'CURRENT_SCHEMA',
    params: [],
    desc: '返回当前 schema 名。'
  },
  {
    name: 'CURRENT_SCHEMAS',
    params: [{ name: 'include_implicit' }],
    desc: '返回有效 schema 搜索路径。'
  },
  {
    name: 'CURRENT_USER',
    params: [],
    desc: '返回当前用户名。'
  },
  {
    name: 'SESSION_USER',
    params: [],
    desc: '返回会话用户名。'
  },
  {
    name: 'CURRENT_SETTING',
    params: [{ name: 'setting_name' }],
    desc: '返回当前配置参数值。'
  },
  {
    name: 'SET_CONFIG',
    params: [{ name: 'setting_name' }, { name: 'new_value' }, { name: 'is_local' }],
    desc: '设置配置参数。'
  },
  {
    name: 'PG_GET_INDEXDEF',
    params: [{ name: 'index_oid' }],
    desc: '返回索引的定义语句。'
  },
  {
    name: 'PG_GET_FUNCTIONDEF',
    params: [{ name: 'func_oid' }],
    desc: '返回函数的定义语句。'
  },
  {
    name: 'PG_GET_TABLEDEF',
    params: [{ name: 'table_oid' }],
    desc: '返回表的定义语句。'
  },
  {
    name: 'PG_GET_CONSTRAINTDEF',
    params: [{ name: 'constraint_oid' }],
    desc: '返回约束的定义语句。'
  },
  {
    name: 'PG_GET_EXPR',
    params: [{ name: 'expr' }, { name: 'relation_oid' }],
    desc: '反编译表达式的内部形式。'
  },
  {
    name: 'PG_GET_SERIAL_SEQUENCE',
    params: [{ name: 'table' }, { name: 'column' }],
    desc: '返回序列列关联的序列名。'
  },
  {
    name: 'PG_GET_USERBYID',
    params: [{ name: 'role_oid' }],
    desc: '根据 OID 获取角色名。'
  },
  {
    name: 'PG_GET_VIEWDEF',
    params: [{ name: 'view_oid' }],
    desc: '返回视图的定义语句。'
  },
  {
    name: 'VERSION',
    params: [],
    desc: '返回 PostgreSQL 版本信息。'
  },
  {
    name: 'PG_BACKEND_PID',
    params: [],
    desc: '返回当前会话的服务器进程 ID。'
  },
  {
    name: 'PG_CANCEL_BACKEND',
    params: [{ name: 'pid' }],
    desc: '取消指定后端进程的当前查询。'
  },
  {
    name: 'PG_TERMINATE_BACKEND',
    params: [{ name: 'pid' }],
    desc: '终止指定后端进程。'
  },
  {
    name: 'PG_IS_IN_RECOVERY',
    params: [],
    desc: '检查数据库是否处于恢复模式。'
  },
  {
    name: 'PG_CONTROL_CHECKPOINT',
    params: [],
    desc: '返回检查点信息。'
  },
  {
    name: 'PG_CONTROL_SYSTEM',
    params: [],
    desc: '返回系统控制信息。'
  },
  {
    name: 'PG_STAT_FILE',
    params: [{ name: 'filename' }],
    desc: '返回文件状态信息。'
  },
  {
    name: 'PG_READ_FILE',
    params: [{ name: 'filename' }, { name: 'offset' }, { name: 'length' }],
    desc: '读取文件内容。'
  },
  {
    name: 'PG_READ_BINARY_FILE',
    params: [{ name: 'filename' }, { name: 'offset' }, { name: 'length' }],
    desc: '读取二进制文件内容。'
  },
  {
    name: 'PG_LS_DIR',
    params: [{ name: 'dirname' }],
    desc: '列出目录内容。'
  },
  {
    name: 'FORMAT',
    params: [{ name: 'format_string' }, { name: 'arguments' }],
    desc: '格式化字符串。'
  },
  {
    name: 'BTRIM',
    params: [{ name: 'string' }, { name: 'characters' }],
    desc: '删除字符串两端指定的字符。'
  },
  {
    name: 'CHR',
    params: [{ name: 'code' }],
    desc: '返回指定 Unicode 码点的字符。'
  },
  {
    name: 'ASCII',
    params: [{ name: 'char' }],
    desc: '返回字符的 ASCII 码。'
  },
  {
    name: 'PG_CLIENT_ENCODING',
    params: [],
    desc: '返回客户端编码名称。'
  }
];

/**
 * 数组函数
 */
const arrayFunctions: IFunction[] = [
  {
    name: 'ARRAY_APPEND',
    params: [{ name: 'array' }, { name: 'element' }],
    desc: '向数组末尾添加元素。'
  },
  {
    name: 'ARRAY_CAT',
    params: [{ name: 'array1' }, { name: 'array2' }],
    desc: '连接两个数组。'
  },
  {
    name: 'ARRAY_NDIMS',
    params: [{ name: 'array' }],
    desc: '返回数组的维度数。'
  },
  {
    name: 'ARRAY_DIMS',
    params: [{ name: 'array' }],
    desc: '返回数组维度的文本表示。'
  },
  {
    name: 'ARRAY_FILL',
    params: [{ name: 'value' }, { name: 'dimensions' }],
    desc: '创建填充指定值的数组。'
  },
  {
    name: 'ARRAY_LENGTH',
    params: [{ name: 'array' }, { name: 'dimension' }],
    desc: '返回数组指定维度的长度。'
  },
  {
    name: 'ARRAY_LOWER',
    params: [{ name: 'array' }, { name: 'dimension' }],
    desc: '返回数组指定维度的下界。'
  },
  {
    name: 'ARRAY_PREPEND',
    params: [{ name: 'element' }, { name: 'array' }],
    desc: '向数组开头添加元素。'
  },
  {
    name: 'ARRAY_REMOVE',
    params: [{ name: 'array' }, { name: 'element' }],
    desc: '删除数组中所有等于指定值的元素。'
  },
  {
    name: 'ARRAY_REPLACE',
    params: [{ name: 'array' }, { name: 'old' }, { name: 'new' }],
    desc: '替换数组中的元素。'
  },
  {
    name: 'ARRAY_TO_STRING',
    params: [{ name: 'array' }, { name: 'delimiter' }, { name: 'null_string' }],
    desc: '将数组转换为字符串。'
  },
  {
    name: 'ARRAY_UPPER',
    params: [{ name: 'array' }, { name: 'dimension' }],
    desc: '返回数组指定维度的上界。'
  },
  {
    name: 'CARDINALITY',
    params: [{ name: 'array' }],
    desc: '返回数组的总元素数。'
  },
  {
    name: 'STRING_TO_ARRAY',
    params: [{ name: 'string' }, { name: 'delimiter' }, { name: 'null_string' }],
    desc: '将字符串分割为数组。'
  },
  {
    name: 'UNNEST',
    params: [{ name: 'array' }],
    desc: '将数组扩展为一组行。'
  }
];

const functions: IFunction[] = stringFunctions
  .concat(dateTimeFunctions)
  .concat(mathFunctions)
  .concat(aggregateFunctions)
  .concat(windowFunctions)
  .concat(jsonFunctions)
  .concat(systemFunctions)
  .concat(arrayFunctions);

export default functions;
