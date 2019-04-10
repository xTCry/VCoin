module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'extends': 'standard',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
  },
  'rules': {
    'one-var': ['off', 'never'],
    'camelcase': ['off'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-return-await': ['warn'],
    'no-unused-vars': ['warn'],
    'brace-style': [0, '1tbs', { 'allowSingleLine': true }],
  },
}
