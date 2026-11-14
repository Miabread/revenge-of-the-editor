// oxfmt.config.ts
import { defineConfig } from 'oxfmt';

export default defineConfig({
    semi: true,
    trailingComma: 'all',
    singleQuote: true,
    tabWidth: 4,
    printWidth: 120,
    ignorePatterns: ['dist/**'],
});
