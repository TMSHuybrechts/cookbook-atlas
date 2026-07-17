# Cookbook Atlas

An unofficial visual explorer for the
[OpenAI Cookbook](https://github.com/openai/openai-cookbook).

Cookbook Atlas turns the official `registry.yaml` index into a searchable,
filterable interface. It helps developers find useful examples by goal,
category, language and estimated difficulty without manually exploring a large
notebook repository.

> Cookbook Atlas is an independent project. It is not affiliated with,
> sponsored by, or endorsed by OpenAI.

## Features

- All 304 registry items indexed, including 146 archived examples
- Search across titles, descriptions, authors and tags
- Topic, format, difficulty and archive filters
- Guided starting routes for APIs, agents and evaluations
- Direct links to the authoritative files in `openai/openai-cookbook`
- Responsive dark technical-atlas interface

The exact totals reflect the registry snapshot committed to this repository and
can change when the upstream project changes.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

## Refresh the Cookbook index

```bash
npm run sync:cookbook
```

This downloads the upstream `registry.yaml`, normalizes its metadata and writes
`app/cookbook-data.json`. The generated JSON is committed so production builds
do not depend on GitHub being available at build time.

The included GitHub Actions workflow checks for upstream changes daily and
commits an updated index when necessary.

## Validate

```bash
npm run lint
npm test
```

## Attribution and licensing

Dashboard source code is released under the [MIT License](LICENSE).

Cookbook metadata is derived from
[`openai/openai-cookbook`](https://github.com/openai/openai-cookbook), which is
also distributed under the MIT License. See
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for the required copyright
and permission notice.

OpenAI, ChatGPT and related marks belong to OpenAI. This project does not use
the OpenAI logo and does not claim an official relationship.
