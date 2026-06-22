export default function AppDownloadCTA() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        disabled
        className="flex items-center gap-3 rounded-xl border border-hairline bg-panel px-5 py-3 text-left opacity-60 cursor-not-allowed"
        aria-disabled="true"
      >
        <span className="text-2xl"></span>
        <span>
          <div className="text-[10px] text-ash">Coming soon on the</div>
          <div className="text-sm font-semibold text-mist">App Store</div>
        </span>
      </button>
      <button
        disabled
        className="flex items-center gap-3 rounded-xl border border-hairline bg-panel px-5 py-3 text-left opacity-60 cursor-not-allowed"
        aria-disabled="true"
      >
        <span className="text-2xl">▶</span>
        <span>
          <div className="text-[10px] text-ash">Coming soon on</div>
          <div className="text-sm font-semibold text-mist">Google Play</div>
        </span>
      </button>
    </div>
  );
}
