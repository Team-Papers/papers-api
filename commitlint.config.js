module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'users',
        'books',
        'authors',
        'purchases',
        'payments',
        'reviews',
        'library',
        'admin',
        'notifications',
        'upload',
        'bookmarks',
        'categories',
        'middleware',
        'config',
        'prisma',
        'deps',
      ],
    ],
    'subject-max-length': [2, 'always', 72],
  },
};
