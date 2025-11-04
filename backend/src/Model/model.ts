import { backbone } from 'tessio'
import { generateGuid } from '../utils/generateGuid'

interface ModelAttributes {
  [key: string]: any
}

interface ModelOptions {
  parse?: boolean
  silent?: boolean
  collection?: any
}

class Model extends backbone.Model {
  constructor(item?: Partial<ModelAttributes>, options?: ModelOptions) {
    super(item, options)
  }

  remove(): void {
    this.trigger('remove', this)
    this.off('remove')
    this.collection?.remove(this as any)
    this.off()
  }

  cloneAttributes(selectedAttributes?: string[]): Record<string, any> {
    const clonedObj: Record<string, any> = {}
    if (selectedAttributes) {
      for (let i = 0; i < selectedAttributes.length; i++) {
        clonedObj[selectedAttributes[i]] = this.get(selectedAttributes[i])
      }
    } else {
      for (const attr in this.attributes) {
        switch (attr) {
          case 'collection':
            break
          default:
            clonedObj[attr] = this.get(attr)
            break
        }
      }
    }
    return clonedObj
  }

  guid() {
    return generateGuid()
  }
}

export { Model }
