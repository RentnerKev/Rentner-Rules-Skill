# Windsurf / Cascade

Install globally:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a windsurf
bunx skills@1.7.0 list -g -a windsurf
```

Omit `-g` for a project install at `.windsurf/skills/rentner-rules/`. The pinned CLI's default global destination is `~/.codeium/windsurf/skills/rentner-rules/`.

Activate `@rentner-rules` in Cascade, or allow selection when relevant. Confirm discovery in the Skills interface. Current Cascade documentation also supports `.devin/skills/` and retains `.windsurf/skills/` as a compatibility location; the commands above follow the pinned CLI's `windsurf` integration.

See the [shared integration notes](README.md) and [official Cascade skills documentation](https://docs.devin.ai/desktop/cascade/skills).
