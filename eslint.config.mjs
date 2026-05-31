import js from '@eslint/js';
import mocha from 'eslint-plugin-mocha';

const browserGlobals = {
  clearInterval: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  document: 'readonly',
  global: 'writable',
  navigator: 'readonly',
  setInterval: 'readonly',
  setTimeout: 'readonly',
  window: 'readonly',
};

export default [
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: browserGlobals,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', {args: 'none'}],
    },
  },
  {
    files: ['test/**/*.js'],
    plugins: {mocha},
    languageOptions: {
      globals: {
        ...browserGlobals,
        ...mocha.configs.recommended.languageOptions.globals,
      },
    },
    rules: {
      ...mocha.configs.recommended.rules,
      'mocha/max-top-level-suites': 'off',
    },
  },
  {
    files: ['test/mochaBootstrap.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
];
