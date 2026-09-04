/**
 * Shared class strings for the public authentication screens (login, register,
 * reset-password, and the client/member invitation register pages).
 *
 * These live in one place so the auth cards and forms can never drift apart.
 * They are theme-aware:
 *   - LIGHT mode falls through to the token-driven shadcn primitives (white
 *     cards, forest-green primary, forest focus ring, muted-foreground text) so
 *     auth matches the premium off-white + forest-green light system.
 *   - DARK mode keeps the exact "aurora / memory" glass identity (violet-tinted
 *     void, translucent inputs, violet button with a lumen-green hover glow),
 *     expressed entirely through `dark:` variants so dark stays unchanged.
 *
 * Every (auth) page still renders on the layout's canvas, which is off-white in
 * light and the fixed dark void (`#08060F`) in dark. Apply via `className` on
 * the shadcn primitives — the primitives themselves stay untouched.
 */

/** Card: light → default white Card; dark → glass panel with violet glow + blur. */
export const authCardClassName =
  "dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_8px_40px_-12px_rgba(82,39,255,0.35)] dark:backdrop-blur-xl";

/** Card heading in the Fraunces display serif; forest in light, mist in dark. */
export const authCardTitleClassName =
  "font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-foreground dark:text-[#ECE9F5]";

/** Card subtitle / description — muted-foreground in light, lavender in dark. */
export const authCardDescriptionClassName =
  "text-muted-foreground dark:text-[#B497CF]";

/** Text input: light → default token-driven input; dark → translucent glass w/ violet focus. */
export const authInputClassName =
  "dark:border-white/10 dark:bg-white/[0.03] dark:text-[#ECE9F5] dark:placeholder:text-[#B497CF]/40 dark:focus-visible:border-[#7C5CFF] dark:focus-visible:ring-[#5227FF]/30";

/** Field label — inherits foreground in light, mist at 85% in dark. */
export const authLabelClassName = "dark:text-[#ECE9F5]/85";

/**
 * Show/hide password toggle button. Structural positioning applies in both
 * modes; colors are muted-foreground/foreground in light, lavender/mist in dark.
 */
export const authPasswordToggleClassName =
  "absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50 dark:text-[#B497CF] dark:hover:text-[#ECE9F5]";

/**
 * Primary submit button — light → default forest-green `Button`; dark → violet
 * fill with the single lumen-green hover glow (the one signature accent).
 * Compose with per-form width/margin, e.g. `cn("mt-2 w-full", authPrimaryButtonClassName)`.
 */
export const authPrimaryButtonClassName =
  "dark:bg-[#5227FF] dark:text-white dark:transition-shadow dark:hover:bg-[#5C34FF] dark:hover:shadow-[0_0_28px_-6px_rgba(124,255,103,0.6)] dark:focus-visible:ring-[#5227FF]";

/** Muted helper text under a form (e.g. "Already have a workspace?"). */
export const authFooterTextClassName =
  "text-muted-foreground dark:text-[#B497CF]/80";

/** Inline accent link — forest in light, violet with a lumen-green underline in dark. */
export const authAccentLinkClassName =
  "font-medium underline underline-offset-4 transition-colors text-primary decoration-primary/40 hover:text-foreground hover:decoration-primary dark:text-[#7C5CFF] dark:decoration-[#7CFF67]/40 dark:hover:text-[#ECE9F5] dark:hover:decoration-[#7CFF67]";
