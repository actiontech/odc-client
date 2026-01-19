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
    name: 'ASCII',
    params: [{ name: 'character_expression' }],
    desc: '返回字符表达式中最左侧字符的 ASCII 代码值。'
  },
  {
    name: 'CHAR',
    params: [{ name: 'integer_expression' }],
    desc: '将 int ASCII 代码转换为字符。'
  },
  {
    name: 'CHARINDEX',
    params: [
      { name: 'substring' },
      { name: 'string' },
      { name: 'start_location' }
    ],
    desc: '返回字符串中指定表达式的开始位置。'
  },
  {
    name: 'CONCAT',
    params: [{ name: 'str' }],
    desc: '返回串联两个或更多字符串值的结果字符串。'
  },
  {
    name: 'CONCAT_WS',
    params: [{ name: 'separator' }, { name: 'str' }],
    desc: '使用分隔符连接两个或更多字符串。'
  },
  {
    name: 'DIFFERENCE',
    params: [
      { name: 'character_expression1' },
      { name: 'character_expression2' }
    ],
    desc: '返回两个字符表达式的 SOUNDEX 值之间的差异。'
  },
  {
    name: 'FORMAT',
    params: [{ name: 'value' }, { name: 'format' }, { name: 'culture' }],
    desc: '返回根据指定格式和区域性（可选）格式化的值。'
  },
  {
    name: 'LEFT',
    params: [{ name: 'character_expression' }, { name: 'integer_expression' }],
    desc: '返回字符串中从左边开始指定个数的字符。'
  },
  {
    name: 'LEN',
    params: [{ name: 'string_expression' }],
    desc: '返回指定字符串表达式的字符数，其中不包含尾随空格。'
  },
  {
    name: 'LOWER',
    params: [{ name: 'character_expression' }],
    desc: '将大写字符数据转换为小写字符数据后返回字符表达式。'
  },
  {
    name: 'LTRIM',
    params: [{ name: 'character_expression' }],
    desc: '返回删除了前导空格之后的字符表达式。'
  },
  {
    name: 'PATINDEX',
    params: [{ name: 'pattern' }, { name: 'expression' }],
    desc: '返回模式在指定表达式中第一次出现的起始位置。'
  },
  {
    name: 'REPLACE',
    params: [
      { name: 'string_expression' },
      { name: 'string_pattern' },
      { name: 'string_replacement' }
    ],
    desc: '用另一个字符串值替换出现的所有指定字符串值。'
  },
  {
    name: 'REPLICATE',
    params: [{ name: 'string_expression' }, { name: 'integer_expression' }],
    desc: '以指定的次数重复字符串值。'
  },
  {
    name: 'REVERSE',
    params: [{ name: 'string_expression' }],
    desc: '返回字符串值的逆序。'
  },
  {
    name: 'RIGHT',
    params: [{ name: 'character_expression' }, { name: 'integer_expression' }],
    desc: '返回字符串中从右边开始指定个数的字符。'
  },
  {
    name: 'RTRIM',
    params: [{ name: 'character_expression' }],
    desc: '返回删除了尾随空格之后的字符表达式。'
  },
  {
    name: 'SOUNDEX',
    params: [{ name: 'character_expression' }],
    desc: '返回一个由四个字符组成的代码 (SOUNDEX)，用于评估两个字符串的相似性。'
  },
  {
    name: 'SPACE',
    params: [{ name: 'integer_expression' }],
    desc: '返回由重复空格组成的字符串。'
  },
  {
    name: 'STR',
    params: [
      { name: 'float_expression' },
      { name: 'length' },
      { name: 'decimal' }
    ],
    desc: '返回由数字数据转换来的字符数据。'
  },
  {
    name: 'STUFF',
    params: [
      { name: 'character_expression' },
      { name: 'start' },
      { name: 'length' },
      { name: 'replaceWith_expression' }
    ],
    desc: 'STUFF 函数将字符串插入到另一个字符串中。它从第一个字符串的指定位置开始删除指定长度的字符，然后将第二个字符串插入到第一个字符串的指定位置。'
  },
  {
    name: 'SUBSTRING',
    params: [{ name: 'expression' }, { name: 'start' }, { name: 'length' }],
    desc: '返回字符表达式、二进制表达式、文本表达式或图像表达式的一部分。'
  },
  {
    name: 'TRANSLATE',
    params: [
      { name: 'inputString' },
      { name: 'characters' },
      { name: 'translations' }
    ],
    desc: '返回第一个参数中字符被第二个参数中具有匹配位置的字符替换后的字符串。'
  },
  {
    name: 'TRIM',
    params: [{ name: 'string_expression' }],
    desc: '删除字符串开头和结尾的空格字符。'
  },
  {
    name: 'UNICODE',
    params: [{ name: 'ncharacter_expression' }],
    desc: '按照 Unicode 标准的定义，返回输入表达式的第一个字符的整数值。'
  },
  {
    name: 'UPPER',
    params: [{ name: 'character_expression' }],
    desc: '返回小写字符数据转换为大写的字符表达式。'
  }
];

