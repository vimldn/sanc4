export function TransparencyBanner() {
  return (
    <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-8">
      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-emerald-900">
          Sanctuary Direct — no commission markup
        </p>
        <p className="text-sm text-emerald-700 mt-0.5">
          Hotels pay a flat monthly fee, not 20% per booking.
          A guaranteed minimum 10% saving is passed to you — by contract.
        </p>
      </div>
    </div>
  )
}
