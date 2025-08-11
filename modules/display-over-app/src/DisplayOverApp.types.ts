import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type ChangeEventPayload = {
  value: string;
};

// Payload for YouTube watch tracking
export type YoutubeWatchPayload = {
  duration: number; // seconds watched
};

export type DisplayOverAppModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
  onYoutubeWatch: (params: YoutubeWatchPayload) => void; // Event triggered when watching ends
};

export type DisplayOverAppViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
