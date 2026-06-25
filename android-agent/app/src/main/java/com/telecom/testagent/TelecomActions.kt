package com.telecom.testagent

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.telephony.SmsManager
import androidx.core.content.ContextCompat
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import kotlin.system.measureTimeMillis

object TelecomActions {

    fun executeVoiceCall(context: Context, config: JSONObject): Pair<String, JSONObject> {
        val target = config.optString("targetNumber", "")
        if (target.isBlank()) return Pair("Target number missing", JSONObject().put("action", "VOICE_CALL"))

        val permission = ContextCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE)
        if (permission != PackageManager.PERMISSION_GRANTED) {
            return Pair("CALL_PHONE permission not granted", JSONObject().put("targetNumber", target))
        }

        val intent = Intent(Intent.ACTION_CALL)
        intent.data = Uri.parse("tel:$target")
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)

        val metrics = JSONObject()
            .put("action", "VOICE_CALL")
            .put("targetNumber", target)
            .put("triggered", true)

        return Pair("MO call triggered to $target", metrics)
    }

    fun executeSms(context: Context, config: JSONObject): Pair<String, JSONObject> {
        val target = config.optString("targetNumber", "")
        val message = config.optString("message", "Telecom Test SMS from Android Agent v1")
        if (target.isBlank()) return Pair("Target number missing", JSONObject().put("action", "SMS"))

        val permission = ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS)
        if (permission != PackageManager.PERMISSION_GRANTED) {
            return Pair("SEND_SMS permission not granted", JSONObject().put("targetNumber", target))
        }

        SmsManager.getDefault().sendTextMessage(target, null, message, null, null)

        val metrics = JSONObject()
            .put("action", "SMS")
            .put("targetNumber", target)
            .put("messageLength", message.length)
            .put("triggered", true)

        return Pair("SMS sent to $target", metrics)
    }

    fun executeData(config: JSONObject): Pair<String, JSONObject> {
        val url = config.optString("url", "https://www.google.com")
        val client = OkHttpClient()
        var statusCode = -1
        var bodyBytes = 0

        val elapsed = measureTimeMillis {
            val request = Request.Builder().url(url).get().build()
            client.newCall(request).execute().use { response ->
                statusCode = response.code
                bodyBytes = response.body?.bytes()?.size ?: 0
            }
        }

        val metrics = JSONObject()
            .put("action", "DATA")
            .put("url", url)
            .put("statusCode", statusCode)
            .put("durationMs", elapsed)
            .put("downloadBytes", bodyBytes)

        val status = if (statusCode in 200..399) "Data test successful: HTTP $statusCode in ${elapsed}ms" else "Data test failed: HTTP $statusCode"
        return Pair(status, metrics)
    }
}