/**
 * 日期和时间函数
 */
const dateTimeFunctions: IFunction[] = [
  {
    name: 'CURRENT_TIMESTAMP',
    params: [],
    desc: '返回当前数据库系统时间戳。'
  },
  {
    name: 'GETDATE',
    params: [],
    desc: '返回当前数据库系统时间戳。'
  },
  {
    name: 'GETUTCDATE',
    params: [],
    desc: '返回表示当前 UTC 时间（协调世界时或格林威治标准时间）的 datetime 值。'
  },
  {
    name: 'SYSDATETIME',
    params: [],
    desc: '返回包含计算机的日期和时间的 datetime2(7) 值，SQL Server 的实例正在该计算机上运行。'
  },
  {
    name: 'SYSUTCDATETIME',
    params: [],
    desc: '返回包含计算机的日期和时间的 datetime2(7) 值，SQL Server 的实例正在该计算机上运行。时区设置为 UTC。'
  },
  {
    name: 'SYSDATETIMEOFFSET',
    params: [],
    desc: '返回包含计算机的日期和时间的 datetimeoffset(7) 值，SQL Server 的实例正在该计算机上运行。时区设置为包含本地时区和 UTC 的偏移量。'
  },
  {
    name: 'DATEADD',
    params: [{ name: 'datepart' }, { name: 'number' }, { name: 'date' }],
    desc: '向指定日期添加一个时间间隔，并返回新的 datetime 值。'
  },
  {
    name: 'DATEDIFF',
    params: [{ name: 'datepart' }, { name: 'startdate' }, { name: 'enddate' }],
    desc: '返回两个指定日期之间所跨的日期和时间边界的数目。'
  },
  {
    name: 'DATENAME',
    params: [{ name: 'datepart' }, { name: 'date' }],
    desc: '返回表示指定 date 的指定 datepart 的字符串。'
  },
  {
    name: 'DATEPART',
    params: [{ name: 'datepart' }, { name: 'date' }],
    desc: '返回表示指定 date 的指定 datepart 的整数。'
  },
  {
    name: 'DAY',
    params: [{ name: 'date' }],
    desc: '返回表示指定 date 的“日”部分的整数。'
  },
  {
    name: 'MONTH',
    params: [{ name: 'date' }],
    desc: '返回表示指定 date 的“月”部分的整数。'
  },
  {
    name: 'YEAR',
    params: [{ name: 'date' }],
    desc: '返回表示指定 date 的“年”部分的整数。'
  },
  {
    name: 'EOMONTH',
    params: [{ name: 'start_date' }, { name: 'month_to_add' }],
    desc: '返回包含指定日期所在月份的最后一天（具有可选偏移量）。'
  },
  {
    name: 'ISDATE',
    params: [{ name: 'expression' }],
    desc: '确定输入表达式是否为有效的日期或时间值。'
  },
  {
    name: 'SWITCHOFFSET',
    params: [{ name: 'DATETIMEOFFSET' }, { name: 'time_zone' }],
    desc: '返回从存储的时区偏移量变为指定的新时区偏移量时得到的 datetimeoffset 值。'
  },
  {
    name: 'TODATETIMEOFFSET',
    params: [{ name: 'expression' }, { name: 'time_zone' }],
    desc: '将 datetime2 值转换为 datetimeoffset 值。'
  }
];

