An `AGENTS.md` file should not just be a list of rules. The best AI-agent projects treat it as a **project operating system** that gives an agent enough context to make correct decisions without repeatedly asking questions or making assumptions.

A well-written `AGENTS.md` should answer:

1. What is this project?
2. How is it structured?
3. What standards must be followed?
4. What should never be done?
5. How should changes be made?
6. How should code be verified?
7. What are common mistakes?
8. What are project-specific patterns?

The goal is to reduce:

- Hallucinated architecture
- Wrong folder placement
- Inconsistent coding style
- Breaking existing patterns
- Reinventing solutions
- Unsafe refactors
- Missing tests
- Incomplete implementations

---

# Ideal AGENTS.md Structure

```text
AGENTS.md

1. Project Overview
2. Tech Stack
3. Repository Structure
4. Architecture Rules
5. Coding Standards
6. Naming Conventions
7. Development Workflow
8. Testing Requirements
9. Documentation Requirements
10. Security Rules
11. Performance Rules
12. Common Pitfalls
13. Project Patterns
14. Definition of Done
15. Agent Checklist
```

---

# 1. Project Overview

Tell the AI exactly what the project is.

Bad:

```md
This is an ecommerce app.
```

Good:

```md
# Project Overview

This repository contains a multi-tenant SaaS ecommerce platform.

Main features:

- Product management
- Inventory tracking
- Order processing
- Customer accounts
- Analytics dashboard

Users:

- Customers
- Store Owners
- Administrators

Business goal:

Allow merchants to create and manage online stores.
```

This prevents agents from misunderstanding the domain.

---

# 2. Tech Stack

Specify exact versions.

```md
# Tech Stack

Frontend

- Next.js 15
- React 19
- TypeScript 5.8
- TailwindCSS 4

Backend

- Node.js 22
- Express 5
- PostgreSQL 17
- Prisma 6

Testing

- Vitest
- Playwright

Package Manager

- pnpm
```

Without this, agents often generate outdated code.

---

# 3. Repository Structure

One of the most important sections.

```md
# Repository Structure

src/

├── app/
├── components/
│ ├── ui/
│ ├── forms/
│ └── dashboard/
├── services/
├── repositories/
├── hooks/
├── lib/
├── types/
├── utils/
└── tests/

Rules:

- UI components go in components/
- Business logic goes in services/
- Database access goes in repositories/
- Shared utilities go in utils/
- Never place business logic inside components
```

This alone eliminates many AI mistakes.

---

# 4. Architecture Rules

Most important for larger projects.

Example:

```md
# Architecture

Flow:

Controller
↓
Service
↓
Repository
↓
Database

Rules:

- Controllers handle HTTP only
- Services contain business logic
- Repositories contain database logic
- Services never access database directly
- Controllers never access database directly
```

Agents frequently violate architecture unless explicitly instructed.

---

# 5. Coding Standards

```md
# Coding Standards

General

- Use TypeScript strict mode
- Avoid any
- Prefer const over let
- Prefer async/await
- No console.log in production code

Functions

- Maximum 50 lines
- Single responsibility

Files

- One primary export per file

Imports

- Use absolute imports
- Avoid deep relative paths
```

---

# 6. Naming Conventions

AI agents often create inconsistent naming.

```md
# Naming Conventions

Components

UserProfile.tsx

Hooks

useUserData.ts

Services

user.service.ts

Repositories

user.repository.ts

Types

user.types.ts

Constants

UPPER_SNAKE_CASE

Variables

camelCase

Classes

PascalCase
```

---

# 7. Development Workflow

Tell agents how to work.

```md
# Workflow

Before coding:

1. Read related files
2. Understand existing patterns
3. Reuse existing utilities

During coding:

1. Modify minimum necessary files
2. Follow existing architecture
3. Maintain backward compatibility

After coding:

1. Run tests
2. Run lint
3. Verify types
4. Update documentation
```

---

# 8. Testing Requirements

This section dramatically improves AI-generated code quality.

```md
# Testing

Every feature must include:

- Unit tests
- Integration tests if API changes
- Edge cases
- Error cases

Minimum coverage:

- 90%

Required test commands:

pnpm test
pnpm test:coverage
```

