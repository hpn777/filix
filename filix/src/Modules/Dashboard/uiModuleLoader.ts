import fs from 'fs'
import path from 'path'

const loadDefinition = (fixturesPath: string, filePath: string) => {
  return fs.readFileSync(path.resolve(fixturesPath, filePath), 'utf8')
}

export const uiModuleLoader = (fixturesPath: string) => {
  const indexPath = path.resolve(fixturesPath, 'uiModulesIndex.json')

  if (!fs.existsSync(indexPath)) {
    return {}
  }

  const indexContent = fs.readFileSync(indexPath, 'utf8')
  const uiModulesIndex = JSON.parse(indexContent)

  const data = uiModulesIndex.reduce((defs, module) => {
    module.versions.forEach((version: any) => {
      const def = loadDefinition(fixturesPath, version.path)
      const re = /\({(.|\n)*}\)/gm
      const defParsed = re.exec(def)
      if (defParsed) {
        version.config = defParsed[0]
      } else {
        throw new Error(
          `Error while parsing module version definition: ${version.path}`,
        )
      }
    })
    defs[module.id] = module
    return defs
  }, {})

  return data
}
