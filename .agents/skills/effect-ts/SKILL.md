---
name: effect-ts
description: >-
  Comprehensive guide for Effect-TS, the functional TypeScript library.
  Use when writing Effect programs, defining services, creating layers,
  handling errors, modeling data with Schema, configuring apps, or testing
  Effect code. Covers correct APIs, common misconceptions, and idiomatic patterns.
user-invocable: false
paths: "**/*.ts, **/*.tsx"
---

# Effect-TS Core Patterns

Prescriptive guide for writing idiomatic Effect programs.
Source: [effect.solutions](https://www.effect.solutions/)

## Core pattern documents

Load the relevant document based on what you're working on:

- **[01-project-setup.md](core-patterns/01-project-setup.md)** — Effect Language Service install, editor diagnostics, reference repositories for AI assistance. Load when bootstrapping a new Effect project or setting up tooling.

- **[02-tsconfig.md](core-patterns/02-tsconfig.md)** — Recommended TypeScript compiler settings for Effect (target, module, strict flags, incremental builds). Load when configuring `tsconfig.json` for an Effect project.

- **[03-basics.md](core-patterns/03-basics.md)** — Effect.gen, Effect.fn, pipe for instrumentation, retry/timeout with Schedule. Load when writing any Effect code or starting a new effectful function.

- **[04-services-and-layers.md](core-patterns/04-services-and-layers.md)** — Context.Tag services, Layer.effect/Layer.sync implementations, service-driven development, layer composition with provideMerge, layer memoization. Load when creating services, defining dependency injection, or composing layers.

- **[05-data-modeling.md](core-patterns/05-data-modeling.md)** — Schema.Class records, Schema.TaggedClass variants, branded types, Schema.Union, Match.valueTags, JSON encoding/decoding. Load when defining domain models, DTOs, or data validation schemas.

- **[06-error-handling.md](core-patterns/06-error-handling.md)** — Schema.TaggedError, catchAll/catchTag/catchTags, expected errors vs defects, Schema.Defect for wrapping unknown errors. Load when defining or handling errors in Effect programs.

- **[07-config.md](core-patterns/07-config.md)** — Config module, Config layers, ConfigProvider, Schema.Config validation, Redacted secrets. Load when setting up app configuration, environment variables, or config providers.

- **[08-testing.md](core-patterns/08-testing.md)** — @effect/vitest setup, it.effect/it.scoped/it.live, TestClock, providing test layers, worked example with test services. Load when writing or setting up tests for Effect code.

- **[10-incremental-adoption.md](core-patterns/10-incremental-adoption.md)** — Promise interop (Effect.tryPromise, runPromise), where to introduce Effect first, wrapping external libraries, framework integration (Express/Fastify/Next.js). Load when introducing Effect into an existing non-Effect codebase.

- **[11-http-clients.md](core-patterns/11-http-clients.md)** — FetchHttpClient, HttpClient.get, HttpClientResponse.schemaBodyJson, typed REST clients with Schema validation. Load when making HTTP requests or building API clients in Effect.

- **[12-observability.md](core-patterns/12-observability.md)** — @effect/opentelemetry, Otlp.layer, spans/logs/metrics export to OTLP collectors. Load when wiring tracing, logging, or metrics for an Effect app.

---

## Local Effect Source

The Effect v4 repository is cloned to `~/.local/share/effect-solutions/effect` for reference.
Use this to explore APIs, find usage examples, and understand implementation
details when the documentation isn't enough.

If the repository is not present at that path, refer to
[01-project-setup.md](core-patterns/01-project-setup.md) for clone instructions.
