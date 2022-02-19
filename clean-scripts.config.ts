import { Tasks, readWorkspaceDependencies } from 'clean-scripts'

const tsFiles = `"packages/**/src/**/*.ts"`

const workspaces = readWorkspaceDependencies()

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
    'types-as-schema -p ./types-as-schema.config.ts',
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
    typeCoverageSrc: workspaces.map((d) => `type-coverage -p ${d.path} --ignore-nested --ignore-empty-type --strict`),
    typeCoverageDev: 'type-coverage -p dev --strict --ignore-nested --ignore-empty-type --ignore-files "packages/**/*.d.ts"',
  },
  test: 'TS_NODE_PROJECT="./dev/tsconfig.json" ava',
  fix: `eslint --ext .js,.ts ${tsFiles} --fix`
}
