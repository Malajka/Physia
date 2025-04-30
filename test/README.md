# Testing in Physia

This project uses Vitest for unit testing and Playwright for end-to-end (E2E) testing.

## Unit Testing

Unit tests are located in the `test/unit` directory and follow the `.test.ts` or `.test.tsx` naming convention.

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Guidelines for Unit Testing

- Follow the 'Arrange', 'Act', 'Assert' approach
- Use `vi.fn()` for mocking functions
- Use `vi.spyOn()` to monitor existing functions
- Place mock factory functions at the top level of test files
- Use `data-testid` attributes for DOM element selection

## E2E Testing

E2E tests are located in the `e2e` directory, with page objects in `e2e/page-objects`.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Generate tests using Playwright Codegen
npm run test:e2e:generate
```

### Guidelines for E2E Testing

- Follow the Page Object Model pattern
- Use `data-testid` attributes for resilient selectors
- Use browser contexts for test isolation
- Using visual comparison with `expect(page).toHaveScreenshot()`
- Follow the 'Arrange', 'Act', 'Assert' approach

## Adding New Tests

When adding new tests:

1. For unit tests:
   - Create new `.test.ts` or `.test.tsx` files in the `test/unit` directory
   - Import components or functions to test
   - Structure tests using `describe` and `it` blocks

2. For E2E tests:
   - Create new test files in the `e2e` directory
   - Create page objects in `e2e/page-objects` when needed
   - Use data-testid attributes in components for stable selectors 