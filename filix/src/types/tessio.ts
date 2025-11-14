/**
 * Tessio 4.0.1 TypeScript Type Definitions
 * Re-exports native Tessio types for easy access throughout the application
 * 
 * IMPORTANT: Do not duplicate types from Tessio here!
 * Just re-export what Tessio provides to avoid maintenance burden.
 */

import type {
  Tesseract,
  EventHorizon,
  Cluster,
  ClusterRedis,
} from 'tessio'

import type { Session } from 'tessio/dist/lib/session'

import type {
  FilterDef,
  SortDef,
  ColumnDef,
  CreateSessionParameters,
  DataUpdate,
  GroupNode,
  DataRow,
  ResolveConfig,
} from 'tessio/dist/types'

// Re-export Tessio types without duplication
export type {
  Tesseract,
  Session,
  EventHorizon,
  Cluster,
  ClusterRedis,
  FilterDef,
  SortDef,
  ColumnDef,
  CreateSessionParameters,
  DataUpdate,
  GroupNode,
  DataRow,
  ResolveConfig,
}