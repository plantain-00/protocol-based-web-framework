import { Configuration } from 'clean-release'

const config: Configuration = {
  include: [
    'dist/**/*.js',
    'dist/**/*.d.ts',
    'dist/index.d.ts',
    'scripts/**/*.ts',
    'LICENSE',
    'package.json',
    'README.md'
  ],
  exclude: [
  ],
  base: [
    'dist',
    'scripts',
  ],
  askVersion: true,
  changesGitStaged: true,
  postScript: ({ dir, tag, version }) => [
    tag ? `npm publish "${dir}" --access public --tag ${tag}` : `npm publish "${dir}" --access public`,
    'git add package.json',
    `git commit -m "${version}"`,
    `git tag -a v${version} -m 'v${version}'`,
    'git push',
    `git push origin v${version}`
  ]
}

export default config
