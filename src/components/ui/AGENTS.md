# src/components/ui

**50 shadcn/ui components** - Radix UI primitives with Tailwind styling.

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Buttons, inputs | `button.tsx`, `input.tsx` |
| Dialogs/modals | `dialog.tsx`, `alert-dialog.tsx` |
| Data display | `table.tsx`, `card.tsx`, `accordion.tsx` |
| Navigation | `navigation-menu.tsx`, `menubar.tsx` |
| Forms | `form.tsx`, `select.tsx`, `checkbox.tsx` |

## CONVENTIONS

- Follows shadcn/ui copy-paste pattern (not a library)
- Each component self-contained with props interface
- Uses `class-variance-authority` for variant props
- Styled with Tailwind utility classes
- Imports icons from `lucide-react`
