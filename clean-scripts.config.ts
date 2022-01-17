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
      ],
      script: 'tsc -p scripts'
    },
    'OUTPUT_PATH=./dev/db-declaration.ts DB_DECLARATION_LIB_PATH=../dist/nodejs types-as-schema ./dev/**/*.schema.ts --config ./dist/db',
    'BACKEND_OUTPUT_PATH=./dev/restful-api-backend-declaration.ts FRONTEND_OUTPUT_PATH=./dev/restful-api-frontend-declaration.ts BACKEND_DECLARATION_LIB_PATH=../dist/nodejs FRONTEND_DECLARATION_LIB_PATH=../dist/browser types-as-schema ./dev/**/*.schema.ts --swagger ./dev/swagger.json --config ./dist/restful-api',
    'OUTPUT_PATH=./dev/router-declaration.ts ROUTER_DECLARATION_LIB_PATH=../dist/browser types-as-schema ./dev/**/*.schema.ts --config ./dist/router',
  ],
  dev: {
    server: 'ts-node-dev ./dev/server.ts',
    client: 'webpack serve --config ./dev/webpack.config.js'
  },
  lint: {
    ts: `eslint --ext .js,.ts ${tsFiles}`,
    export: `no-unused-export "src/**/*.ts" --strict --need-module tslib --need-module path-to-regexp --need-module types-as-schema --ignore-module sqlite3 --ignore-module types-as-schema --ignore-module express --ignore-module mongodb --ignore-module pg --ignore-module axios --ignore-module node-fetch --ignore-module form-data --ignore-module react`,
    markdown: `markdownlint README.md`,
    typeCoverageSrc: 'type-coverage -p src/tsconfig.nodejs.json --strict',
    typeCoverageDev: 'type-coverage -p dev --strict --ignore-files "dist/**/*.d.ts"',
    typeCoverageScripts: 'type-coverage -p scripts --strict'
  },
  test: 'ava',
  fix: `eslint --ext .js,.ts ${tsFiles} --fix`
}
