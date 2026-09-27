# Contributing to ApuLab Research

Thank you for contributing to ApuLab Research.

## Development checks

Before opening a pull request:

```bash
npm install
npm run build
```

## Research-contract changes

Any change that introduces or modifies a research field, table, event type, payload, questionnaire contract, or study-session rule must update the relevant documentation in the same pull request:

- `docs/DATA_GOVERNANCE.md`
- `docs/DATA_DICTIONARY.md`
- `docs/EVENT_CATALOG.md`
- `docs/DATA_TEST_PLAN.md`

Do not add ad-hoc telemetry directly inside gameplay scenes.

## Privacy and security

Never commit:

- participant names or direct identifiers;
- raw participant credentials;
- private participant-code mappings;
- production secrets or service-role keys;
- private research exports;
- screenshots, audio, or video of participants;
- sensitive school or family information.

Synthetic examples are allowed when clearly non-real.

## Pull requests

A pull request should explain what changed, why it changed, whether the research schema or event contract changed, what validation was performed, and whether any privacy or data-governance implication exists.

Keep unrelated refactors separate when possible.

## Licensing

Source-code contributions are distributed under MIT. Original documentation contributions are distributed under CC BY 4.0 unless a file states otherwise.
