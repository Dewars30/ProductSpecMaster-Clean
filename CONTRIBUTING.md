# Contributing to ProductSpecMaster

Thank you for your interest in contributing to ProductSpecMaster! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. **Fork the Repository**: Create your own fork of the repository on GitHub.
2. **Clone Your Fork**: `git clone https://github.com/yourusername/product-spec-master.git`
3. **Set Up Development Environment**: Follow the setup instructions in [SETUP.md](./SETUP.md)

## Development Workflow

1. **Create a Branch**: Create a new branch for your feature or bugfix
   ```
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**: Implement your changes, following the coding guidelines below

3. **Test Your Changes**: Ensure your changes work as expected and don't break existing functionality

4. **Commit Your Changes**: Use clear commit messages
   ```
   git commit -m "Add feature: clear description of the change"
   ```

5. **Push to Your Fork**:
   ```
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**: Open a pull request from your fork to the main repository

## Coding Guidelines

- Follow the existing code style
- Use TypeScript for all new code
- Comment your code when necessary
- Update documentation for any new features
- Write clean, readable, and maintainable code
- Use environment variable validation through the `env` utility
- Use the `APIError` class for error handling

## Testing Guidelines

- Write unit tests for all new functionality
- Use Vitest for testing
- Place tests in the appropriate directory under `server/tests/`
- Mock external dependencies (like OpenAI API)
- Test both success and error cases
- For API endpoints, write integration tests

### Test Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Component or function name', () => {
  beforeEach(() => {
    // Setup code
  });

  afterEach(() => {
    // Cleanup code
    vi.resetAllMocks();
  });

  it('should do something specific', () => {
    // Test code
    expect(result).toBe(expectedValue);
  });

  it('should handle errors', () => {
    // Error test code
    expect(() => functionCall()).toThrow();
  });
});
```

## Code Organization

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Middleware**: Process requests before they reach controllers
- **Utils**: Reusable utility functions
- **Routes**: Define API endpoints
- **Tests**: Organized by component type

## Feature Development

When developing new features:

1. **Discuss First**: Open an issue to discuss your proposed feature before implementing
2. **Focus on Product Specifications**: All features should relate to product specification management
3. **Consider AI Integration**: Leverage OpenAI APIs for intelligent features
4. **Google Drive Integration**: Maintain compatibility with Google Drive for document storage

## Bug Reports

When reporting bugs:

1. **Check Existing Issues**: Make sure the bug hasn't already been reported
2. **Include Steps to Reproduce**: Clearly explain how to reproduce the bug
3. **Include Environment Details**: Specify your environment (OS, browser, etc.)
4. **Include Screenshots**: If applicable, add screenshots to help explain the problem

## Code Review Process

All pull requests will be reviewed by the maintainers. The review process includes:

1. **Functionality Check**: Ensuring the changes work as expected
2. **Code Quality**: Checking for code quality and adherence to guidelines
3. **Tests**: Verifying tests are included if applicable
4. **Documentation**: Ensuring documentation is updated

## Community

Join our community:

- **Ask Questions**: Feel free to ask questions in the issues section
- **Suggest Features**: We welcome feature suggestions
- **Help Others**: Help other contributors with their questions

Thank you for contributing to ProductSpecMaster!
