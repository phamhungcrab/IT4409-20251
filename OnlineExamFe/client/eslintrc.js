/**
 * ESLint configuration for the online examination client.
 *
 * This configuration enables linting of TypeScript and React code,
 * applies recommended rules from ESLint, TypeScript, React and React
 * Hooks, and defines the environment to include browser globals.  You
 * can extend or override individual rules under the `rules` section.
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: false,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  plugins: ['react', '@typescript-eslint'],
  rules: {
    // Example: require explicit return types on exported functions
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Example: disable the prop-types rule for TypeScript code
    'react/prop-types': 'off',
    // Customize indentation (2 spaces) if desired
    'indent': ['error', 2],
    // Allow JSX in TSX files only
    'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
  },
  ignorePatterns: ['dist/', 'build/', 'node_modules/'],
};