# OpenCode

Install globally:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a opencode
bunx skills@1.7.0 list -g -a opencode
```

Omit `-g` for a project install at `.agents/skills/rentner-rules/`. The pinned CLI uses the shared global `~/.agents/skills/rentner-rules/` for this target. OpenCode also discovers project skills in `.opencode/skills/` and `.claude/skills/`.

Ask OpenCode to load the `rentner-rules` skill for the task. Its skill tool loads the same `SKILL.md` and relevant language references. Confirm that the skill appears among the agent's available skills.

See the [shared integration notes](README.md) and [official OpenCode skills documentation](https://opencode.ai/docs/skills/).
