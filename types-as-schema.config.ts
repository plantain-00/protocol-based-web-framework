import { Configuration } from 'types-as-schema'
import {
  generateBrowserStorageDeclaration,
  generateDbDeclaration,
  generateRestfulApiDeclaration,
  generateRouterDeclaration,
  generateImportFunctionsDeclaration,
  generateImportStoriesDeclaration,
} from 'protocol-based-web-framework/dist'

const config: Configuration = {
  files: [
    './dev/**/*.schema.ts',
    './dev/**/*.page.tsx',
    './dev/**/*.controller.ts',
    './dev/**/*.story.tsx',
    './dev/**/*.component.tsx',
  ],
  swagger: {
    outputPath: './dev/generated/swagger.json',
    base: {
      info: {}
    },
  },
  plugins: [
    (typeDeclarations) => generateDbDeclaration(typeDeclarations, './dev/generated/db-declaration.ts'),
    (typeDeclarations) => generateRestfulApiDeclaration(typeDeclarations, './dev/generated/restful-api-backend-declaration.ts', './dev/generated/restful-api-frontend-declaration.ts'),
    (typeDeclarations) => generateRouterDeclaration(typeDeclarations, './dev/generated/router-declaration.ts'),
    (typeDeclarations) => generateBrowserStorageDeclaration(typeDeclarations, './dev/generated/local-storage-declaration.ts', 'localStorage'),
    (typeDeclarations) => generateImportFunctionsDeclaration(typeDeclarations, './dev/generated/import-pages.ts', (file) => file.endsWith('.page.tsx')),
    (typeDeclarations) => generateImportFunctionsDeclaration(typeDeclarations, './dev/generated/import-controllers.ts', (file) => file.endsWith('.controller.ts'), true),
    (typeDeclarations) => generateImportStoriesDeclaration(typeDeclarations, './dev/generated/import-stories.ts'),
  ],
}

export default config
