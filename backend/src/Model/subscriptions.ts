import { backbone, lodash as _ } from 'tessio'

// Type for module endpoint callbacks
type ModuleEndpoint = (responseData: unknown, requestId?: string) => void

// Subscription data interface
export interface SubscriptionData {
  id?: string
  requestId?: string
  clientId?: string
  containerId?: string
  moduleId?: string
  connectionType?: string
  userId?: string
  authToken?: string
  publish?: PublishFunction
  publishError?: PublishFunction
  parameters?: any  // Backward compatibility for dynamic properties
  [key: string]: any  // Allow dynamic properties for flexibility
}

// Backbone options interface
interface BackboneOptions {
  parse?: boolean
  silent?: boolean
  collection?: any
}

// Publish function type
type PublishFunction = (responseData: unknown, requestId?: string) => void

export class Subscription extends backbone.Model {
  // Allow dynamic properties for backward compatibility
  [key: string]: any
  
  public id: string = ''
  public requestId: string = ''
  public clientId: string = ''
  public containerId: string = ''
  public moduleId: string = ''
  public connectionType: string = ''
  public userId: string = ''
  public authToken: string = ''
  public publish: PublishFunction = function (_responseData, _requestId) {}
  public publishError: PublishFunction = function (_responseData, _requestId) {}

  constructor(item?: Partial<SubscriptionData>, options?: BackboneOptions) {
    super(item, options)
    if (item) {
      Object.assign(this, item)
    }
  }

  remove(): void {
    this.trigger('remove', this)
    this.off('remove')
    this.collection?.remove(this)
    this.off()
  }
}

export class Subscriptions extends backbone.Collection {
  model = Subscription
  
  // Backbone Collection methods - using ! to indicate they're inherited
  declare each: (iterator: (element: Subscription, index: number, list: Subscription[]) => void, context?: any) => void
  declare where: (properties: Partial<SubscriptionData>) => Subscription[]
}
