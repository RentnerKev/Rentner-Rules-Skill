# Frontend

Scope: [TypeScript profile](index.md). React hooks and their grouped returns apply to the TypeScript frontend.

## Presentation components

TSX component files contain imports, props and hook wiring, and JSX. Put state, effects, queries, mutations, business calculations, and action workflows in logic hooks.

Presentation work remains readable in JSX: small display conditions, rendering a list with `.map`, translated labels, and connecting an event to a handler. Move substantial transformations, sorting, validation, permission decisions, and multi-step callbacks to the hook.

A subcomponent can receive the groups it needs through props. It does not need a new hook just to wrap props. Keep prop and hook-result contracts in the relevant `Types/` directory.

```tsx
import { useNotificationsLogic } from '../Hooks/useNotificationsLogic.ts'

export function Notifications() {
    const { state, handler } = useNotificationsLogic()

    return (
        <button
            type="button"
            disabled={state.isPending}
            onClick={handler.handleRefresh}
        >
            {state.refreshLabel}
        </button>
    )
}
```

Do not hide a workflow inside a large JSX callback or an immediately invoked function. Component simplicity comes from placing behavior with its owner, not from moving unreadable code into markup.

## Logic hook composition

A screen or complex component has one public `use...Logic` orchestration hook. The component calls that entrypoint directly. Do not call another screen/component's complete logic hook from it, or add a second `PresentationLogic` layer that mainly forwards the first hook's `state`, `handler`, or other groups. Merge such a wrapper into the owning entrypoint.

Focused custom hooks are allowed inside an orchestration hook: stores, queries, form/table integration, debounce, subscriptions, and a coherent reusable UI lifecycle. Give them explicit inputs for the values and actions they need rather than passing a complete foreign logic result. Name them after their responsibility, such as `useSessionActivity` or `useRestoreStatus`; reserve `use...Logic` for the screen or component's orchestration.

Keep feature-specific focused hooks with their owner. Move React/UI hooks to `src/shared/<Area>/Hooks` when they have real reuse. UI-free computations, helpers, and schemas belong in `src/lib/<Domain>`, including when multiple features use them. A function that calls React hooks remains a custom hook and must follow React's Rules of Hooks; do not disguise it as a lib helper.

Build the public return contract explicitly from the state, actions, refs, and library instances the template needs. Do not spread whole foreign `state`/`handler` objects into it. Selecting named values from a focused hook is fine; ordinary immutable updates to a domain object are also fine.

This convention does not ban React/library hooks or useful custom-hook composition. Preserve a single source of truth and existing subscription/effect lifecycles during refactors; merging orchestrators must not duplicate local state, fetches, or side effects. Do not flatten every focused hook into one oversized function.

## Logic hook return contract

Use `use<MeaningfulName>Logic` for a screen or complex component's orchestration. Define its public result contract in the owner's `Types/` directory.

| Group | Contents |
| --- | --- |
| `state` | Data, form values, derived display values, loading/error flags, and translated values consumed by the template |
| `handler` | Actions and complete workflows, usually named `handle...` |
| `setter` | Direct state setters, named `set...`, when callers genuinely need them |
| `refs` | Needed React ref objects |
| Named library instance | A meaningful object with its own API, such as `table` or `form` |

Include groups only when used. A read-only hook may return only `state`; do not invent an empty `handler` or `setter` to satisfy a template.

```ts
import type { RefObject } from 'react'

export type UsersTableLogicResult = {
    state: {
        search: string
        isPending: boolean
    }
    handler: {
        handleDeleteSelected: () => Promise<void>
    }
    setter: {
        setSearch: (value: string) => void
    }
    refs: {
        searchInput: RefObject<HTMLInputElement | null>
    }
}
```

The hook returns the grouped contract:

```ts
return {
    state: {
        search,
        isPending,
    },
    handler: {
        handleDeleteSelected,
    },
    setter: {
        setSearch,
    },
    refs: {
        searchInput,
    },
}
```

Components consume `state.search`, `handler.handleDeleteSelected`, and `setter.setSearch`. Preserve this grouping rather than flattening the returned object.

Use `refs` for the group and the normal React `ref` attribute for the actual element:

```tsx
<input
    ref={refs.searchInput}
    value={state.search}
    onChange={(event) => setter.setSearch(event.target.value)}
/>
```

Return a TanStack `table` or `form` at the top level when the component needs its native API. Use accurate library types or type derivations in `Types/`. Keep query clients, raw mutations, internal helpers, and implementation details inside the hook unless the consumer has a concrete need.

Prefer small, purposeful hooks. Extract coherent behavior when a hook starts coordinating unrelated responsibilities.

## Queries, forms, and tables

- Load server state with TanStack Query. Do not mirror fetched state into local state without a specific editing or lifecycle requirement.
- Keep query keys stable and parameter-complete. After mutations, update or invalidate the affected queries.
- Use TanStack Form for new forms in the preferred stack. Preserve an established form approach within an existing feature instead of unnecessarily mixing implementations.
- Keep form state, validation wiring, submit workflows, and errors in hooks; keep the form component focused on rendering.
- Use TanStack Table with the existing shared table UI. Define columns and behavior with the owning table component or hook, following the same presentation boundary.
- Use the capabilities of the installed versions. Consult their current official documentation when an API is unfamiliar or may have changed.

## Styling and installed UI

Use installed `@rentnerkev/*` packages as the primary components for the areas they support. Read the installed API, types, or current official docs before integration. Reuse providers, tokens, and neighboring usage patterns instead of building a competing input, select, toast, picker, or other base component.

Use Tailwind classes and the existing design tokens for layout, spacing, colors, typography, states, and responsive behavior.

Use inline styles or plain CSS only for a concrete requirement that classes cannot adequately express, such as runtime dimensions, a necessary CSS custom property, or a library's style/config API. Keep the exception small and explain it when the reason is not obvious. Do not choose plain CSS merely because it is familiar.

## Visible text and accessibility

Use the project's translation mechanism for UI text and add German and English translations together. In TanStack Dummy, this is `useTranslationStore().t()` and the locale files under `src/language/Locales`. Follow the corresponding established mechanism in other projects.

Simple translation lookups are permitted in presentation components; workflows and substantial derived state belong in hooks. Avoid hardcoded visible messages in components or hooks.

Carry semantic HTML, labels, focus management, keyboard access, and loading, empty, success, and error states through the implementation. Use stable list keys. Reuse the UI package's accessibility behavior where available.

Client permission state controls presentation; every protected operation still requires authorization at its trusted server or native boundary.
