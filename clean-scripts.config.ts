const tsFiles = `"src/**/*.ts"`

const environments = [
  'DB_OUTPUT_PATH=./dev/generated/db-declaration.ts',
  'ROUTER_OUTPUT_PATH=./dev/generated/router-declaration.ts',
  'BACKEND_OUTPUT_PATH=./dev/generated/restful-api-backend-declaration.ts',
  'FRONTEND_OUTPUT_PATH=./dev/generated/restful-api-frontend-declaration.ts',
  'BACKEND_DECLARATION_LIB_PATH=../../dist/nodejs/index.js',
  'FRONTEND_DECLARATION_LIB_PATH=../../dist/browser',
]

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
    `${environments.join(' ')} types-as-schema ./dev/**/*.schema.ts --swagger ./dev/generated/swagger.json --config ./dist/db --config ./dist/restful-api --config ./dist/router`,
  ],
  dev: {
    server: 'TS_NODE_PROJECT="./dev/tsconfig.json" node --loader ts-node/esm ./dev/server.ts',
    client: 'webpack serve --config ./dev/webpack.config.cjs'
  },
  lint: {
    ts: `eslint --ext .js,.ts ${tsFiles}`,
    export: `no-unused-export "src/**/*.ts" --strict --need-module tslib --need-module path-to-regexp --need-module types-as-schema --ignore-module sqlite3 --ignore-module types-as-schema --ignore-module express --ignore-module mongodb --ignore-module pg --ignore-module axios --ignore-module node-fetch --ignore-module form-data --ignore-module react`,
    markdown: `markdownlint README.md`,
    typeCoverageSrc: 'type-coverage -p src/tsconfig.nodejs.json --strict',
    typeCoverageDev: 'type-coverage -p dev --strict --ignore-files "dist/**/*.d.ts"',
    typeCoverageScripts: 'type-coverage -p scripts --strict'
  },
  test: 'TS_NODE_PROJECT="./dev/tsconfig.json" ava',
  fix: `eslint --ext .js,.ts ${tsFiles} --fix`
}
