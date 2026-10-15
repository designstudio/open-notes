# Token validator provenance

`validate-tokens.cjs` is copied from the explicitly requested `design-system` skill:
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/design-system

The skill declares MIT in its SKILL.md. The repository's license, including its copyright notice, is retained in `LICENSE` beside this file. The source header and scanner behavior are retained. Only the provenance comment above was added. This regex scanner reports potential violations; it does not understand CSS cascade, token layers, dynamic styles, contextual contrast or all color formats. `--fix` prints suggestions; it does not edit files.

The repository's `generate-design-tokens.mjs` preserves variable references and the application's `data-theme` / palette selectors. The skill's example generator resolves aliases into literals and emits `.dark`, so it was not used for the production token output.
