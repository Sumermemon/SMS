# EduManage design tokens

## Identity

EduManage uses a structured speech-grid mark: the surrounding form represents an operational system and its three internal bars represent the roster, timetable, and communication layers. It remains legible at 16px and uses `currentColor` for single-colour deployment.

The display face is **Manrope** for product names and headings; **Inter** remains the data/UI workhorse for its excellent table legibility.

## Foundations

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--canvas` | `#F7F5F0` | `#14120F` | app background |
| `--surface` | `#FFFFFF` | `#201D19` | raised work surface |
| `--brand-navy` | `#0F1B3D` | `#111D40` | structure, headings, sidebar |
| `--brand-amber` | `#D89B3C` | `#E8A93F` | actions and key highlights only |
| `--success` | `#5B8A6B` | `#69C990` | positive state |
| `--warning` | `#C67B4E` | `#F2BD61` | attention state |
| `--danger` | `#B0503E` | `#F28B8B` | destructive state |
| `--info` | `#5B7A9E` | `#9BB4D0` | informational state |

Typography: 12/13/14/16/20/24/32px, with 1.25 heading and 1.5 body line-height. Metrics and table values use tabular numerals. Layout uses an 8px rhythm; content is spacious (24px+) while data rows remain compact (12–14px vertical padding).

`--primary` aliases amber for existing components; named brand tokens are preferred in new code. There is no Tailwind configuration in this CSS-based project, so these CSS custom properties are the source of truth. Elevation is reserved for hierarchy: canvas → bordered surface → dialogs. Cards do not elevate merely on hover. Dark mode is driven by `[data-theme="dark"]` and preserves contrast rather than inverting grays.