/**
 * 数学函数
 */
const mathFunctions: IFunction[] = [
  {
    name: 'ABS',
    params: [{ name: 'numeric_expression' }],
    desc: '返回指定数值表达式的绝对值（正值）的数学函数。'
  },
  {
    name: 'ACOS',
    params: [{ name: 'float_expression' }],
    desc: '返回其余弦是指定 float 表达式的角度（以弧度为单位）。也称为反余弦。'
  },
  {
    name: 'ASIN',
    params: [{ name: 'float_expression' }],
    desc: '返回以弧度表示的角，其正弦为指定的 float 表达式。也称为反正弦。'
  },
  {
    name: 'ATAN',
    params: [{ name: 'float_expression' }],
    desc: '返回以弧度表示的角，其正切为指定的 float 表达式。也称为反正切。'
  },
  {
    name: 'ATN2',
    params: [{ name: 'float_expression1' }, { name: 'float_expression2' }],
    desc: '返回以弧度表示的角，其正切为两个指定的 float 表达式的商。'
  },
  {
    name: 'CEILING',
    params: [{ name: 'numeric_expression' }],
    desc: '返回大于或等于指定数值表达式的最小整数。'
  },
  {
    name: 'COS',
    params: [{ name: 'float_expression' }],
    desc: '返回指定表达式中以弧度表示的指定角的三角余弦。'
  },
  {
    name: 'COT',
    params: [{ name: 'float_expression' }],
    desc: '返回指定 float 表达式中指定角（以弧度为单位）的三角余切值。'
  },
  {
    name: 'DEGREES',
    params: [{ name: 'numeric_expression' }],
    desc: '返回以弧度指定的角的相应角度。'
  },
  {
    name: 'EXP',
    params: [{ name: 'float_expression' }],
    desc: '返回指定的 float 表达式的指数值。'
  },
  {
    name: 'FLOOR',
    params: [{ name: 'numeric_expression' }],
    desc: '返回小于或等于指定数值表达式的最大整数。'
  },
  {
    name: 'LOG',
    params: [{ name: 'float_expression' }],
    desc: '返回指定 float 表达式的自然对数。'
  },
  {
    name: 'LOG10',
    params: [{ name: 'float_expression' }],
    desc: '返回指定 float 表达式的常用对数（以 10 为底）。'
  },
  {
    name: 'PI',
    params: [],
    desc: '返回 PI 的常量值。'
  },
  {
    name: 'POWER',
    params: [{ name: 'float_expression' }, { name: 'y' }],
    desc: '返回指定表达式的指定幂的值。'
  },
  {
    name: 'RADIANS',
    params: [{ name: 'numeric_expression' }],
    desc: '对于在数值表达式中输入的度数值返回弧度值。'
  },
  {
    name: 'RAND',
    params: [{ name: 'seed' }],
    desc: '返回从 0 到 1 之间的随机 float 值。'
  },
  {
    name: 'ROUND',
    params: [
      { name: 'numeric_expression' },
      { name: 'length' },
      { name: 'function' }
    ],
    desc: '返回一个数值，舍入到指定的长度或精度。'
  },
  {
    name: 'SIGN',
    params: [{ name: 'numeric_expression' }],
    desc: '返回指定表达式的正号 (+1)、零 (0) 或负号 (-1)。'
  },
  {
    name: 'SIN',
    params: [{ name: 'float_expression' }],
    desc: '返回以弧度表示的指定角的三角正弦。'
  },
  {
    name: 'SQRT',
    params: [{ name: 'float_expression' }],
    desc: '返回指定浮点值的平方根。'
  },
  {
    name: 'SQUARE',
    params: [{ name: 'float_expression' }],
    desc: '返回指定浮点值的平方。'
  },
  {
    name: 'TAN',
    params: [{ name: 'float_expression' }],
    desc: '返回输入表达式的正切值。'
  }
];

