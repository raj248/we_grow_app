package expo.modules.displayoverapp

import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.view.*
import android.view.accessibility.AccessibilityEvent
import android.widget.FrameLayout
import android.accessibilityservice.AccessibilityService
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

import android.os.Handler
import android.os.Looper

// Simple event bus to communicate with JS
object DisplayOverAppEventBus {
    var emitEvent: ((String, Map<String, Any?>) -> Unit)? = null
}

class DisplayOverAppModule : Module() {
    private var overlayView: View? = null
    private var wm: WindowManager? = null

    override fun definition() = ModuleDefinition {
        Name("DisplayOverApp")
        Events("onChange", "onYoutubeWatch", "onYoutubeOpen")

        OnStartObserving {
            Log.d(TAG, "JS started observing events")
            DisplayOverAppEventBus.emitEvent = { eventName, params ->
                Log.d(TAG, "Emitting event: $eventName, params: $params")
                sendEvent(eventName, params)
            }
        }

        OnStopObserving {
            Log.d(TAG, "JS stopped observing events")
            DisplayOverAppEventBus.emitEvent = null
        }

        AsyncFunction("requestOverlayPermission") {
            val context = appContext.reactContext ?: return@AsyncFunction false
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
                Log.w(TAG, "Overlay permission missing, opening settings")
                context.startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${context.packageName}")).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                })
                return@AsyncFunction false
            }
            true
        }

        AsyncFunction("requestAccessibilityPermission") {
            val context = appContext.currentActivity ?: appContext.reactContext ?: return@AsyncFunction false
            try {
                context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                })
                true
            } catch (e: Exception) {
                Log.e(TAG, "Error opening accessibility settings: ${e.message}", e)
                false
            }
        }

        AsyncFunction("showOverlay") { duration: Int ->
            val context = appContext.currentActivity ?: appContext.reactContext ?: return@AsyncFunction false

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
                Log.w(TAG, "Overlay permission not granted, opening settings...")
                context.startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${context.packageName}")).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                })
                return@AsyncFunction false
            }

            try {
                wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
                val blocker = object : FrameLayout(context) {
                    override fun onInterceptTouchEvent(ev: MotionEvent?): Boolean = true
                    override fun onTouchEvent(event: MotionEvent?): Boolean = true
                }

                val params = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    else @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    PixelFormat.TRANSLUCENT
                )

                wm?.addView(blocker, params)
                overlayView = blocker
                // sendEvent("onYoutubeWatch", mapOf("duration" to duration))

                blocker.postDelayed({ removeOverlay() }, duration * 1000L)
                true
            } catch (e: Exception) {
                Log.e(TAG, "Error showing overlay: ${e.message}", e)
                false
            }
        }

        AsyncFunction("removeOverlay") { removeOverlay() }
        AsyncFunction("startYoutubeWatch") { /* future expansion */ }
    }

    private fun removeOverlay() {
        overlayView?.let {
            try {
                wm?.removeView(it)
                Log.d(TAG, "Overlay removed successfully")

                // Send YouTube watch duration if available
                YoutubeWatchService.youtubeStartTime?.let { start ->
                    val duration = ((System.currentTimeMillis() - start) / 1000).toInt()
                    YoutubeWatchService.youtubeStartTime = null // reset
                    DisplayOverAppEventBus.emitEvent?.invoke(
                        "onYoutubeWatch",
                        mapOf("duration" to duration)
                    )
                    Log.d(TAG, "Emitted YouTube watch duration: $duration seconds")
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error removing overlay: ${e.message}", e)
            }
            overlayView = null
        }
    }

    companion object { private const val TAG = "DisplayOverApp" }
}

class YoutubeWatchService : AccessibilityService() {
    companion object {
        private const val YOUTUBE_PACKAGE = "com.google.android.youtube"
        private const val OUR_APP_PACKAGE = "com.we_grow" // Replace with your app package
        var youtubeStartTime: Long? = null
        private const val TAG = "YoutubeWatchService"
    }

    private var lastPackage: String? = null

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val pkg = event?.packageName?.toString() ?: return
        Log.d(TAG, "Event from package: $pkg | type: ${event.eventType}")

        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        when (pkg) {
            YOUTUBE_PACKAGE -> {
                DisplayOverAppEventBus.emitEvent?.invoke(
                    "onYoutubeOpen",
                    mapOf("timestamp" to System.currentTimeMillis())
                )

                if (youtubeStartTime == null) {
                    youtubeStartTime = System.currentTimeMillis()
                    Log.d(TAG, "YouTube started at $youtubeStartTime")
                }
            }

            OUR_APP_PACKAGE -> {
                // Our app — do nothing, keep timer running
            }

            else -> {
                youtubeStartTime?.let { start ->
                    val duration = ((System.currentTimeMillis() - start) / 1000).toInt()
                    youtubeStartTime = null
                    Log.d(TAG, "YouTube ended, duration: $duration seconds")
                    DisplayOverAppEventBus.emitEvent?.invoke(
                        "onYoutubeWatch",
                        mapOf("duration" to duration)
                    )
                }
            }
        }

        lastPackage = pkg
    }

    override fun onInterrupt() {}
}