---

# 9. Documentation Requirements

```md
# Documentation

Update documentation when:

- APIs change
- Database schema changes
- Environment variables change

Required files:

- README.md
- CHANGELOG.md
- API docs
```

---

# 10. Security Rules

Critical.

```md
# Security

Never:

- Log passwords
- Log access tokens
- Expose secrets
- Commit .env files

Always:

- Validate input
- Sanitize user content
- Use parameterized queries
- Check permissions
```

---

# 11. Performance Rules

```md
# Performance

Frontend

- Avoid unnecessary re-renders
- Use memoization when needed
- Lazy load large components

Backend

- Avoid N+1 queries
- Batch database calls
- Use pagination
- Cache expensive operations
```

---

# 12. Common Pitfalls

A highly underrated section.

```md
# Common Pitfalls

Do NOT:

- Create duplicate utilities
- Introduce new state libraries
- Add dependencies without justification
- Replace existing patterns

Known issues:

- User IDs are UUIDs, not integers
- Dates are stored in UTC
- Currency values use cents
```

This prevents repeated mistakes.

---

# 13. Project Patterns

Teach the AI how the codebase already works.

```md
# Existing Patterns

Creating a service:

1. Create repository method
2. Create service method
3. Create controller endpoint
4. Add tests

Authentication:

Middleware
→ JWT Verification
→ User Context
→ Service

Error Handling:

Throw AppError
Global Error Handler
HTTP Response
```

Examples are extremely powerful.

```ts
// GOOD

const user = await userRepository.findById(id);

if (!user) {
	throw new NotFoundError();
}
```

```ts
// BAD

const user = await prisma.user.findUnique(...);
```

---

# 14. Definition of Done

This section prevents incomplete work.

```md
# Definition of Done

A task is complete only if:

- Feature implemented
- Tests added
- Types pass
- Lint passes
- Documentation updated
- No TODO comments
- No console logs
- No dead code
```

---

# 15. Agent Checklist

The AI should verify this before finishing.

```md
# Agent Checklist

Before submitting changes:

[ ] Followed architecture
[ ] Followed naming conventions
[ ] Reused existing utilities
[ ] Added tests
[ ] Updated documentation
[ ] No type errors
[ ] No lint errors
[ ] No security issues
[ ] No duplicate code
```

---

# Advanced Sections for Serious AI-Agent Projects

## Decision-Making Rules

```md
# Decision Rules

Priority order:

1. Correctness
2. Security
3. Maintainability
4. Performance
5. Developer convenience

When uncertain:

- Follow existing code patterns
- Avoid introducing new abstractions
- Choose simpler solutions
```

---

## Refactoring Rules

```md
# Refactoring

Allowed:

- Extract reusable functions
- Improve type safety
- Reduce duplication

Not allowed:

- Rewrite unrelated code
- Change public APIs
- Rename files without reason
```

---

## Dependency Rules

```md
# Dependencies

Before adding a dependency:

1. Check existing alternatives
2. Justify necessity
3. Prefer built-in APIs

Avoid:

- Large UI libraries
- Unmaintained packages
- Experimental packages
```

---

## AI-Specific Instructions

This is often the most valuable section.

```md
# Instructions for AI Agents

Always:

- Read neighboring files first
- Follow existing patterns
- Make smallest possible change
- Preserve backward compatibility
- Update tests

Never:

- Assume architecture
- Create new patterns without reason
- Ignore failing tests
- Leave placeholders
- Generate pseudo-code

If requirements are unclear:

- Ask for clarification
- Do not guess
```

---

# Enterprise-Level AGENTS.md Formula

For the highest-quality results, include:

```text
Project Context
+ Architecture Rules
+ Folder Structure
+ Coding Standards
+ Examples
+ Security Rules
+ Testing Rules
+ Definition of Done
+ Agent Checklist
+ Common Pitfalls
```

This combination gives AI agents enough context to behave much more like a senior engineer familiar with the codebase, significantly reducing mistakes, unnecessary rewrites, and inconsistent implementations.
