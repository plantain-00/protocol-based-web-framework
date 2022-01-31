import { Configuration } from 'clean-release'

const config: Configuration = {
  include: [
    'packages/*/dist/*',
    'packages/*/bin/*',
    'packages/*/package.json',
    'packages/*/README.md',
  ],
  exclude: [
  ],
  base: (p) => p.startsWith('packages/script/dist') ? 'packages/script' + p.substring('packages/script/dist'.length) : p,
  askVersion: true,
  changesGitStaged: true,
  postScript: ({ dir, tag, version, effectedWorkspacePaths = [] }) => [
    ...effectedWorkspacePaths.map((w) => w.map((e) => {
      return tag
        ? `npm publish "${dir}/${e}" --access public --tag ${tag}`
        : `npm publish "${dir}/${e}" --access public`
    })),
    `git commit -m "${version}"`,
    `git tag -a v${version} -m 'v${version}'`,
    'git push',
    `git push origin v${version}`
  ]
}

export default config
