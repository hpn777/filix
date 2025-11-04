const fs = require('fs')
const path = require('path')

import uiModulesIndex from '../../fixtures/uiModulesIndex.json'

const loadDefinition = filePath => {
  return fs.readFileSync(
    path.resolve(`${__dirname}/../../fixtures/${filePath}`),
    'utf8',
  )
}

export const uiModuleLoader = () => {
  if (!uiModulesIndex) {
    return {}
  }

  const data = uiModulesIndex.reduce((defs, module) => {
    module.versions.forEach((version: any) => {
      const def = loadDefinition(version.path)
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
