# 🧙♂️ MagicMock for Jest: Automated Function Mocking

# ⚠️ Deprecation Notice

The **MagicMock** project is no longer maintained.

You can achieve the same functionality (recording and replaying mocks) with [PollyJS](https://netflix.github.io/pollyjs/), which provides a more complete and actively maintained solution.

We recommend migrating to **PollyJS** for all new and existing projects.

Thank you for using MagicMock! 🙏

---

MagicMock is like a *smart recording device* for your software tests. Here's what it does in plain terms:

1. **First Test Run**
    - 🎥 **Records** what your functions *actually do* (like real API calls)
    - 💾 **Saves** these recordings as "snapshots"

2. **Future Test Runs**
    - 📼 **Plays back** the recordings instead of making real calls
    - 🚀 Makes tests **10x faster** (no waiting for real APIs)
    - ✅ Ensures **identical results** every time

**Example**: If your app fetches weather data, MagicMock:
- Records the real weather API response during first test
- Uses that recorded response for all future tests
- No internet needed! No API costs!

---

# 🚨 Important Beta Notice
**MagicMock is currently in BETA**  
⚠️ API may change in future versions  
⚠️ Some edge cases not yet handled  
⚠️ Use with caution in critical projects

## Table of Contents
1. [Key Features](#-key-features)
2. [Quick Start](#-quick-start)
3. [Core Concepts](#-core-concepts)
4. [Integration Guide](#-integration-guide)
5. [Advanced Usage](#-advanced-usage)
6. [Best Practices](#-best-practices)
7. [Configuration](#-configuration)
8. [FAQ](#-faq)

---

## ✨ Key Features

- **Automatic Snapshots**: Generates mock data on first test run
- **Jest-Optimized**: Designed specifically for Jest testing workflows
- **Argument-Sensitive Mocks**: Precise argument matching for accurate test behavior
- **Zero Production Overhead**: Automatically excluded from production bundles
- **Secret Masking**: Protect sensitive data in test snapshots

---

## 🚀 Quick Start

### Installation
```bash
npm install magic-mock --save-dev
```

### Basic Usage
```typescript
// test.spec.ts
import { mockFunction } from 'magic-mock';
import { fetchData } from './api';

// Create mock
const mockedFetch = mockFunction(this, 'fetchData', fetchData);

test('returns valid data', async () => {
  const result = await mockedFetch('https://api.example.com');
  expect(result).toMatchSnapshot();
});
```

### First Run Behavior
1. Executes real implementation
2. Creates snapshot in `__magicMock__` directory
3. Logs: `📷 Created new snapshot for 'fetchData'`

### Subsequent Runs
1. Uses recorded snapshot
2. Skips real implementation
3. Logs: `✨ Using snapshot for 'fetchData'`

---

## 🧠 Core Concepts

### Snapshot Lifecycle
1. **Initial Test Run**
    - Executes actual function
    - Records arguments and response
    - Creates `.snap` file in `__magicMock__`

2. **Future Test Runs**
    - Compares current arguments with snapshots
    - Returns recorded response on match
    - Creates new snapshot for new argument patterns

### Argument Matching
- **Exact Match Required**: Order, type, and value must match
- **New Patterns** create additional snapshots
- **Secret Handling**: Use `secret()` to mask sensitive values
  ```typescript
  import { secret } from 'magic-mock';
  
  const secureFetch = mockFunction(
    this,
    'authRequest',
    (token: string) => secret(token, 'API_TOKEN')
  );
  ```

---

## 🔌 Integration Guide

### For Library Authors
Embed MagicMock in your library for seamless user experience:

```typescript
// your-library.ts
import { mockFunction } from 'magic-mock';

export class DataService {
  constructor(private fetcher: typeof fetch) {}

  async getData(url: string) {
    const safeFetch = mockFunction(this, 'safeFetch', this.fetcher);
    return safeFetch(url);
  }
}
```

**User Benefits:**
- Automatic mocking without setup
- Consistent test behavior across projects
- Transparent snapshot management

### For Application Developers
Mock third-party APIs not using MagicMock:

```typescript
// tests/api.spec.ts
import { externalSDK } from 'third-party';
import { mockFunction } from 'magic-mock';

const mockedSDK = mockFunction(
  this,
  'thirdPartySDK',
  externalSDK.initialize
);

test('handles SDK initialization', async () => {
  const instance = await mockedSDK({ apiKey: 'test123' });
  expect(instance.status).toBe('active');
});
```

---

## 🛠️ Advanced Usage

### Mocking Class Methods
```typescript
import { mockClass } from 'magic-mock';

class PaymentProcessor {
  async charge(amount: number) { /* ... */ }
}

const processor = mockClass(new PaymentProcessor(), 'PaymentGateway');
```

### Custom Snapshot Handling
```typescript
import { callMocked } from 'magic-mock';

test('complex test scenario', async () => {
  const result = await callMocked(
    complexWorkflow,
    'custom-scenario-123'
  );
  // Custom assertions
});
```

---

## 📚 Best Practices

1. **Commit Snapshots**
   ```bash
   __magicMock__/
     ├── serviceA/
     └── serviceB/
   ```
    - Enables team consistency
    - Track snapshot changes via PR reviews

2. **Snapshot Maintenance**
    - Delete obsolete snapshots after API changes
    - Regenerate when modifying test arguments

3. **Selective Mocking**
   ```typescript
   // Disable for specific tests
   beforeAll(() => {
     process.env.DISABLE_MM = 'true';
   });
   ```

---

## ⚙️ Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `DISABLE_MM` | `false` | Disable all mocking behavior |

### Directory Structure
```
project-root/
├── __magicMock__/
│   ├── serviceA/
│   │   └── testDoSomething
│   │       ├── 0
│   │       └── 1
│   └── serviceB/
│       └── testDoAnotherThing
│           ├── 0
│           ├── 1
│           └── 2
├── src/
└── tests/
```

---

## ❓ FAQ

**Q: How does MagicMock differ from Jest's built-in mocking?**<br>
A: Provides automatic snapshot-based mocking without manual mocking implementation.

**Q: Can I use it with other test runners?**<br>
A: Currently optimized for Jest. Community plugins may enable other runners.

**Q: How to handle changing API responses?**<br>
A: Delete relevant files and re-run tests to regenerate.

---

[![MagicMock Supported](https://raw.githubusercontent.com/drakensoftware/magicmock/main/badge.png)](https://github.com/drakensoftware/magicmock)

```markdown
[![MagicMock Supported](https://raw.githubusercontent.com/drakensoftware/magicmock/main/badge.png)](https://github.com/drakensoftware/magicmock)
```

---

**Upgrade Your Jest Testing** - MagicMock eliminates manual mock maintenance while ensuring test consistency. Start focusing on what matters - your test logic! 🚀
