# Filix Backend

A general-purpose application server built with TypeScript and Node.js, providing modular WebSocket-based real-time communication, database management, and authentication services.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Modules](#modules)
- [Development](#development)
- [Docker Support](#docker-support)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

Filix Backend is a modular, WebSocket-driven application server designed for real-time data synchronization and management. It provides a flexible architecture where modules can be dynamically loaded and configured, supporting various data sources, authentication methods, and real-time communication patterns.

### Key Technologies

- **Runtime**: Node.js 24+
- **Language**: TypeScript 5.9+
- **Database**: PostgreSQL (via ORM3)
- **WebSocket**: ws library for real-time communication
- **Authentication**: Active Directory / LDAP support
- **Reactive Programming**: RxJS and Rx.js
- **Data Management**: Tessio framework
- **Testing**: Vitest with Docker integration
- **Configuration**: YAML-based configuration files

## Features

- **Modular Architecture**: Plug-and-play module system with dynamic loading
- **Real-time Communication**: WebSocket server with subscription-based data streaming
- **Database Management**: Generic database module with ORM support (PostgreSQL)
- **Authentication & Authorization**: 
  - Active Directory integration
  - LDAP support
  - Role-based access control (RBAC)
  - API key authentication
- **Dashboard Module**: Dynamic UI configuration and management
- **Generic DB Operations**: CRUD operations with filtering, sorting, and pagination
- **Data Streaming**: Real-time data updates via WebSocket subscriptions
- **Logging**: Winston-based structured logging
- **Type Safety**: Full TypeScript implementation with strict mode
- **Testing**: Comprehensive integration tests with Docker support

## Architecture

### Core Components

```
backend/
├── src/
│   ├── server.ts              # Application entry point
│   ├── subscriptionManager.ts # WebSocket subscription management
│   ├── Connectors/            # WebSocket and network connectors
│   ├── Modules/               # Pluggable modules
│   │   ├── GenericDB/         # Database CRUD operations
│   │   ├── Membership/        # Authentication & authorization
│   │   ├── Dashboard/         # UI configuration management
│   │   ├── WebSocketServer.ts # WebSocket server module
│   │   └── base.ts           # Base module class
│   ├── Model/                 # Data models
│   ├── utils/                 # Utility functions
│   └── types/                 # TypeScript type definitions
├── config/                    # Configuration files
├── tests/                     # Integration and unit tests
└── typings/                   # TypeScript type declarations
```

### Module System

The backend uses a plugin-based architecture where each module:
- Extends `BaseModule` or `GenericBaseModule`
- Declares public methods for API access
- Manages its own configuration
- Can depend on other modules
- Registers API endpoints automatically

### Data Flow

1. **Client Connection**: Client connects via WebSocket
2. **Authentication**: Credentials validated via Membership module
3. **Subscription**: Client subscribes to data streams
4. **Data Sync**: Real-time updates pushed to subscribed clients
5. **CRUD Operations**: Database operations via GenericDB module
6. **Authorization**: Access control enforced per operation

## Prerequisites

### Required

- Node.js >= 24.x
- npm >= 10.x
- PostgreSQL >= 15.x
- Docker & Docker Compose (for development and testing)

### Optional

- Active Directory / LDAP server (for authentication)
- Task (Taskfile) - for simplified command execution

## Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd filix/backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Build TypeScript**:
```bash
npm run build
```

4. **Set up the database**:
```bash
# Using Docker
cd ../devops/docker/local
docker-compose up postgresdb -d

# Or connect to your existing PostgreSQL instance
# Make sure to run the schema migrations in db/schemas/
```

## Configuration

Configuration is managed via YAML files in the `config/` directory.

### Main Configuration (`config/all.yml`)

```yaml
session_id: &session_id 1
cb_mem_path: &cb_mem_path './shm/cb.{session_id}.mem'

services:
  ui:
    session_id: *session_id
    membership_module: Membership
    modules:
      - id: Membership
        module_path: "./Modules/Membership"
        db_module: AppDB
        # Optional: Active Directory configuration
        # activeDirectory:
        #   usernameKey: 'sAMAccountName'
        #   adGroup: 'FILIX_Group'
        #   servers:
        #   - url: 'ldap://your-ad-server'
        #     baseDN: 'dc=example,dc=com'
        
      - id: AppDB
        module_path: "./Modules/GenericDB"
        autofetch: true
        db_config:
          protocol: pg
          user: filix_user
          password: filix_pass
          host: postgresdb
          port: 5432
          database: appData
          schema: public
          query:
            pool: true
```

### Test Configuration (`config/test.yml`)

A separate configuration for running tests with isolated database connections.

### Configuration Options

- **session_id**: Unique session identifier
- **membership_module**: Module handling authentication
- **modules**: Array of module configurations
  - **id**: Unique module identifier
  - **module_path**: Path to module implementation
  - **db_config**: Database connection parameters

## Running the Application

### Using NPM Scripts

```bash
# Build and start the application
npm run up

# Start only the application service
npm run appservice

# Start with SPA frontend
npm run spa

# Start all services
npm run all

# Stop all services
npm run stop
```

### Using Docker Compose

```bash
# Start all services
cd ../devops/docker/local
docker-compose up

# Start specific service
docker-compose up appservice

# View logs
docker-compose logs -f appservice
```

### Using Taskfile

```bash
# From project root
task up      # Start all services
task down    # Stop all services
task logs    # View logs
```

### Manual Execution

```bash
# Build first
npm run build

# Run with default config
node dist/server.js

# Run with custom config
node dist/server.js -c ./config/custom.yml

# Run with specific config section
node dist/server.js -c ./config/all.yml -s services.ui
```

### Command Line Arguments

- `-c, --config`: Path to configuration file (default: `./config/all.yml`)
- `-s, --config-section`: Configuration section to use (default: `ui`)

## Testing

The project uses Vitest for testing with Docker integration for realistic test environments.

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# Integration tests (Docker-based - recommended)
npm run test:integration:docker

# Coverage report
npm run test:coverage

# CI mode with coverage
npm run test:ci
```

### Integration Tests

Integration tests run in Docker containers with PostgreSQL and OpenLDAP:

```bash
# Start test environment
npm run test:docker:up

# Run tests inside Docker
npm run test:integration:inside-docker

# Stop test environment
npm run test:docker:down

# View logs
npm run test:docker:logs
```

### Test Structure

```
tests/
├── global-setup.ts           # Global test setup
├── setup.ts                  # Test configuration
├── integration/
│   ├── GenericDB/            # Database tests
│   ├── Membership/           # Authentication tests
│   └── WebSocket/            # WebSocket tests
├── ldap/                     # LDAP integration tests
└── ad/                       # Active Directory tests
```

### Test Environment Variables

- `IN_DOCKER=true`: Skip local WebSocket setup in Docker environment
- `NODE_ENV=test`: Enable test mode

## Modules

### GenericDB Module

Provides generic CRUD operations for database tables.

**Features**:
- Auto-generate models from database schema
- CRUD operations: `getData`, `setData`, `removeData`
- Filtering, sorting, and pagination
- Real-time data subscriptions
- Transaction support
- Data validation

**Public Methods**:
- `getData(request)`: Query data with filters
- `setData(request)`: Create/update records
- `removeData(request)`: Delete records
- `createModule(request)`: Create dynamic modules

### Membership Module

Handles authentication and authorization.

**Features**:
- User authentication (local and AD/LDAP)
- Role-based access control
- API key management
- Session management
- Permission checking

**Public Methods**:
- `login(request)`: Authenticate user
- `logout(request)`: End session
- `checkPermission(request)`: Verify access rights
- `getUsers(request)`: List users
- `getRoles(request)`: List roles

### Dashboard Module

Manages UI configuration and module metadata.

**Features**:
- Dynamic module configuration
- UI control definitions
- Field and column metadata
- Preset management
- Module version control

**Public Methods**:
- `getModules(request)`: List available modules
- `getModuleConfig(request)`: Get module configuration
- `saveModuleVersion(request)`: Save module version
- `getPresets(request)`: Get saved presets

### WebSocketServer Module

Manages WebSocket connections and message routing.

**Features**:
- WebSocket connection handling
- Message serialization/deserialization
- Subscription management
- Error handling
- Connection lifecycle management

### TailLog Module

Streams log files in real-time.

**Features**:
- Real-time log file monitoring
- Multiple file support
- Line-by-line streaming

## Development

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Run linter
npm run lint

# Format code
npm run prettify
```

### Type Checking

TypeScript is configured with strict mode:

```bash
# Type check
npx tsc --noEmit
```

### Watch Mode

For development with auto-rebuild:

```bash
npm run watch
```

### Path Aliases

The project uses TypeScript path aliases:

- `Model/*` → `src/Model/*`
- `Modules/*` → `src/Modules/*`
- `utils/*` → `src/utils/*`
- `fixtures/*` → `src/fixtures/*`
- `types/*` → `src/types/*`

### Adding a New Module

1. Create module directory: `src/Modules/YourModule/`
2. Implement module class extending `BaseModule`
3. Define public methods
4. Add configuration to `config/all.yml`
5. Register module in subscription manager

Example:

```typescript
// src/Modules/YourModule/index.ts
import { BaseModule } from '../base'

export class Module extends BaseModule {
  constructor(config, subscriptionManager) {
    super(config, subscriptionManager)
    this.moduleName = 'YourModule'
    
    // Register public methods
    this.publicMethods.set('yourMethod', this.yourMethod.bind(this))
  }

  async yourMethod(request) {
    // Implementation
    return { success: true }
  }
}
```

### Logging

Use the Winston-based logger:

```typescript
import { logger } from 'utils/logger'

logger.info('Message', { module: this.moduleName })
logger.error('Error message', { module: this.moduleName, error })
logger.debug('Debug info', { module: this.moduleName, data })
```

### Database Migrations

Database schemas are managed via Flyway:

```bash
# Migrations are in: db/schemas/
# Example: V0.0.0.1__appdata-2025-10-07_schemas.sql

# Run migrations (via Docker)
docker-compose -f ../devops/docker/docker-compose.yml up flyway
```

## Docker Support

### Development

```dockerfile
# Dockerfile for development
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "appservice"]
```

### Testing

The test environment includes:
- PostgreSQL 15
- OpenLDAP server
- Filix backend server

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up

# Run tests
docker-compose -f docker-compose.test.yml exec filix-server npm test
```

### Production

For production deployment, see `devops/docker/` for complete Docker configuration.

## API Documentation

### WebSocket Protocol

The backend communicates via WebSocket using a custom protocol:

#### Message Format

```javascript
{
  type: 'request' | 'response' | 'subscription',
  id: string,           // Request ID
  module: string,       // Module name
  method: string,       // Method name
  parameters: object,   // Method parameters
  apiKey: string,       // Authentication key
  data: any            // Response data
}
```

#### Example: Query Data

```javascript
// Request
{
  type: 'request',
  id: 'req-1',
  module: 'AppDB',
  method: 'getData',
  apiKey: 'your-api-key',
  parameters: {
    tableName: 'users',
    filter: [{ property: 'active', operator: '=', value: true }],
    sort: [{ property: 'name', direction: 'ASC' }],
    limit: 10,
    offset: 0
  }
}

// Response
{
  type: 'response',
  id: 'req-1',
  success: true,
  data: {
    data: [...],
    totalCount: 100
  }
}
```

#### Example: Subscribe to Data

```javascript
// Subscribe
{
  type: 'subscription',
  id: 'sub-1',
  module: 'AppDB',
  method: 'getData',
  apiKey: 'your-api-key',
  parameters: {
    tableName: 'users'
  }
}

// Updates arrive automatically
{
  type: 'update',
  subscriptionId: 'sub-1',
  data: [...]
}
```

### Common Operations

#### Authentication

```javascript
{
  module: 'Membership',
  method: 'login',
  parameters: {
    username: 'user',
    password: 'pass'
  }
}
```

#### Create/Update Data

```javascript
{
  module: 'AppDB',
  method: 'setData',
  apiKey: 'your-api-key',
  parameters: {
    tableName: 'users',
    data: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
}
```

#### Delete Data

```javascript
{
  module: 'AppDB',
  method: 'removeData',
  apiKey: 'your-api-key',
  parameters: {
    tableName: 'users',
    id: 1
  }
}
```

## Project Structure Details

### Source Code (`src/`)

- **server.ts**: Application entry point, initializes subscription manager
- **subscriptionManager.ts**: Manages module loading and subscriptions
- **Connectors/**: WebSocket and network communication
  - `WebSocket.ts`: WebSocket client connector
  - `CommandPortConnector.ts`: TCP command port
  - `TailLogConnector.ts`: Log file streaming
  - `UDPDiscovery.ts`: Service discovery
- **Modules/**: Application modules
  - `base.ts`: Base module class
  - `GenericDB/`: Database operations
  - `Membership/`: Authentication
  - `Dashboard/`: UI configuration
  - `WebSocketServer.ts`: WebSocket server
  - `TailLog.ts`: Log streaming
- **Model/**: Data models and ORM definitions
- **utils/**: Utility functions
  - `logger.ts`: Winston logger
  - `findConfigurationSection.ts`: Config parser
- **types/**: TypeScript type definitions

### Configuration (`config/`)

- `all.yml`: Main configuration
- `test.yml`: Test configuration

### Tests (`tests/`)

- `global-setup.ts`: Global test initialization
- `setup.ts`: Test environment setup
- `integration/`: Integration tests
- `ldap/`: LDAP tests
- `ad/`: Active Directory tests

### Documentation (`docs/`)

Various refactoring and architecture documentation:
- `backend-refactoring-summary.md`
- `comprehensive-refactoring-summary.md`
- `typescript-improvements.md`

## Environment Variables

- `HOSTNAME`: Server hostname (default: 'AppService')
- `NODE_ENV`: Environment (development/test/production)
- `IN_DOCKER`: Running inside Docker container
- `LOG_LEVEL`: Logging level (debug/info/warn/error)

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U filix_user -d appData

# View logs
docker logs filix-postgres
```

### Module Loading Errors

```bash
# Check module path in config
# Ensure module exports a class named 'Module'
# Verify module implements required methods
```

### WebSocket Connection Issues

```bash
# Check WebSocket server is listening
netstat -an | grep 3000

# Check firewall rules
# Verify client API key is valid
```

### Test Failures

```bash
# Clean Docker volumes
docker-compose -f docker-compose.test.yml down -v

# Rebuild containers
docker-compose -f docker-compose.test.yml up --build

# Check test database
docker exec filix-postgres-test psql -U filix_user -d appData -c '\dt'
```

## Performance Tuning

### Database

- Enable connection pooling (enabled by default)
- Optimize queries with proper indexes
- Use pagination for large datasets
- Implement caching where appropriate

### WebSocket

- Limit subscription frequency
- Use filters to reduce data transfer
- Implement message batching
- Monitor connection count

### Memory

- Monitor Node.js heap usage
- Implement data cleanup for subscriptions
- Use streams for large datasets

## Security Considerations

- **Authentication**: Always use secure credentials
- **API Keys**: Rotate regularly and store securely
- **Database**: Use least-privilege accounts
- **WebSocket**: Implement rate limiting
- **HTTPS**: Use TLS in production
- **Input Validation**: Validate all user input
- **SQL Injection**: Use parameterized queries (handled by ORM)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Commit changes following conventional commits
7. Push and create a pull request

### Commit Message Format

```
type(scope): subject

body

footer
```

Types: feat, fix, docs, style, refactor, test, chore

## License

MIT License - see LICENSE file for details

## Author

Rafal Okninski

## Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation in `docs/`
- Review test cases for usage examples

## Changelog

See git history for detailed changes.

