import type { ModuleRegistration } from 'filix'
import { GenericBaseModule } from 'filix'

// Export registrations for custom modules that should be wired into the service.
// Consumers can push additional ModuleRegistration entries to this array.
export const customModuleRegistrations: ModuleRegistration<GenericBaseModule>[] = []
