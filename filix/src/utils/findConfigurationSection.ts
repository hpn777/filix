import { findValueByKey } from './findValueByKey'

const findConfigurationSection = (configuration, array) => {
  if (!array.length) {
    return configuration
  }

  const config = findValueByKey(configuration, array.shift())

  return findConfigurationSection(config, array)
}

export default findConfigurationSection