/**
 * 聚合函数
 */
const aggregateFunctions: IFunction[] = [
  {
    name: 'AVG',
    params: [{ name: 'expression' }],
    desc: '返回组中各值的平均值。空值将被忽略。'
  },
  {
    name: 'COUNT',
    params: [{ name: 'expression' }],
    desc: '返回组中的项数。'
  },
  {
    name: 'COUNT_BIG',
    params: [{ name: 'expression' }],
    desc: '返回组中的项数。COUNT_BIG 的用法与 COUNT 函数类似。这两个函数唯一的差别是它们的返回值。COUNT_BIG 始终返回 bigint 数据类型值。COUNT 始终返回 int 数据类型值。'
  },
  {
    name: 'MAX',
    params: [{ name: 'expression' }],
    desc: '返回表达式中的最大值。'
  },
  {
    name: 'MIN',
    params: [{ name: 'expression' }],
    desc: '返回表达式中的最小值。'
  },
  {
    name: 'SUM',
    params: [{ name: 'expression' }],
    desc: '返回表达式中所有值的和或仅非重复值的和。SUM 只能用于数字列。空值将被忽略。'
  },
  {
    name: 'STDEV',
    params: [{ name: 'expression' }],
    desc: '返回指定表达式中所有值的统计标准偏差。'
  },
  {
    name: 'STDEVP',
    params: [{ name: 'expression' }],
    desc: '返回指定表达式中所有值的填充统计标准偏差。'
  },
  {
    name: 'VAR',
    params: [{ name: 'expression' }],
    desc: '返回指定表达式中所有值的统计方差。'
  },
  {
    name: 'VARP',
    params: [{ name: 'expression' }],
    desc: '返回指定表达式中所有值的填充统计方差。'
  }
];

/**
 * 系统函数
 */
const systemFunctions: IFunction[] = [
  {
    name: 'CAST',
    body: 'CAST(${1:expression} AS ${2:data_type})',
    desc: '将一种数据类型的表达式转换为另一种数据类型的表达式。'
  },
  {
    name: 'CONVERT',
    params: [{ name: 'data_type' }, { name: 'expression' }, { name: 'style' }],
    desc: '将一种数据类型的表达式转换为另一种数据类型的表达式。'
  },
  {
    name: 'COALESCE',
    params: [{ name: 'expression' }],
    desc: '返回其参数中第一个非空表达式。'
  },
  {
    name: 'ISNULL',
    params: [{ name: 'check_expression' }, { name: 'replacement_value' }],
    desc: '使用指定的替换值替换 NULL。'
  },
  {
    name: 'NULLIF',
    params: [{ name: 'expression1' }, { name: 'expression2' }],
    desc: '如果两个指定的表达式相等，则返回空值。'
  },
  {
    name: 'IIF',
    params: [
      { name: 'boolean_expression' },
      { name: 'true_value' },
      { name: 'false_value' }
    ],
    desc: '根据布尔表达式计算为 true 还是 false，返回其中一个值。'
  },
  {
    name: 'CHOOSE',
    params: [{ name: 'index' }, { name: 'value' }],
    desc: '从值列表返回指定索引处的项。'
  }
];

const functions: IFunction[] = stringFunctions
  .concat(dateTimeFunctions)
  .concat(mathFunctions)
  .concat(aggregateFunctions)
  .concat(systemFunctions);

export default functions;
