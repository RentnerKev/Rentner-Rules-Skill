# Codex

Install globally:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a codex
bunx skills@1.7.0 list -g -a codex
```

Omit `-g` for a project install at `.agents/skills/rentner-rules/`. The pinned CLI uses the shared global `~/.agents/skills/rentner-rules/` for this target. Verify the path reported by the installation/list command rather than assuming a different native-agent skill directory.

Invoke explicitly with `$rentner-rules`, or allow relevance-based selection. [openai.yaml](openai.yaml) supplies the interface label and example prompt. [SKILL.md](../SKILL.md) routes TypeScript, Rust, Go, TypeScript/Rust hybrid, and Tauri work to the applicable profiles and shared rules.

See the [shared integration notes](README.md) and the [pinned CLI registry](https://github.com/vercel-labs/skills/blob/v1.7.0/src/agents.ts).
