# Codex

Install globally:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a codex
bunx skills@1.7.0 list -g -a codex
```

Omit `-g` for a project install at `.agents/skills/rentner-rules/`. The pinned CLI uses the shared global `~/.agents/skills/rentner-rules/` for this target. Verify the path reported by the installation/list command rather than assuming a different native-agent skill directory.

Invoke explicitly with `$rentner-rules`, or allow relevance-based selection. [openai.yaml](openai.yaml) supplies the interface label and example prompt; the instructions remain in [SKILL.md](../SKILL.md). Its default prompt selects the established TypeScript, Rust-only, general hybrid, or Tauri profile and applies the shared JS/TS tooling policy.

See the [shared integration notes](README.md) and the [pinned CLI registry](https://github.com/vercel-labs/skills/blob/v1.7.0/src/agents.ts).
