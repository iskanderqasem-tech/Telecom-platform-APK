package com.telecom.testagent

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class ApiClient(private val baseUrl: String) {
    private val client = OkHttpClient()
    private val jsonType = "application/json; charset=utf-8".toMediaType()

    fun login(email: String, password: String): JSONObject {
        val body = JSONObject()
            .put("email", email)
            .put("password", password)
            .toString()
            .toRequestBody(jsonType)

        val request = Request.Builder()
            .url("${baseUrl.trimEnd('/')}/api/auth/login")
            .post(body)
            .build()

        client.newCall(request).execute().use { response ->
            val responseText = response.body?.string() ?: "{}"
            if (!response.isSuccessful) throw Exception("Login failed: $responseText")
            return JSONObject(responseText)
        }
    }

    fun registerDevice(token: String, payload: JSONObject): JSONObject {
        val request = Request.Builder()
            .url("${baseUrl.trimEnd('/')}/api/devices/register")
            .post(payload.toString().toRequestBody(jsonType))
            .addHeader("Authorization", "Bearer $token")
            .build()

        client.newCall(request).execute().use { response ->
            val responseText = response.body?.string() ?: "{}"
            if (!response.isSuccessful) throw Exception("Register failed: $responseText")
            return JSONObject(responseText)
        }
    }
}
