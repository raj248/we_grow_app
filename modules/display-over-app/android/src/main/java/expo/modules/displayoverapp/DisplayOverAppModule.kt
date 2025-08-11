package expo.modules.displayoverapp

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper

import android.provider.Settings
import android.view.Gravity
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.graphics.PixelFormat
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

object DisplayOverAppEventBus {
    var emitEvent: ((String, Map<String, Any?>) -> Unit)? = null
}

class DisplayOverAppModule : Module() {
    private var overlayView: View? = null
    private var wm: WindowManager? = null

    override fun definition() = ModuleDefinition {
        Name("DisplayOverApp")

        Events("onChange", "onYoutubeWatch")

        OnStartObserving {
            Log.d("DisplayOverApp", "JS started observing events")
            DisplayOverAppEventBus.emitEvent = { eventName, params ->
                Log.d("DisplayOverApp", "Emitting event: $eventName with params: $params")
                sendEvent(eventName, params)
            }
        }

        OnStopObserving {
            Log.d("DisplayOverApp", "JS stopped observing events")
            DisplayOverAppEventBus.emitEvent = null
        }

        AsyncFunction("requestOverlayPermission") {
            Log.d("DisplayOverApp", "requestOverlayPermission() called")
            val context = appContext.reactContext ?: run {
                Log.e("DisplayOverApp", "Context is null in requestOverlayPermission")
                return@AsyncFunction false
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                !Settings.canDrawOverlays(context)
            ) {
                Log.w("DisplayOverApp", "Overlay permission missing, opening settings")
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${context.packageName}")
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                return@AsyncFunction false
            }
            Log.d("DisplayOverApp", "Overlay permission already granted")
            true
        }

        AsyncFunction("requestAccessibilityPermission") {
            Log.d("DisplayOverApp", "requestAccessibilityPermission() called")

            val context = appContext.currentActivity ?: appContext.reactContext ?: run {
                Log.e("DisplayOverApp", "No valid context in requestAccessibilityPermission")
                return@AsyncFunction false
            }

            try {
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                Log.d("DisplayOverApp", "Opening accessibility settings")
                context.startActivity(intent)
                true
            } catch (e: Exception) {
                Log.e("DisplayOverApp", "Error opening accessibility settings: ${e.message}", e)
                false
            }
        }

        AsyncFunction("showOverlay") { duration: Int ->
            Log.d("DisplayOverApp", "showOverlay() called for duration: $duration seconds")

            val context = appContext.currentActivity ?: appContext.reactContext ?: run {
                Log.e("DisplayOverApp", "No valid context in showOverlay")
                return@AsyncFunction false
            }

            // Check overlay permission
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                !Settings.canDrawOverlays(context)
            ) {
                Log.w("DisplayOverApp", "Overlay permission not granted, opening settings...")
                try {
                    val intent = Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:${context.packageName}")
                    ).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(intent)
                } catch (e: Exception) {
                    Log.e("DisplayOverApp", "Failed to open overlay permission settings: ${e.message}", e)
                }
                return@AsyncFunction false
            }

            try {
                wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
                Log.d("DisplayOverApp", "WindowManager acquired: $wm")

                val inflater = LayoutInflater.from(context)
                val layoutId = context.resources.getIdentifier(
                    "overlay_layout",
                    "layout",
                    context.packageName
                )

                if (layoutId == 0) {
                    Log.e("DisplayOverApp", "overlay_layout resource not found")
                    return@AsyncFunction false
                }

                overlayView = inflater.inflate(layoutId, null)
                if (overlayView == null) {
                    Log.e("DisplayOverApp", "Failed to inflate overlay view")
                    return@AsyncFunction false
                }

                overlayView?.apply {
                    setOnTouchListener { _, _ ->
                        Log.d("DisplayOverApp", "Overlay touch intercepted")
                        true
                    }
                    isFocusableInTouchMode = true
                    requestFocus()
                    setOnKeyListener { _, keyCode, _ ->
                        Log.d("DisplayOverApp", "Key pressed in overlay: $keyCode")
                        keyCode == KeyEvent.KEYCODE_BACK
                    }
                }

                val overlayType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                } else {
                    @Suppress("DEPRECATION")
                    WindowManager.LayoutParams.TYPE_PHONE
                }
                Log.d("DisplayOverApp", "Overlay type: $overlayType")

                val params = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    overlayType,
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                    PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.TOP or Gravity.START
                }

                Log.d("DisplayOverApp", "Adding overlay view to WindowManager")
                wm?.addView(overlayView, params)
                Log.d("DisplayOverApp", "Overlay view added successfully")

                sendEvent("onYoutubeWatch", mapOf("duration" to duration))

                overlayView?.postDelayed({
                    Log.d("DisplayOverApp", "Scheduled overlay removal after $duration seconds")
                    removeOverlay()
                }, duration * 1000L)

                return@AsyncFunction true
            } catch (e: Exception) {
                Log.e("DisplayOverApp", "Error showing overlay: ${e.message}", e)
                return@AsyncFunction false
            }
        }

        AsyncFunction("removeOverlay") { _: Unit ->
            Log.d("DisplayOverApp", "removeOverlay() called from JS")
            removeOverlay()
        }

        AsyncFunction("startYoutubeWatch") {
            Log.d("DisplayOverApp", "startYoutubeWatch() called")
            // YoutubeWatchService.manualStartTime = System.currentTimeMillis()
            // Log.d("DisplayOverApp", "Manual start time recorded")
        }

    }

    private fun removeOverlay() {
        overlayView?.let {
            try {
                wm?.removeView(it)
                Log.d("DisplayOverApp", "Overlay removed successfully")
            } catch (e: Exception) {
                Log.e("DisplayOverApp", "Error removing overlay: ${e.message}", e)
            }
            overlayView = null
        } ?: Log.w("DisplayOverApp", "removeOverlay() called but overlayView is null")
    }
}

class YoutubeWatchService : AccessibilityService() {

    companion object {
        var youtubeStartTime: Long? = null
        private const val YOUTUBE_PACKAGE = "com.google.android.youtube"
        private const val TYPE_WINDOW_STATE_CHANGED = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val pkg = event.packageName?.toString() ?: return
        val type = event.eventType

        // Only track YouTube + TYPE_WINDOW_STATE_CHANGED
        if (pkg == YOUTUBE_PACKAGE && type == TYPE_WINDOW_STATE_CHANGED) {
            if (youtubeStartTime == null) {
                // First TYPE_WINDOW_STATE_CHANGED — start timing
                youtubeStartTime = System.currentTimeMillis()
                Log.d("YoutubeWatchService", "YouTube started at $youtubeStartTime")
            } else {
                // Second TYPE_WINDOW_STATE_CHANGED — end timing
                val durationSec = ((System.currentTimeMillis() - youtubeStartTime!!) / 1000).toInt()
                Log.d("YoutubeWatchService", "YouTube ended, duration: $durationSec seconds")
                sendWatchDuration(durationSec)

                // Reset for the next session
                youtubeStartTime = null
            }
        }
    }

    private fun sendWatchDuration(seconds: Int) {
        DisplayOverAppEventBus.emitEvent?.invoke(
            "onYoutubeWatch",
            mapOf("duration" to seconds)
        )
    }

    override fun onInterrupt() {}
}

