// Fixed ambient backdrop: a few slow-drifting aurora glows in the brand hues
// over a deep indigo base, finished with a film-grain overlay and a vignette.
// Pure CSS (gradients + one static SVG-noise data URI) so it costs almost
// nothing per frame, and the drift is disabled under prefers-reduced-motion.

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'radial-gradient(120% 90% at 50% -10%, #0a0b16 0%, #06060e 60%)' }}
    >
      <div
        className="aurora"
        style={{
          width: '60vw',
          height: '60vw',
          left: '-12vw',
          top: '-18vh',
          background: 'radial-gradient(circle, rgba(167,139,250,0.55), transparent 62%)',
          opacity: 0.5,
          animationDuration: '32s',
        }}
      />
      <div
        className="aurora"
        style={{
          width: '55vw',
          height: '55vw',
          right: '-14vw',
          top: '28vh',
          background: 'radial-gradient(circle, rgba(34,211,238,0.4), transparent 62%)',
          opacity: 0.42,
          animationDuration: '40s',
          animationDirection: 'alternate',
        }}
      />
      <div
        className="aurora"
        style={{
          width: '48vw',
          height: '48vw',
          left: '30vw',
          bottom: '-22vh',
          background: 'radial-gradient(circle, rgba(245,158,11,0.28), transparent 60%)',
          opacity: 0.4,
          animationDuration: '48s',
        }}
      />
      {/* film grain */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: GRAIN, opacity: 0.045, mixBlendMode: 'overlay' }}
      />
      {/* vignette to focus the center */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  )
}
