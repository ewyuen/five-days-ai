## Context

Tailwind CSS v4 handles configuration primarily inside the CSS file using the `@theme` directive. Rather than modifying hardcoded utility classes across dozens of components, we can intercept the Tailwind zinc scale globally.

## Goals / Non-Goals

**Goals:**
- Dynamically transition `zinc` utility scale values using CSS custom properties.
- Support smooth color fading on theme switches.

**Non-Goals:**
- Rewriting JS component code or changing Tailwind class strings.

## Decisions

### 1. CSS Variable Theme Mapping
In `globals.css`, we will map CSS custom properties inside the `@theme` directive:
```css
@theme {
  --color-zinc-50: var(--zinc-50);
  --color-zinc-100: var(--zinc-100);
  --color-zinc-200: var(--zinc-200);
  --color-zinc-300: var(--zinc-300);
  --color-zinc-400: var(--zinc-400);
  --color-zinc-500: var(--zinc-500);
  --color-zinc-600: var(--zinc-600);
  --color-zinc-700: var(--zinc-700);
  --color-zinc-800: var(--zinc-800);
  --color-zinc-900: var(--zinc-900);
  --color-zinc-950: var(--zinc-950);
}
```

The underlying values of `--zinc-X` will be defined:
- **Light Mode (`:root` default)**: `--zinc-950` will be `#ffffff`, `--zinc-100` will be `#18181b`, reversing the colors to be light-mode native.
- **Dark Mode (`.dark` class)**: Standard dark values mapping from `#09090b` (`zinc-950`) to `#f4f4f5` (`zinc-100`).
