const Enumerable = require('linq')
import { backbone } from 'tessio'
import { Model } from './model'
import { generateGuid } from '../utils/generateGuid'

class Collection extends backbone.Collection {
  // Backbone Collection methods that need type declarations
  declare each: (iterator: (element: any, index: number, list: any[]) => void, context?: any) => void
  
  // Set the default model for this collection
  model = Model

  cloneAll(): any[] {
    const items: any[] = []
    this.each((x: any) => {
      // Use Backbone's clone method to get a new Model instance
      items.push(x.clone())
    })
    return items
  }

  toEnumerable(): any {
    return Enumerable.from(this.models)
  }

  guid() {
    return generateGuid()
  }
}

export { Collection }
