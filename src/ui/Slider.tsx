/** Labeled range input. Controlled: pass value + onChange. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  accent = 'combined',
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  format?: (value: number) => string
  accent?: 'token' | 'position' | 'combined'
}) {
  const accentClass =
    accent === 'token'
      ? 'accent-token'
      : accent === 'position'
        ? 'accent-position'
        : 'accent-combined'
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-sm text-prose">
        <span>{label}</span>
        <span className="font-mono text-prose-bright">
          {format ? format(value) : value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${accentClass}`}
      />
    </label>
  )
}
