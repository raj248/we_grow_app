import { NativeModule, requireNativeModule } from 'expo';
import { DisplayOverAppModuleEvents } from './DisplayOverApp.types';

declare class DisplayOverAppModule extends NativeModule<DisplayOverAppModuleEvents> {
  /**
   * Requests permission to display overlay windows.
   * @returns Promise<boolean> - true if granted, false otherwise.
   */
  requestOverlayPermission(): Promise<boolean>;

  /**
   * Opens accessibility settings for the user to enable our tracking service.
   * @returns Promise<boolean> - true if enabled after settings, false otherwise.
   */
  requestAccessibilityPermission(): Promise<boolean>;

  /**
   * Shows a full-screen overlay for the specified duration (seconds).
   * Blocks touches and back button.
   * @returns Promise<boolean> - true if overlay was displayed successfully, false otherwise.
   */
  showOverlay(duration: number): Promise<boolean>;

  /**
   * Removes any active overlay immediately.
   * @returns Promise<boolean> - true if an overlay was removed, false otherwise.
   */
  removeOverlay(): Promise<boolean>;

  /**
   * Marks the start of a YouTube watch session so duration can be calculated.
   * Should be called before opening YouTube.
   * @returns Promise<boolean> - true if the watch start was recorded, false otherwise.
   */
  startYoutubeWatch(): Promise<boolean>;
}

// Load native module from JSI
export default requireNativeModule<DisplayOverAppModule>('DisplayOverApp');
