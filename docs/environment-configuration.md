# Environment Configuration

This document explains how to configure the Trua Collect application using environment variables.

## Overview

The Trua Collect application uses environment variables to configure various aspects of its behavior. This approach allows for different configurations in different environments (development, staging, production) without changing the code.

## Browser vs. Node.js Environments

The application runs in two different environments:

1. **Browser Environment**: The client-side code that runs in the user's browser.
2. **Node.js Environment**: The server-side code and tests that run in Node.js.

Each environment has different ways of accessing environment variables:

- **Browser Environment**: Uses Vite's `import.meta.env` mechanism, which requires variables to be prefixed with `VITE_`.
- **Node.js Environment**: Uses Node.js's `process.env` object.

## Setup

1. Copy the `.env.example` file to `.env.local` in the project root:
   ```bash
   cp .env.example .env.local
   ```

2. Edit the `.env.local` file to set the desired configuration values.

3. The application will automatically load these values at startup.

## Configuration Files

The application uses several environment configuration files:

- `.env`: Base environment variables for all environments.
- `.env.local`: Local overrides (not committed to version control).
- `.env.development`: Development-specific variables.
- `.env.production`: Production-specific variables.
- `.env.test`: Test-specific variables.

## Configuration Variables

### DEFAULT_COLLECTION_KEY / VITE_DEFAULT_COLLECTION_KEY

**Purpose**: Defines the default collection key to use when no key is provided in the URL.

**Format**: `[language][12 bits for configuration]`

**Example**: `en000111100100` - English, all steps enabled

**Usage**:
- When a user accesses the application without a collection key in the URL, this default key is used.
- The default key determines which steps are enabled and the initial step.
- Typically, the default key enables all steps and starts at the personal-info step.

### PORT / VITE_PORT

**Purpose**: Defines the port on which the application server will listen.

**Default**: `3000`

### DEV_MODE / VITE_DEV_MODE

**Purpose**: Enables or disables development mode features.

**Values**: `true` or `false`

**Default**: `true`

**Effects**:
- When `true`, additional logging and debugging features are enabled.
- Error messages include more details.
- Hot reloading is enabled.

### LOG_LEVEL / VITE_LOG_LEVEL

**Purpose**: Sets the verbosity of application logging.

**Values**: `debug`, `info`, `warn`, `error`

**Default**: `info`

### API_BASE_URL / VITE_API_BASE_URL

**Purpose**: Defines the base URL for API requests.

**Default**: `http://localhost:3001/api`

### DOCUMENT_STORAGE_PATH / VITE_DOCUMENT_STORAGE_PATH

**Purpose**: Defines the path where generated documents will be stored.

**Default**: `./storage/documents`

## Using Environment Variables in the Code

### In Browser Environment

In the browser environment, environment variables are accessed using Vite's `import.meta.env` object:

```typescript
// Example: Accessing the default collection key in browser code
const defaultCollectionKey = import.meta.env.VITE_DEFAULT_COLLECTION_KEY || 'en000111100100';

// Example: Checking if in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
```

### In Node.js Environment

In the Node.js environment, environment variables are accessed using the `process.env` object:

```typescript
// Example: Accessing the default collection key in Node.js code
const defaultCollectionKey = process.env.DEFAULT_COLLECTION_KEY || 'en000111100100';

// Example: Checking if in development mode
const isDevelopmentMode = process.env.DEV_MODE === 'true';
```

### Using the EnvironmentConfig Utility

The application provides an `EnvironmentConfig` utility that abstracts away the differences between browser and Node.js environments:

```typescript
import { getConfig } from './utils/EnvironmentConfig';

// Get the environment configuration
const config = getConfig();

// Access configuration values
const defaultCollectionKey = config.defaultCollectionKey;
const isDevelopmentMode = config.devMode;
```

## Environment-Specific Configuration

Different environments can have different configurations:

1. **Development**: Use `.env.development` and `.env.local` files with development-specific values.
2. **Testing**: Use `.env.test` file or set environment variables in CI/CD pipeline.
3. **Staging**: Use `.env.staging` file or set environment variables on the staging server.
4. **Production**: Use `.env.production` file or set environment variables on the production server.

## Collection Key Configuration

The default collection key is particularly important as it determines the form's behavior when no key is provided in the URL:

```
DEFAULT_COLLECTION_KEY=en000111100100
VITE_DEFAULT_COLLECTION_KEY=en000111100100
```

Breaking down this example:
- `en`: English language
- `000111100100`: Configuration bits
  - Bits 1-3 (000): No consents required
  - Bit 4 (1): Education step enabled
  - Bit 5 (1): Professional licenses step enabled
  - Bit 6 (1): Residence history step enabled
  - Bits 7-9 (100): 5 years of residence history required
  - Bit 10 (1): Employment history step enabled
  - Bits 11-13 (00): 1 year of employment history required

You can customize this key to enable or disable specific steps and set requirements for your specific use case.

## Security Considerations

The `.env.local` file should never be committed to version control, as it may contain sensitive information. The `.env.example` file, which contains no sensitive values, should be committed instead.

Add `.env.local` to your `.gitignore` file to prevent accidental commits:

```
# .gitignore
.env.local
```

## Vite-Specific Considerations

Vite has specific rules for environment variables:

1. Only variables prefixed with `VITE_` are exposed to the client-side code.
2. Environment variables are replaced at build time, not runtime.
3. Changes to environment variables require a server restart.

For more information, see the [Vite documentation on environment variables](https://vitejs.dev/guide/env-and-mode.html).