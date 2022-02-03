import { Tasks, readWorkspaceDependencies } from 'clean-scripts'

const tsFiles = `"packages/**/src/**/*.ts"`

const workspaces = readWorkspaceDependencies()

const environments = [
  'DB_OUTPUT_PATH=./dev/generated/db-declaration.ts',
  'ROUTER_OUTPUT_PATH=./dev/generated/router-declaration.ts',
  'BACKEND_OUTPUT_PATH=./dev/generated/restful-api-backend-declaration.ts',
  'FRONTEND_OUTPUT_PATH=./dev/generated/restful-api-frontend-declaration.ts',
  'LOCAL_STORAGE_OUTPUT_PATH=./dev/generated/local-storage-declaration.ts',
  'IMPORT_PAGE_OUTPUT_PATH=./dev/generated/import-pages.ts',
  'IMPORT_CONTROLLER_OUTPUT_PATH=./dev/generated/import-controllers.ts',
  'IMPORT_STORY_OUTPUT_PATH=./dev/generated/import-stories.ts',
]

const configs = [
  'protocol-based-web-framework/dist/db',
  'protocol-based-web-framework/dist/restful-api',
  'protocol-based-web-framework/dist/router',
  'protocol-based-web-framework/dist/local-storage',
  'protocol-based-web-framework/dist/import-pages',
  'protocol-based-web-framework/dist/import-controllers',
  'protocol-based-web-framework/dist/import-stories',
]

const files = [
  './dev/**/*.schema.ts',
  './dev/**/*.page.tsx',
  './dev/**/*.controller.ts',
  './dev/**/*.story.tsx',
]

const nodejsPackages = [
  '@protocol-based-web-framework/restful-api-provider',
  '@protocol-based-web-framework/db',
]

export default {
  build: [
    new Tasks(workspaces.map((d) => ({
      name: d.name,
      script: [
        `rimraf ${d.path}/dist/`,
        `tsc -p ${d.path}`,
        ...(nodejsPackages.includes(d.name)? [
          `rimraf ${d.path}/cjs/`,
          `tsc -p ${d.path}/tsconfig.cjs.json`,
        ] : []),
      ],
      dependencies: d.dependencies
    }))),
    `${environments.join(' ')} types-as-schema ${files.map((f) => `"${f}"`).join(' ')} --swagger ./dev/generated/swagger.json --swagger-base ./dev/swagger.base.json ${configs.map((c) => '--config ' + c).join(' ')}`,
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
    typeCoverageSrc: workspaces.map((d) => `type-coverage -p ${d.path} --strict`),
    typeCoverageDev: 'type-coverage -p dev --strict --ignore-files "packages/**/*.d.ts"',
  },
  test: 'TS_NODE_PROJECT="./dev/tsconfig.json" ava',
  fix: `eslint --ext .js,.ts ${tsFiles} --fix`
}
