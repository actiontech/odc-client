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
 * SAP HANA string functions
 */
const stringFunctions: IFunction[] = [
  {
    name: 'ASCII',
    params: [{ name: 'expression' }],
    desc: 'Returns the integer ASCII value of the first byte of a string.'
  },
  {
    name: 'CHAR',
    params: [{ name: 'integer_expression' }],
    desc: 'Returns the character associated with the specified ASCII value.'
  },
  {
    name: 'CONCAT',
    params: [{ name: 'string1' }, { name: 'string2' }],
    desc: 'Returns a combined string consisting of string1 followed by string2.'
  },
  {
    name: 'LCASE',
    params: [{ name: 'expression' }],
    desc: 'Converts all characters in a string to lowercase.'
  },
  {
    name: 'LEFT',
    params: [{ name: 'expression' }, { name: 'n' }],
    desc: 'Returns the specified number of characters from the start of a string.'
  },
  {
    name: 'LENGTH',
    params: [{ name: 'expression' }],
    desc: 'Returns the number of characters in a string.'
  },
  {
    name: 'LOCATE',
    params: [{ name: 'haystack' }, { name: 'needle' }],
    desc: 'Returns the position of a substring within a string.'
  },
  {
    name: 'LOWER',
    params: [{ name: 'expression' }],
    desc: 'Converts all characters in a string to lowercase.'
  },
  {
    name: 'LPAD',
    params: [{ name: 'expression' }, { name: 'n' }, { name: 'pattern' }],
    desc: 'Left-pads a string with another string to a specified length.'
  },
  {
    name: 'LTRIM',
    params: [{ name: 'expression' }],
    desc: 'Returns a string with leading blanks removed.'
  },
  {
    name: 'NCHAR',
    params: [{ name: 'integer_expression' }],
    desc: 'Returns the Unicode character with the specified integer code.'
  },
  {
    name: 'REPLACE',
    params: [
      { name: 'original_string' },
      { name: 'search_string' },
      { name: 'replace_string' }
    ],
    desc: 'Searches for a string and replaces it with another string.'
  },
  {
    name: 'REVERSE',
    params: [{ name: 'expression' }],
    desc: 'Returns the reverse of a string expression.'
  },
  {
    name: 'RIGHT',
    params: [{ name: 'expression' }, { name: 'n' }],
    desc: 'Returns the specified number of characters from the end of a string.'
  },
  {
    name: 'RPAD',
    params: [{ name: 'expression' }, { name: 'n' }, { name: 'pattern' }],
    desc: 'Right-pads a string with another string to a specified length.'
  },
  {
    name: 'RTRIM',
    params: [{ name: 'expression' }],
    desc: 'Returns a string with trailing blanks removed.'
  },
  {
    name: 'SUBSTR_AFTER',
    params: [{ name: 'expression' }, { name: 'pattern' }],
    desc: 'Returns a substring of the expression after the first occurrence of the pattern.'
  },
  {
    name: 'SUBSTR_BEFORE',
    params: [{ name: 'expression' }, { name: 'pattern' }],
    desc: 'Returns a substring of the expression before the first occurrence of the pattern.'
  },
  {
    name: 'SUBSTRING',
    params: [{ name: 'expression' }, { name: 'start' }, { name: 'length' }],
    desc: 'Returns a substring from a string starting at a specified position.'
  },
  {
    name: 'TRIM',
    params: [{ name: 'expression' }],
    desc: 'Returns a string with leading and trailing blanks removed.'
  },
  {
    name: 'UCASE',
    params: [{ name: 'expression' }],
    desc: 'Converts all characters in a string to uppercase.'
  },
  {
    name: 'UNICODE',
    params: [{ name: 'expression' }],
    desc: 'Returns the integer Unicode value of the first character of a string.'
  },
  {
    name: 'UPPER',
    params: [{ name: 'expression' }],
    desc: 'Converts all characters in a string to uppercase.'
  }
];

