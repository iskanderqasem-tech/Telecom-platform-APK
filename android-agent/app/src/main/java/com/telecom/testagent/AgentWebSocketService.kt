package com.telecom.testagent

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.Timer
import java.util.TimerTask
import java.util.concurrent.TimeUnit

class AgentWebSocketService : Service() {
    private var webSocket: WebSocket? = null
    private var heartbeatTimer: Timer? = null
    private var deviceIdentifier: String = ""

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        val notification = NotificationCompat.Builder(this, "agent")
            .setContentTitle("Telecom Agent v1")
            .setContentText("Agent service running")
            .setSmallIcon(android.R.drawable.stat_sys_upload_done)
            .build()
        startForeground(1001, notification)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val wsUrl = intent?.getStringExtra("wsUrl") ?: Prefs.get(this, "wsUrl", "wss://telecom-platform-apk.onrender.com/ws")
        deviceIdentifier = intent?.getStringExtra("deviceIdentifier") ?: Prefs.get(this, "deviceIdentifier", "phone-a")
        connect(wsUrl)
        return START_STICKY
    }

    private fun connect(wsUrl: String) {
        val client = OkHttpClient.Builder()
            .readTimeout(0, TimeUnit.MILLISECONDS)
            .pingInterval(20, TimeUnit.SECONDS)
            .build()

        val request = Request.Builder().url(wsUrl).build()
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                sendRegister(webSocket)
                startHeartbeat(webSocket)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                handleMessage(webSocket, text)
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                stopHeartbeat()
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                stopHeartbeat()
            }
        })
    }

    private fun sendRegister(webSocket: WebSocket) {
        val message = JSONObject()
            .put("type", "REGISTER")
            .put("deviceIdentifier", deviceIdentifier)
            .put("batteryLevel", 100)
            .put("signalStrength", -85)
            .put("networkType", "LTE")
        webSocket.send(message.toString())
    }

    private fun startHeartbeat(webSocket: WebSocket) {
        stopHeartbeat()
        heartbeatTimer = Timer()
        heartbeatTimer?.scheduleAtFixedRate(object : TimerTask() {
            override fun run() {
                val heartbeat = JSONObject()
                    .put("type", "HEARTBEAT")
                    .put("deviceIdentifier", deviceIdentifier)
                    .put("batteryLevel", 95)
                    .put("signalStrength", -85)
                    .put("networkType", "LTE")
                webSocket.send(heartbeat.toString())
            }
        }, 1000, 30000)
    }

    private fun stopHeartbeat() {
        heartbeatTimer?.cancel()
        heartbeatTimer = null
    }

    private fun handleMessage(webSocket: WebSocket, text: String) {
        try {
            val message = JSONObject(text)
            if (message.optString("type") != "RUN_TEST") return

            val executionId = message.optString("executionId")
            val testType = message.optString("testType")
            val config = message.optJSONObject("configuration") ?: JSONObject()
            val expected = message.optString("expectedResult", "")

            val result = when (testType.uppercase()) {
                "VOICE_CALL" -> TelecomActions.executeVoiceCall(this, config)
                "SMS" -> TelecomActions.executeSms(this, config)
                "DATA" -> TelecomActions.executeData(config)
                else -> Pair("Unsupported test type: $testType", JSONObject().put("unsupportedTestType", testType))
            }

            val upload = JSONObject()
                .put("type", "RESULT")
                .put("executionId", executionId)
                .put("deviceIdentifier", deviceIdentifier)
                .put("status", if (result.first.startsWith("Unsupported") || result.first.contains("permission not granted", true) || result.first.contains("missing", true)) "FAIL" else "PASS")
                .put("actualResult", result.first)
                .put("expectedResult", expected)
                .put("executionLog", "Android Agent v1 executed $testType")
                .put("metrics", result.second)

            webSocket.send(upload.toString())
        } catch (e: Exception) {
            val error = JSONObject()
                .put("type", "RESULT")
                .put("deviceIdentifier", deviceIdentifier)
                .put("status", "FAIL")
                .put("actualResult", "Agent error: ${e.message}")
                .put("executionLog", e.stackTraceToString())
            webSocket.send(error.toString())
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel("agent", "Telecom Agent", NotificationManager.IMPORTANCE_LOW)
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        stopHeartbeat()
        webSocket?.close(1000, "Service stopped")
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
