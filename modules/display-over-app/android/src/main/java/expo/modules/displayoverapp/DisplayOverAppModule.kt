package expo.modules.displayoverapp

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Handler
import android.os.Build
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.widget.FrameLayout
import android.widget.TextView
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Simple event bus to communicate with JS
object DisplayOverAppEventBus {
    var emitEvent: ((String, Map<String, Any?>) -> Unit)? = null
}

class DisplayOverAppModule : Module() {
    private var overlayView: View? = null
    // private var wm: WindowManager? = null
    // private var timerTextView: TextView? = null

    override fun definition() = ModuleDefinition {
        Name("DisplayOverApp")
        Events("onChange", "onYoutubeWatch", "onYoutubeOpen")

        OnStartObserving {
            DisplayOverAppEventBus.emitEvent = { eventName, params ->
                sendEvent(eventName, params)
            }
        }

        OnStopObserving {
            DisplayOverAppEventBus.emitEvent = null
        }

        AsyncFunction("requestOverlayPermission") {
            val context = appContext.reactContext ?: return@AsyncFunction false
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
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
                false
            }
        }

        AsyncFunction("showOverlay") { duration: Int ->
            showBlockerOverlay(duration)
        }

        AsyncFunction("removeOverlay") { removeOverlay() }

        AsyncFunction("showTimerOverlay") {
            val context = appContext.currentActivity ?: appContext.reactContext ?: return@AsyncFunction false
            startTimerOverlay(context)
            true
        }

        AsyncFunction("hideTimerOverlay") {
            stopTimerOverlay()
            true
        }

        AsyncFunction("updateTimerText") { seconds: Int ->
            timerTextView?.text = "Timer: ${seconds}s"
        }
    }

    private fun showBlockerOverlay(duration: Int): Boolean {
        val context = appContext.currentActivity ?: appContext.reactContext ?: return false
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) return false

        return try {
            wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
            val blocker = object : FrameLayout(context) {
                override fun onInterceptTouchEvent(ev: MotionEvent?) = true
                override fun onTouchEvent(event: MotionEvent?) = true
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
            val blockerhandler = Handler(Looper.getMainLooper())
            wm?.addView(blocker, params)
            overlayView = blocker
            isOverlayVisible = true

            blockerhandler.postDelayed({ removeOverlay() }, duration * 1000L)
            true
        } catch (e: Exception) {
            isOverlayVisible = false
            false
        }
    }

    private fun removeOverlay() {
        overlayView?.let {
            try {
                wm?.removeView(it)
                YoutubeWatchService.youtubeStartTime?.let { start ->
                    val duration = ((System.currentTimeMillis() - start) / 1000).toInt()
                    YoutubeWatchService.youtubeStartTime = null
                    DisplayOverAppEventBus.emitEvent?.invoke(
                        "onYoutubeWatch",
                        mapOf("duration" to duration)
                    )
                }
            } catch (_: Exception) {}
            overlayView = null
            isOverlayVisible = false
        }
    }

    companion object {
        var isOverlayVisible: Boolean = false
        var isTimerOverlayVisible: Boolean = false

        private var wm: WindowManager? = null
        private var timerTextView: TextView? = null
        
        fun startTimerOverlay(context: Context) {
            Handler(Looper.getMainLooper()).post {
                if (timerTextView != null) return@post
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) return@post

                val wmLocal = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
                setWindowManager(wmLocal)

                val textView = TextView(context).apply {
                    text = "Timer: 0s"
                    setTextColor(0xFFFFFFFF.toInt())
                    setBackgroundColor(0xAA000000.toInt())
                    textSize = 16f
                    setPadding(16, 16, 16, 16)
                }
                setTimerView(textView)

                val params = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    else @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.TOP or Gravity.END
                    x = 30
                    y = 100
                }

                wmLocal.addView(textView, params)
                isTimerOverlayVisible = true
            }

        }

        fun stopTimerOverlay() {
            timerTextView?.let { wm?.removeView(it) }
            timerTextView = null
            isTimerOverlayVisible = false
        }

        fun setWindowManager(windowManager: WindowManager) {
            wm = windowManager
        }

        fun setTimerView(view: TextView) {
            timerTextView = view
        }
        fun setTimerText(seconds: Int) {
            timerTextView?.text = "Timer: ${seconds}s"
        }

    }

}

class YoutubeWatchService : AccessibilityService() {
    companion object {
        private const val YOUTUBE_PACKAGE = "com.google.android.youtube"
        private const val OUR_APP_PACKAGE = "com.we_grow"
        var youtubeStartTime: Long? = null

        private val handler = Handler(Looper.getMainLooper())
        private var secondsElapsed = 0

        private val updateRunnable = object : Runnable {
            override fun run() {
                secondsElapsed++
                Handler(Looper.getMainLooper()).post {
                    DisplayOverAppModule.setTimerText(secondsElapsed)
                }
                handler.postDelayed(this, 1000)
            }
        }

        fun startNativeTimer() {
            secondsElapsed = 0
            handler.postDelayed(updateRunnable, 1000)
        }

        fun stopNativeTimer() {
            handler.removeCallbacks(updateRunnable)
            secondsElapsed = 0
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val pkg = event?.packageName?.toString() ?: return
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        when (pkg) {
            YOUTUBE_PACKAGE -> {
                if (!DisplayOverAppModule.isOverlayVisible) return
                
                DisplayOverAppEventBus.emitEvent?.invoke(
                    "onYoutubeOpen",
                    mapOf("timestamp" to System.currentTimeMillis())
                )

                if (youtubeStartTime == null) {
                    youtubeStartTime = System.currentTimeMillis()
                    DisplayOverAppModule.startTimerOverlay(this) // show overlay
                    startNativeTimer()
                }
            }
            OUR_APP_PACKAGE -> {
                // You could stop here if desired when back in your app
            }
            else -> {
                youtubeStartTime?.let { start ->
                    val duration = ((System.currentTimeMillis() - start) / 1000).toInt()
                    youtubeStartTime = null
                    DisplayOverAppEventBus.emitEvent?.invoke(
                        "onYoutubeWatch",
                        mapOf("duration" to duration)
                    )

                    stopNativeTimer()
                    DisplayOverAppModule.stopTimerOverlay()
                }
            }
        }
    }

    override fun onInterrupt() {}
}
