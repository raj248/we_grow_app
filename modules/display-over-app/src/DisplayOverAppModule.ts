import { NativeModule, requireNativeModule } from 'expo';
import { DisplayOverAppModuleEvents } from './DisplayOverApp.types';

declare class DisplayOverAppModule extends NativeModule<DisplayOverAppModuleEvents> {
  /**
   * Requests permission to display overlay windows.
   * @returns Promise<boolean> - true if granted, false otherwise.
   */
  requestOverlayPermission(): Promise<boolean>;

  /**
   *Checks if the accessibility permissions have been granted
   * @returns Promise<boolean> - true if granted, false otherwise
   */
  hasAccessibilityPermission(): Promise<boolean>;
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

  /**
   * Shows the timer overlay.
   * @returns Promise<boolean> - true if shown successfully, false otherwise.
   */
  showTimerOverlay(): Promise<boolean>;

  /**
   * Hides the timer overlay if visible.
   * @returns Promise<boolean> - true if hidden successfully, false otherwise.
   */
  hideTimerOverlay(): Promise<boolean>;

  /**
   * Updates the timer text on the overlay.
   * @param text - The text to display, e.g. "Timer: 5s"
   * @returns Promise<boolean> - true if updated successfully, false otherwise.
   */
  updateTimerText(text: string): Promise<boolean>;
}

// Load native module from JSI
export default requireNativeModule<DisplayOverAppModule>('DisplayOverApp');
