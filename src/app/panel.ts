// The look shared by the two big cards on every page, the chat and the view beside it: a dark glass panel with rounded
// corners. Each adds its own size and place in the grid, and its own glow
export const PANEL =
  "flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface/85 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl";

// The blue pill buttons beside a project's title: "View on GitHub" is a link and "Ask BEAM-E" is a button, so both
// take the look from here
export const PILL_BUTTON =
  "inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/20 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:border-blue-400/70 hover:bg-blue-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";
