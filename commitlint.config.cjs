/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce type(scope): message — scope is required
    'scope-empty': [2, 'never'],
  },
};
