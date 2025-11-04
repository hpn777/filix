/**
 * Common type definitions shared across modules
 */

import { Subscription } from '../Model/subscriptions'
import type { ColumnDef as TessioColumnDef } from 'tessio/dist/types'

/**
 * Base request structure for module endpoints
 */
export interface BaseModuleRequest<T = any> {
  requestId: string
  subscription?: Subscription
  parameters: T
}

/**
 * Re-export Tesseract's ColumnDef as the standard column definition
 * This ensures compatibility with Tesseract's API and avoids duplication
 */
export type ColumnDef = TessioColumnDef

/**
 * Common response structure for data operations
 */
export interface DataResponse {
  data?: any[]
  header?: ColumnDef[]
  type?: 'reset' | 'update' | 'remove'
  total?: number
  page?: number
  reload?: boolean
  success?: boolean
  error?: any
}

/**
 * Common parameters for data retrieval requests
 */
export interface DataRequestParameters {
  command?: string
  rpc?: boolean
  page?: number
  reload?: boolean
  requestId?: string
  filter?: any[]
  sort?: any[]
}
