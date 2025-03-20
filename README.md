# 🔐 Trua Verify: Employment History Verification System

> *Truth, Trust & Ownership in Employment Verification*

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-green)](https://www.typescriptlang.org/)
[![Internationalization](https://img.shields.io/badge/i18n-Supported-orange)](https://react.i18next.com/)

## 📋 Overview

Trua Verify is a web-based system designed to facilitate employment history verification. It allows candidates to submit a detailed employment history claim, which can then be verified by employers, recruiters, or background check services.

### ✨ Key Features

- 🌐 **Multi-language Support** - Available in English, Spanish, French, and Italian
- 📝 **Employment Timeline Creation** - Add multiple types of timeline entries
- 📊 **Timeline Visualization** - Interactive visual representation of employment coverage
- 🎓 **Education Verification** - Optional degree verification functionality
- ✍️ **Digital Signature** - Legally binding electronic signature
- 📄 **Document Generation** - PDF and JSON formats for verification
- 🔒 **Secure Storage** - Claims stored with unique tracking IDs

## 🏗️ System Architecture

The Trua Verify system is built with React for the UI components and TypeScript for type-safe business logic. The application generates and stores verification documents in both PDF and JSON formats.

### 📂 Project Structure

The project follows a standard React TypeScript structure:

- **src/components/** - React UI components
- **src/context/** - React context providers for state management
- **src/services/** - Service modules for document generation
- **src/utils/** - Utility functions and helpers
- **src/types/** - TypeScript type definitions
- **docs/** - Project documentation

## 👥 Key Actors

1. **👤 Candidate**: The individual invited to submit their employment history. They provide personal information, a timeline of jobs and gaps, and certify the information with a digital signature.

2. **🔍 Verifier**: The relying party (employer, recruiter, or background checker) who initiates the process via an invitation and uses the claim to verify the candidate's employment history.

## 🔄 Core Workflow

The verification process follows these key steps:

1. **Invitation Access** - Candidate receives a unique verification link
2. **Personal Information** - Candidate provides basic personal details
3. **Employment Timeline** - Candidate creates a comprehensive employment history
4. **Degree Verification** - Optional education credentials verification
5. **Attestation** - Candidate reviews and confirms information accuracy
6. **Digital Signature** - Candidate signs the verification claim
7. **Confirmation** - System confirms successful submission
8. **Download PDF** - Candidate and/or verifier can download the verification document

## 🌐 Internationalization

Trua Verify supports multiple languages:

- 🇺🇸 English (default)
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇮🇹 Italian (Italiano)

Users can switch languages using the language dropdown in the top-right corner of any page.

## 🎓 Education Verification

When required, the system collects detailed information about the candidate's educational background:

- 🏫 School Name
- 🎓 Degree Level (Associate, Bachelor's, Master's, Doctorate, etc.)
- 📜 Degree Title
- 📚 Major/Field of Study
- 📅 Award Year

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher) or [yarn](https://yarnpkg.com/) (v1.22 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
```

This will start a local development server at `http://localhost:3000` and open it in your default browser.

### Available Scripts

The project includes several npm scripts for development and testing:

- `npm run dev` - Start the development server
- `npm run build` - Create a production build
- `npm run preview` - Preview the production build locally
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types

### Production Build

To create a production build:

```bash
npm run build
# or
yarn build
```

This will create optimized files in the `dist` directory that can be deployed to a web server.

To preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## 📚 Documentation

For more detailed information, see the documentation in the `docs/` directory:

- [System Overview](docs/system-overview.md)
- [Implementation Status](docs/implementation-status.md)
- [Timeline Implementation](docs/timeline-implementation.md)
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)
- [Recommendations](docs/recommendations.md)

## 🔒 Security Features

- TypeScript type safety for preventing type-related errors
- Client-side validation for immediate user feedback
- Server-side validation for data integrity
- Secure document generation and storage

## 📄 License

© 2025 Trua Verify. All rights reserved.