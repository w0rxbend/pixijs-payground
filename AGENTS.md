# Conventional Commits

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## Format

```
<type>(<scope>): <subject>

<body>
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **chore**: Build process, dependencies, tooling
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests

## Examples

```
feat(canvas): add sprite rendering support

Implemented WebGL sprite rendering with batch optimization.
```

```
chore(deps): update pixi.js to v8.0.0
```

```
fix(physics): resolve collision detection bug

Fixes #123
```

## Scope (Optional)

Specify the module or component affected (e.g., `canvas`, `loader`, `physics`).

## Body (Optional)

Provide detailed explanation of changes and motivation.