export type DisplayOverAppModuleEvents = {
  onYoutubeWatch: (params: { duration: number }) => void; // Event triggered when watching ends
  onYoutubeOpen: (params: { timestamp: number }) => void; // Event triggered when YouTube opens
};