# Cursor

Install globally:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a cursor
bunx skills@1.7.0 list -g -a cursor
```

Omit `-g` for a project install at `.agents/skills/rentner-rules/`. The default global destination is `~/.cursor/skills/rentner-rules/`. Cursor also discovers project skills in `.cursor/skills/`.

Select `/rentner-rules` from Agent chat's skill menu, or let Cursor select the skill when relevant. Confirm that the skill appears in Cursor's Skills interface. Cursor reads the portable `SKILL.md` directly, including its TypeScript/Rust routing.

See the [shared integration notes](README.md) and [official Cursor skills documentation](https://cursor.com/docs/context/skills).
