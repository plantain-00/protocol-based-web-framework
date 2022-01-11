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
    'DB_SCHEMA_PATH=./db-schema OUTPUT_PATH=./dev/db-declaration.ts DB_DECLARATION_LIB_PATH=../dist/nodejs types-as-schema ./dev/db-schema.ts --config ./scripts/db.ts',
    'RESTFUL_API_SCHEMA_PATH=./restful-api-schema BACKEND_OUTPUT_PATH=./dev/restful-api-backend-declaration.ts FRONTEND_OUTPUT_PATH=./dev/restful-api-frontend-declaration.ts BACKEND_DECLARATION_LIB_PATH=../dist/nodejs FRONTEND_DECLARATION_LIB_PATH=../dist/browser types-as-schema ./dev/restful-api-schema.ts ./dev/db-schema.ts --swagger ./dev/swagger.json --config ./scripts/restful-api.ts',
  ],
  dev: {
    server: 'ts-node-dev ./dev/server.ts',
    client: 'webpack serve --config ./dev/webpack.config.js'
  },
  lint: {
    ts: `eslint --ext .js,.ts ${tsFiles}`,
    export: `no-unused-export "src/**/*.ts" --strict --need-module tslib --ignore-module sqlite3 --ignore-module types-as-schema --ignore-module express --ignore-module mongodb --ignore-module pg --ignore-module axios --ignore-module node-fetch --ignore-module form-data`,
    markdown: `markdownlint README.md`,
    typeCoverageSrc: 'type-coverage -p src/tsconfig.nodejs.json --strict',
    typeCoverageDev: 'type-coverage -p dev --strict --ignore-files "dist/**/*.d.ts"',
    typeCoverageScripts: 'type-coverage -p scripts --strict'
  },
  test: 'ava',
  fix: `eslint --ext .js,.ts ${tsFiles} --fix`
}
