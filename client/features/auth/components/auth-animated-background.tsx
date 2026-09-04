/** Full-screen laser video behind the public authentication UI. */
export function AuthAnimatedBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden bg-[#08060F] dark:block"
      aria-hidden="true"
    >
      {/* Soft cover layer fills space revealed by the zoomed-out main video. */}
      <video
        className="pointer-events-none absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/videos/memovix-laser-background.mp4" type="video/mp4" />
      </video>

      {/* Keep the full height while extending the composition horizontally. */}
      <video
        className="pointer-events-none absolute inset-0 size-full scale-x-125 object-contain motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/videos/memovix-laser-background.mp4" type="video/mp4" />
      </video>

      {/* Preserve the existing contrast on both the marketing copy and form. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,6,15,0.58),rgba(8,6,15,0.32)_48%,rgba(8,6,15,0.68))]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,15,0.08),rgba(8,6,15,0.34))]" />
    </div>
  );
}
