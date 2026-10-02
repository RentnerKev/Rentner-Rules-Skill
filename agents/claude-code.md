# Claude Code

Install globally:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a claude-code
bunx skills@1.7.0 list -g -a claude-code
```

Omit `-g` for a project install at `.claude/skills/rentner-rules/`. The default global destination is `~/.claude/skills/rentner-rules/`; the CLI respects `CLAUDE_CONFIG_DIR` when configured.

Invoke `/rentner-rules` in Claude Code, or allow selection by the skill description. Keep the full skill folder so supporting references remain available. Project-specific `CLAUDE.md` instructions can reference the installed skill without duplicating its language rules.

See the [shared integration notes](README.md) and [official Claude Code skills documentation](https://code.claude.com/docs/en/skills).
