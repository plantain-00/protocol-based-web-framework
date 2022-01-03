const tsFiles = `"src/**/*.ts" "spec/**/*.ts"`

export default {
  build: [
    'rimraf dist/',
    {
      back: [
        'tsc -p src/tsconfig.nodejs.json',
        'api-extractor run --local'
      ],
      front: [
        'tsc -p src/tsconfig.browser.json'
      ]
    },
    'DB_SCHEMA_PATH=./db-schema OUTPUT_PATH=./dev/db-declaration.ts DB_DECLARATION_LIB_PATH=../dist types-as-schema ./dev/db-schema.ts --config ./dist/nodejs/generate-db-declaration.js',
    'RESTFUL_API_SCHEMA_PATH=./restful-api-schema BACKEND_OUTPUT_PATH=./dev/restful-api-backend-declaration.ts FRONTEND_OUTPUT_PATH=./dev/restful-api-frontend-declaration.ts BACKEND_DECLARATION_LIB_PATH=../dist/nodejs/restful-api-backend-declaration-lib FRONTEND_DECLARATION_LIB_PATH=../dist/nodejs/restful-api-frontend-declaration-lib types-as-schema ./dev/restful-api-schema.ts ./dev/db-schema.ts --swagger ./dev/swagger.json --config ./dist/nodejs/generate-restful-api-declaration.js',
  ],
  lint: {
    ts: `eslint --ext .js,.ts ${tsFiles}`,
    export: `no-unused-export "src/**/*.ts" --strict --need-module tslib --ignore-module sqlite3 --ignore-module types-as-schema --ignore-module express`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src/tsconfig.nodejs.json --strict',
    typeCoverageBrowser: 'type-coverage -p src/tsconfig.browser.json --strict'
  },
  test: 'ava',
  fix: `eslint --ext .js,.ts ${tsFiles} --fix`
}
