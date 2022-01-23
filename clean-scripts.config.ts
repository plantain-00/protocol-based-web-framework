const tsFiles = `"src/**/*.ts" "scripts/**/*.ts"`

const environments = [
  'DB_OUTPUT_PATH=./dev/generated/db-declaration.ts',
  'ROUTER_OUTPUT_PATH=./dev/generated/router-declaration.ts',
  'BACKEND_OUTPUT_PATH=./dev/generated/restful-api-backend-declaration.ts',
  'FRONTEND_OUTPUT_PATH=./dev/generated/restful-api-frontend-declaration.ts',
  'IMPORT_PAGE_OUTPUT_PATH=./dev/generated/import-pages.ts',
  'IMPORT_CONTROLLER_OUTPUT_PATH=./dev/generated/import-controllers.ts',
  'IMPORT_STORY_OUTPUT_PATH=./dev/generated/import-stories.ts',
  'BACKEND_DECLARATION_LIB_PATH=../../dist/nodejs/index.js',
  'FRONTEND_DECLARATION_LIB_PATH=../../dist/browser',
]

const configs = [
  './dist/db',
  './dist/restful-api',
  './dist/router',
  './dist/import-pages',
  './dist/import-controllers',
  './dist/import-stories',
]

const files = [
  './dev/**/*.schema.ts',
  './dev/**/*.page.tsx',
  './dev/**/*.controller.ts',
  './dev/**/*.story.tsx',
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
    `${environments.join(' ')} types-as-schema ${files.join(' ')} --swagger ./dev/generated/swagger.json ${configs.map((c) => '--config ' + c).join(' ')}`,
  ],
  dev: {
    server: 'TS_NODE_PROJECT="./dev/tsconfig.json" node --loader ts-node/esm ./dev/server.ts',
    story: 'webpack serve --config ./dev/webpack.story.config.cjs',
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