/**
 * SAP HANA numeric functions
 */
const numericFunctions: IFunction[] = [
  {
    name: 'ABS',
    params: [{ name: 'expression' }],
    desc: 'Returns the absolute value of a numeric expression.'
  },
  {
    name: 'CEIL',
    params: [{ name: 'expression' }],
    desc: 'Returns the smallest integer not less than the specified value.'
  },
  {
    name: 'FLOOR',
    params: [{ name: 'expression' }],
    desc: 'Returns the largest integer not greater than the specified value.'
  },
  {
    name: 'MOD',
    params: [{ name: 'dividend' }, { name: 'divisor' }],
    desc: 'Returns the remainder of dividend divided by divisor.'
  },
  {
    name: 'POWER',
    params: [{ name: 'base' }, { name: 'exponent' }],
    desc: 'Returns the value of base raised to the power of exponent.'
  },
  {
    name: 'ROUND',
    params: [{ name: 'expression' }, { name: 'precision' }],
    desc: 'Rounds a value to a specified number of decimal places.'
  },
  {
    name: 'SIGN',
    params: [{ name: 'expression' }],
    desc: 'Returns the sign of a numeric expression: -1, 0, or 1.'
  },
  {
    name: 'SQRT',
    params: [{ name: 'expression' }],
    desc: 'Returns the square root of a numeric expression.'
  }
];

/**
 * SAP HANA date/time functions
 */
const dateTimeFunctions: IFunction[] = [
  {
    name: 'ADD_DAYS',
    params: [{ name: 'date' }, { name: 'days' }],
    desc: 'Adds the specified number of days to a date.'
  },
  {
    name: 'ADD_MONTHS',
    params: [{ name: 'date' }, { name: 'months' }],
    desc: 'Adds the specified number of months to a date.'
  },
  {
    name: 'ADD_YEARS',
    params: [{ name: 'date' }, { name: 'years' }],
    desc: 'Adds the specified number of years to a date.'
  },
  {
    name: 'CURRENT_DATE',
    params: [],
    desc: 'Returns the current date.'
  },
  {
    name: 'CURRENT_TIME',
    params: [],
    desc: 'Returns the current time.'
  },
  {
    name: 'CURRENT_TIMESTAMP',
    params: [],
    desc: 'Returns the current date and time.'
  },
  {
    name: 'DAYNAME',
    params: [{ name: 'date' }],
    desc: 'Returns the name of the day of the week.'
  },
  {
    name: 'DAYOFMONTH',
    params: [{ name: 'date' }],
    desc: 'Returns the day of the month (1-31).'
  },
  {
    name: 'DAYS_BETWEEN',
    params: [{ name: 'date1' }, { name: 'date2' }],
    desc: 'Returns the number of days between two dates.'
  },
  {
    name: 'EXTRACT',
    params: [{ name: 'field' }, { name: 'date' }],
    desc: 'Extracts the specified date field from a date.'
  },
  {
    name: 'HOUR',
    params: [{ name: 'time' }],
    desc: 'Returns the hour component of a time.'
  },
  {
    name: 'MINUTE',
    params: [{ name: 'time' }],
    desc: 'Returns the minute component of a time.'
  },
  {
    name: 'MONTH',
    params: [{ name: 'date' }],
    desc: 'Returns the month component of a date.'
  },
  {
    name: 'MONTHNAME',
    params: [{ name: 'date' }],
    desc: 'Returns the name of the month.'
  },
  {
    name: 'NOW',
    params: [],
    desc: 'Returns the current timestamp.'
  },
  {
    name: 'SECOND',
    params: [{ name: 'time' }],
    desc: 'Returns the second component of a time.'
  },
  {
    name: 'TO_DATE',
    params: [{ name: 'string' }, { name: 'format' }],
    desc: 'Converts a string to a DATE value.'
  },
  {
    name: 'TO_TIMESTAMP',
    params: [{ name: 'string' }, { name: 'format' }],
    desc: 'Converts a string to a TIMESTAMP value.'
  },
  {
    name: 'YEAR',
    params: [{ name: 'date' }],
    desc: 'Returns the year component of a date.'
  }
];

