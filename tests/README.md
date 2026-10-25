# Testing Guide — Linux Console the Game

## Overview

This project includes comprehensive test suites for both PHP backend and JavaScript frontend:

### PHP Tests (PHPUnit)
- **CommandsApiTest** — Command list structure, translations, uniqueness
- **FsApiTest** — Filesystem state, save/reset operations, directory structure
- **ManApiTest** — Man pages, input validation, language switching

### JavaScript Tests (Jest)
- **escapeHtml.test.js** — XSS protection, HTML entity encoding
- **resolvePath.test.js** — Path resolution, filesystem traversal
- **history.test.js** — Command history, navigation, persistence
- **language.test.js** — i18n translations, language switching
- **commandExecution.test.js** — Command parsing, execution flow
- **filesystem.test.js** — Filesystem state management, backup/restore

## Prerequisites

### For PHP Tests
```bash
# Install PHP 7.4+
# Install Composer
# Then install PHPUnit:
composer install
```

### For JavaScript Tests
```bash
# Install Node.js 16+
# Then install dependencies:
npm install
```

## Running Tests

### Run All JavaScript Tests
```bash
npm test
```

### Run JavaScript Tests in Watch Mode
```bash
npm run test:watch
```

### Run JavaScript Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific JavaScript Test File
```bash
npm test -- tests/js/history.test.js
```

### Run All PHP Tests
```bash
./vendor/bin/phpunit
```

### Run Specific PHP Test
```bash
./vendor/bin/phpunit tests/php/CommandsApiTest.php
```

### Run PHP Tests with Coverage
```bash
./vendor/bin/phpunit --coverage-html coverage/
```

## Test Coverage

### PHP Test Coverage
| File | Tests | Description |
|------|-------|-------------|
| `api/commands.php` | 22 | Command list structure, translations, uniqueness |
| `api/fs.php` | 24 | Filesystem structure, JSON serialization, save/reset |
| `api/man.php` | 25 | Man pages, input validation, error handling |

### JavaScript Test Coverage
| File | Tests | Description |
|------|-------|-------------|
| `escapeHtml.test.js` | 11 | XSS protection, HTML entity encoding |
| `resolvePath.test.js` | 18 | Path resolution, filesystem traversal |
| `history.test.js` | 30 | Command history, navigation, localStorage |
| `language.test.js` | 28 | i18n translations, language switching |
| `commandExecution.test.js` | 30 | Command parsing, execution flow |
| `filesystem.test.js` | 35 | Filesystem state, backup/restore |

**Total: ~150 test cases**

## Test Structure

```
tests/
├── php/
│   ├── CommandsApiTest.php      # Command list API tests
│   ├── FsApiTest.php            # Filesystem API tests
│   └── ManApiTest.php           # Man page API tests
├── js/
│   ├── escapeHtml.test.js       # XSS protection tests
│   ├── resolvePath.test.js      # Path resolution tests
│   ├── history.test.js          # Command history tests
│   ├── language.test.js         # Language switching tests
│   ├── commandExecution.test.js # Command execution tests
│   └── filesystem.test.js       # Filesystem state tests
├── fixtures/
│   └── default_fs.json          # Test filesystem fixture
└── setup.js                     # Jest setup (mocks)
```

## Adding New Tests

### PHP Tests
```php
<?php

use PHPUnit\Framework\TestCase;

class NewFeatureTest extends TestCase
{
    public function testSomething()
    {
        $this->assertTrue(true);
    }
}
```

### JavaScript Tests
```javascript
describe('New Feature', () => {
  test('should do something', () => {
    expect(true).toBe(true);
  });
});
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.0'
      - run: composer install
      - run: ./vendor/bin/phpunit
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
```

## Troubleshooting

### PHP Tests Fail
- Ensure PHP 7.4+ is installed
- Run `composer install` to install PHPUnit
- Check `phpunit.xml` configuration

### JavaScript Tests Fail
- Ensure Node.js 16+ is installed
- Run `npm install` to install dependencies
- Check `jest.config.js` configuration

### Coverage Report
Both PHPUnit and Jest support coverage reports:
```bash
# PHP
./vendor/bin/phpunit --coverage-text

# JavaScript
npm test -- --coverage --coverageReporters=html
```
