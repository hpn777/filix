import fs from 'fs'

import yaml from 'js-yaml'

import { AppServiceConfig } from '../../typings/config'
import { logger } from './index'

export type GetConfigurationArgs = {
  configurationFilePath?: string
  moduleName?: string
}

/**
 * Replace environment variable placeholders in a string
 * Supports ${VAR} and ${VAR:-default} syntax
 */
function replaceEnvVars(str: string): string {
  return str.replace(/\$\{([^}:]+)(?::(-[^}]+))?\}/g, (match, varName, defaultValue) => {
    const value = process.env[varName]
    if (value !== undefined) {
      return value
    }
    if (defaultValue !== undefined) {
      return defaultValue.substring(1) // Remove the leading '-'
    }
    return match // Keep original if no value or default
  })
}

/**
 * Recursively replace environment variables in configuration object
 */
function substituteEnvVars(obj: any): any {
  if (typeof obj === 'string') {
    return replaceEnvVars(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(substituteEnvVars)
  }
  if (obj && typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      result[key] = substituteEnvVars(obj[key])
    }
    return result
  }
  return obj
}

export const getConfiguration = ({
  configurationFilePath = './config/all.yml',
  moduleName,
}: Partial<GetConfigurationArgs> = {}): AppServiceConfig | null | void => {
  try {
    const fileContent = fs.readFileSync(configurationFilePath, 'utf8')
    const config = yaml.load(fileContent) || null
    
    // Substitute environment variables in the configuration
    return config ? substituteEnvVars(config) : null
  } catch (error) {
    logger.error(`Error while reading configuration file ${error}`, {
      module: moduleName,
    })
  }
}
