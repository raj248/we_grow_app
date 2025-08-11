import { requireNativeView } from 'expo';
import * as React from 'react';

import { DisplayOverAppViewProps } from './DisplayOverApp.types';

const NativeView: React.ComponentType<DisplayOverAppViewProps> =
  requireNativeView('DisplayOverApp');

export default function DisplayOverAppView(props: DisplayOverAppViewProps) {
  return <NativeView {...props} />;
}
