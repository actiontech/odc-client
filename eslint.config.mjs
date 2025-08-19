import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginImport from 'eslint-plugin-import';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginNode from 'eslint-plugin-node';

// TODO 后续希望由 DMS-KIT 导出 eslint 等相关配置
export default defineConfig([
  tseslint.configs.recommended,
  {
    files: ['**/scripts/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: {
      import: pluginImport,
      node: pluginNode
    },
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  },
  {
    files: ['src/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ...pluginReact.configs.flat.recommended,
    plugins: {
      import: pluginImport,
      react: pluginReact,
      'react-hooks': pluginReactHooks
    },
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser
      }
    },
    settings: {
      react: {
        pragma: 'React',
        version: 'detect'
      }
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'no-shadow': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-shadow': 'off', // todo
      'no-shadow-restricted-names': 'error',
      'testing-library/render-result-naming-convention': 0,
      'prefer-const': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      'no-extra-boolean-cast': 'off',
      'import/no-anonymous-default-export': [2, { allowNew: true }],
      '@typescript-eslint/no-empty-interface': [
        'error',
        {
          allowSingleExtends: true
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'react/display-name': 0,
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-template-curly-in-string': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      'import/no-anonymous-default-export': 'warn'
    }
  },
  globalIgnores([
    'jest.config.js',
    'eslint.config.mjs',
    'src/**/*.test.ts',
    'src/**/*.test.tsx',
    'src/shared/lib/api/*',
    'src/**/mockApi/*',
    'src/**/testUtil/*',
    'jest-setup.ts',
    'node_modules/*',
    'scripts/jest/*.js',
    '/node_modules/*',
    'dist',
    'src/*/dist',
    'src/*/scripts',
    'es'
  ])
]);
