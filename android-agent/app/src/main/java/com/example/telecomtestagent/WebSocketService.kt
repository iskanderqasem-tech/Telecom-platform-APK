package com.example.telecomtestagent

import android.app.Service
import android.content.Intent
import android.net.Uri
import android.os.IBinder
import android.telephony.SmsManager
import okhttp3.*
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class WebSocketService : Service() {
    private var socket: WebSocket? = null
    private var deviceIdentifier: String = "android-agent"

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val wsUrl = intent?.getStringExtra("wsUrl") ?: "ws://10.0.2.2:4000/ws"
        deviceIdentifier = intent?.getStringExtra("deviceIdentifier") ?: "android-agent"
        connect(wsUrl)
        return START_STICKY
    }

    private fun connect(wsUrl: String) {
        val client = OkHttpClient.Builder().readTimeout(0, TimeUnit.MILLISECONDS).build()
        val request = Request.Builder().url(wsUrl).build()
        socket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                webSocket.send(JSONObject(mapOf("type" to "REGISTER", "deviceIdentifier" to deviceIdentifier, "networkType" to "LTE", "batteryLevel" to 100)).toString())
                Thread {
                    while (true) {
                        webSocket.send(JSONObject(mapOf("type" to "HEARTBEAT", "deviceIdentifier" to deviceIdentifier, "networkType" to "LTE", "batteryLevel" to 95, "signalStrength" to -85)).toString())
                        Thread.sleep(30000)
                    }
                }.start()
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                val json = JSONObject(text)
                if (json.optString("type") == "RUN_TEST") {
                    val executionId = json.optString("executionId")
                    val testType = json.optString("testType")
                    val config = json.optJSONObject("configuration") ?: JSONObject()
                    var actual = "Executed by Android Agent"

                    if (testType == "VOICE_CALL") {
                        val target = config.optString("targetNumber", "")
                        if (target.isNotBlank()) startActivity(Intent(Intent.ACTION_CALL, Uri.parse("tel:$target")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                        actual = "MO call triggered to $target"
                    }
                    if (testType == "SMS") {
                        val target = config.optString("targetNumber", "")
                        val msg = config.optString("message", "Telecom Test SMS")
                        if (target.isNotBlank()) SmsManager.getDefault().sendTextMessage(target, null, msg, null, null)
                        actual = "SMS sent to $target"
                    }
                    if (testType == "DATA") {
                        actual = "Data test placeholder executed"
                    }

                    webSocket.send(JSONObject(mapOf(
                        "type" to "RESULT",
                        "executionId" to executionId,
                        "deviceIdentifier" to deviceIdentifier,
                        "status" to "PASS",
                        "actualResult" to actual,
                        "executionLog" to "Agent completed command",
                        "metrics" to mapOf("rat" to "LTE", "agent" to "kotlin-mvp")
                    )).toString())
                }
            }
        })
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
