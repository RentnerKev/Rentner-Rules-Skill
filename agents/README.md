# Agent integrations

All integrations use the same [SKILL.md](../SKILL.md), project/language profiles, and relative references. The `.md` files in this directory describe installation and invocation; they are not automatically loaded agent configuration. [openai.yaml](openai.yaml) is Codex-specific interface metadata.

Install the complete skill directory, including all of `references/`; copying only the profile folders omits shared dependency/API and deployment rules. Each agent follows the single routing and precedence policy in `SKILL.md`.

## Supported integrations

These identifiers and project locations follow the pinned [Skills CLI 1.7.0 agent registry](https://github.com/vercel-labs/skills/blob/v1.7.0/src/agents.ts). Each location contains `rentner-rules/SKILL.md` and its supporting files. Targets whose project directory is `.agents/skills/` use the shared global `~/.agents/skills/` directly in this CLI version; do not infer their install destination from a different native-agent directory in the registry. Other targets use their agent directory, normally linked to the canonical shared copy unless `--copy` is selected.

| Agent | CLI identifier | Project skill directory | Integration notes |
| --- | --- | --- | --- |
| Codex | `codex` | `.agents/skills/` | [Codex](codex.md) |
| Cursor | `cursor` | `.agents/skills/` | [Cursor](cursor.md) |
| Claude Code | `claude-code` | `.claude/skills/` | [Claude Code](claude-code.md) |
| Gemini CLI | `gemini-cli` | `.agents/skills/` | [Gemini CLI](gemini-cli.md) |
| GitHub Copilot | `github-copilot` | `.agents/skills/` | [GitHub Copilot](github-copilot.md) |
| Windsurf / Cascade | `windsurf` | `.windsurf/skills/` | [Windsurf](windsurf.md) |
| OpenCode | `opencode` | `.agents/skills/` | [OpenCode](opencode.md) |
| Other compatible agents | Use their registered identifier or `'*'` for all | Resolved by the CLI | [Other agents and manual setup](universal.md) |

## Install for multiple agents

From a target project's root:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -a codex -a cursor -a claude-code
```

Install this skill for every agent supported by the pinned CLI:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -a '*'
```

Use project scope for the all-agent command because some CLI targets support only project installation. For the named integrations above, add `-g` for user-wide installation. Agent identifiers and wildcard selection are documented in the [pinned CLI README](https://github.com/vercel-labs/skills/blob/v1.7.0/README.md#supported-agents).

Use `npx` in place of `bunx` when Bun is unavailable. Use `--copy` when the chosen installation method cannot create symlinks. Listing an installation with `skills list` verifies CLI registration; check discovery inside the actual agent as well.

Installation paths and invocation interfaces can change with agent versions. Verify against the linked official documentation when troubleshooting. Compatibility documentation does not claim an installation or runtime test has occurred.
