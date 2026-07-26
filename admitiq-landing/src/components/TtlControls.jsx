/** Shared TTL helpers + controls for tutorial / playground. */

export const TTL_PRESETS = [
  { seconds: 60, label: "1 min" },
  { seconds: 300, label: "5 min" },
  { seconds: 3600, label: "1 hour" },
  { seconds: 8 * 3600, label: "8 hours" },
  { seconds: 24 * 3600, label: "1 day" },
  { seconds: 7 * 24 * 3600, label: "7 days" },
  { seconds: 30 * 24 * 3600, label: "30 days" },
];

export function formatTtl(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) return "enter a positive duration";
  if (n < 60) return `${Math.round(n)} second${n === 1 ? "" : "s"}`;
  if (n < 3600) {
    const m = n / 60;
    const rounded = Number.isInteger(m) ? m : Math.round(m * 10) / 10;
    return `${rounded} minute${rounded === 1 ? "" : "s"}`;
  }
  if (n < 86400) {
    const h = n / 3600;
    const rounded = Number.isInteger(h) ? h : Math.round(h * 10) / 10;
    return `${rounded} hour${rounded === 1 ? "" : "s"}`;
  }
  const d = n / 86400;
  const rounded = Number.isInteger(d) ? d : Math.round(d * 10) / 10;
  return `${rounded} day${rounded === 1 ? "" : "s"}`;
}

export function formatExpiryFromNow(ttlSeconds) {
  const n = Number(ttlSeconds);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(Date.now() + n * 1000).toLocaleString();
}

/**
 * TTL input with presets, seconds field, and human-readable summary.
 * @param {{ value: number|string, onChange: (seconds: number) => void, id?: string, hint?: string }} props
 */
export function TtlControls({ value, onChange, id = "ttl", hint }) {
  const seconds = Number(value);
  const valid = Number.isFinite(seconds) && seconds >= 1;
  const summary = formatTtl(seconds);
  const expiresAt = formatExpiryFromNow(seconds);

  return (
    <div className="aq-ttl">
      <div className="aq-ttl-label-row">
        <label className="aq-field aq-ttl-field" htmlFor={id}>
          <span>TTL (seconds until expiry)</span>
          <input
            id={id}
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={Number.isFinite(seconds) ? seconds : ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                onChange("");
                return;
              }
              onChange(Number(raw));
            }}
            aria-describedby={`${id}-hint`}
          />
        </label>
        <p id={`${id}-hint`} className="aq-ttl-summary" aria-live="polite">
          {valid ? (
            <>
              Lives about <strong>{summary}</strong>
              {expiresAt ? (
                <>
                  {" "}
                  · expires around <strong>{expiresAt}</strong> (from now, if you issue now)
                </>
              ) : null}
            </>
          ) : (
            <>Enter how many seconds the pass should stay valid.</>
          )}
        </p>
      </div>

      <div className="aq-ttl-presets" role="group" aria-label="TTL presets">
        {TTL_PRESETS.map((p) => (
          <button
            key={p.seconds}
            type="button"
            className={`aq-ttl-chip${seconds === p.seconds ? " active" : ""}`}
            onClick={() => onChange(p.seconds)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {hint ? <p className="aq-demo-note aq-ttl-hint">{hint}</p> : null}
    </div>
  );
}
