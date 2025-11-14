import fs from 'fs'
import path from 'path'

import { logger } from '../../utils/logger'
import { uiModuleLoader } from './uiModuleLoader'

export interface DashboardFixtures {
  path: string
  controlPresets: any[]
  tabPresets: any[]
  uiModules: Record<string, any>
}

export const loadDashboardFixtures = (
  moduleName: string,
  configuredPath?: string,
): DashboardFixtures => {
  const fixturesPath = resolveFixturesPath(moduleName, configuredPath)

  return {
    path: fixturesPath,
    controlPresets: loadJson(fixturesPath, 'control_preset.json', moduleName) ?? [],
    tabPresets: loadJson(fixturesPath, 'tab_preset.json', moduleName) ?? [],
    uiModules: uiModuleLoader(fixturesPath),
  }
}

const resolveFixturesPath = (moduleName: string, configuredPath?: string): string => {
  if (configuredPath) {
    const absolutePath = path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(process.cwd(), configuredPath)

    if (fs.existsSync(absolutePath)) {
      return absolutePath
    }

    logger.warn(`Configured fixtures path not found: ${absolutePath}. Falling back to default.`, {
      module: moduleName,
    })
  }

  return path.resolve(__dirname, '../../fixtures')
}

const loadJson = <T = any>(fixturesPath: string, fileName: string, moduleName: string): T | null => {
  const filePath = path.resolve(fixturesPath, fileName)

  if (!fs.existsSync(filePath)) {
    logger.warn(`Dashboard fixture not found: ${filePath}`, {
      module: moduleName,
    })
    return null
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content) as T
  } catch (error) {
    logger.error(`Failed to load fixture ${filePath}: ${error}`, {
      module: moduleName,
    })
    return null
  }
}
