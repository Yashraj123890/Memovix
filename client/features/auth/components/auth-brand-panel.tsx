/**
 * Brand panel for the public auth split-layout (lg+ only). Theme-aware:
 *   - LIGHT: a subtle off-white tonal panel (separated from the form side) with
 *     a forest-green logo mark, forest Fraunces tagline, and a forest "active"
 *     dot — premium and calm, no animated aurora, matching the light system.
 *   - DARK: the unchanged aurora "memory field" over the violet-tinted void,
 *     with a single lumen-green pulse.
 * Base classes are the light values; `dark:` classes reproduce the exact
 * previous dark appearance.
 */
export function AuthBrandPanel() {
  return (
    <div className="bg-secondary relative hidden flex-1 flex-col justify-between overflow-hidden p-10 lg:flex dark:bg-transparent">
      {/* Wordmark */}
      <div className="text-foreground flex items-center gap-2.5 text-lg font-semibold dark:text-[#ECE9F5]">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg font-[family-name:var(--font-display)] dark:bg-[#5227FF] dark:text-[#ECE9F5] dark:shadow-[0_0_20px_-2px_rgba(82,39,255,0.8)]">
          M
        </span>
        Memovix
      </div>

      {/* Tagline block */}
      <div className="max-w-xl xl:max-w-2xl">
        <p className="text-muted-foreground flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] uppercase xl:text-sm dark:text-[#B497CF]">
          {/* Live "active" dot — forest in light (readable on the tonal panel),
              the lumen-green pulse in dark. */}
          <span className="relative flex size-1.5">
            <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75 dark:bg-[#7CFF67]" />
            <span className="bg-primary relative inline-flex size-1.5 rounded-full dark:bg-[#7CFF67]" />
          </span>
          Client Portal
        </p>
        <p className="text-foreground mt-6 font-[family-name:var(--font-display)] text-4xl leading-[1.1] tracking-tight text-balance xl:text-5xl 2xl:text-6xl dark:text-[#ECE9F5]">
          Project memory, always at hand.
        </p>
        <p className="text-muted-foreground mt-5 max-w-md text-base leading-relaxed xl:max-w-lg xl:text-lg dark:text-[#B497CF]/90">
          Every decision, file, and conversation — kept searchable, so your team
          and clients never lose the thread.
        </p>
      </div>

      {/* Footer */}
      <p className="text-muted-foreground/70 font-[family-name:var(--font-mono)] text-xs dark:text-[#B497CF]/60">
        © {new Date().getFullYear()} Memovix
      </p>
    </div>
  );
}
