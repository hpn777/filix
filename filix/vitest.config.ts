import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Global setup/teardown - Use global-setup.ts only for local WebSocket tests
    // In Docker, skip global-setup.ts by setting IN_DOCKER=true
    globalSetup: ['./tests/setup.ts', './tests/global-setup.ts'],
    
    // Test patterns - Focus on integration tests
    include: [
      'tests/integration/**/*.{test,spec}.ts',
      'src/**/*.integration.{test,spec}.ts'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      'src/**/*.test.ts',  // Exclude unit tests
      'src/**/*.spec.ts',  // Exclude unit tests
      'tests/gattaca/**/*'  // Keep separate test suite
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.integration.test.ts',
        'src/**/*.integration.spec.ts',
        'src/types/**',
        'src/fixtures/**',
        'src/server.ts',
        'tests/**'
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60
      }
    },
    
    // Performance - use threads for parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    },
    
    // Timeouts - Increased for integration tests
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    
    // Watch mode configuration
    watch: false,
    
    // Reporter configuration
    reporters: process.env.CI 
      ? ['verbose', 'json', 'html'] 
      : ['verbose'],
    
    // Globals - makes describe, it, expect available without imports
    globals: true,
    
    // Path aliases
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
      'Model': path.resolve(__dirname, './src/Model'),
      'Modules': path.resolve(__dirname, './src/Modules'),
      'Connectors': path.resolve(__dirname, './src/Connectors')
    },
    
    // Setup files
    setupFiles: [],
    
    // Retry failed tests
    retry: process.env.CI ? 2 : 0,
    
    // Isolation
    isolate: true,
    
    // Clear mocks between tests
    clearMocks: true,
    mockReset: true,
    restoreMocks: true
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
      'Model': path.resolve(__dirname, './src/Model'),
      'Modules': path.resolve(__dirname, './src/Modules'),
      'Connectors': path.resolve(__dirname, './src/Connectors')
    }
  }
})
