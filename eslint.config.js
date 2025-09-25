//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config';

export default [
    ...tanstackConfig,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/array-type': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            'import/order': 'warn',
        },
    },
];