/**
 * SAP HANA aggregate functions
 */
const aggregateFunctions: IFunction[] = [
  {
    name: 'AVG',
    params: [{ name: 'expression' }],
    desc: 'Returns the average value of the expression.'
  },
  {
    name: 'COUNT',
    params: [{ name: 'expression' }],
    desc: 'Returns the number of rows or non-null values.'
  },
  {
    name: 'MAX',
    params: [{ name: 'expression' }],
    desc: 'Returns the maximum value of the expression.'
  },
  {
    name: 'MIN',
    params: [{ name: 'expression' }],
    desc: 'Returns the minimum value of the expression.'
  },
  {
    name: 'SUM',
    params: [{ name: 'expression' }],
    desc: 'Returns the sum of values of the expression.'
  },
  {
    name: 'STRING_AGG',
    params: [{ name: 'expression' }, { name: 'delimiter' }],
    desc: 'Concatenates values of string expressions with a specified delimiter.'
  }
];

/**
 * SAP HANA conversion functions
 */
const conversionFunctions: IFunction[] = [
  {
    name: 'CAST',
    params: [{ name: 'expression' }, { name: 'data_type' }],
    desc: 'Converts an expression to the specified data type.',
    body: 'CAST(${1:expression} AS ${2:data_type})'
  },
  {
    name: 'TO_BIGINT',
    params: [{ name: 'expression' }],
    desc: 'Converts a value to BIGINT.'
  },
  {
    name: 'TO_DECIMAL',
    params: [{ name: 'expression' }, { name: 'precision' }, { name: 'scale' }],
    desc: 'Converts a value to DECIMAL.'
  },
  {
    name: 'TO_DOUBLE',
    params: [{ name: 'expression' }],
    desc: 'Converts a value to DOUBLE.'
  },
  {
    name: 'TO_INT',
    params: [{ name: 'expression' }],
    desc: 'Converts a value to INT.'
  },
  {
    name: 'TO_INTEGER',
    params: [{ name: 'expression' }],
    desc: 'Converts a value to INTEGER.'
  },
  {
    name: 'TO_NVARCHAR',
    params: [{ name: 'expression' }],
    desc: 'Converts a value to NVARCHAR.'
  },
  {
    name: 'TO_VARCHAR',
    params: [{ name: 'expression' }],
    desc: 'Converts a value to VARCHAR.'
  },
  {
    name: 'COALESCE',
    params: [{ name: 'expression1' }, { name: 'expression2' }],
    desc: 'Returns the first non-null expression.'
  },
  {
    name: 'IFNULL',
    params: [{ name: 'expression' }, { name: 'alternative' }],
    desc: 'Returns the expression if it is not null, otherwise returns the alternative.'
  },
  {
    name: 'NULLIF',
    params: [{ name: 'expression1' }, { name: 'expression2' }],
    desc: 'Returns null if the two expressions are equal, otherwise returns expression1.'
  }
];

/**
 * SAP HANA system functions
 */
const systemFunctions: IFunction[] = [
  {
    name: 'CURRENT_SCHEMA',
    params: [],
    desc: 'Returns the current schema name.'
  },
  {
    name: 'CURRENT_USER',
    params: [],
    desc: 'Returns the current user name.'
  },
  {
    name: 'SESSION_USER',
    params: [],
    desc: 'Returns the session user name.'
  },
  {
    name: 'SESSION_CONTEXT',
    params: [{ name: 'key' }],
    desc: 'Returns the value of the specified session context variable.'
  }
];

const functions: IFunction[] = [
  ...stringFunctions,
  ...numericFunctions,
  ...dateTimeFunctions,
  ...aggregateFunctions,
  ...conversionFunctions,
  ...systemFunctions
];

export default functions;
