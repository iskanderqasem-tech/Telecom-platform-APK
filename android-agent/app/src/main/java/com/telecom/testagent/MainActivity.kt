package com.telecom.testagent

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.telephony.TelephonyManager
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import org.json.JSONObject
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {
    private lateinit var status: TextView
    private lateinit var apiUrl: EditText
    private lateinit var wsUrl: EditText
    private lateinit var email: EditText
    private lateinit var password: EditText
    private lateinit var deviceIdentifier: EditText
    private lateinit var deviceLabel: EditText
    private lateinit var msisdn: EditText
    private lateinit var manufacturer: EditText
    private lateinit var model: EditText
    private lateinit var operatorName: EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestPermissions()
        buildUi()
    }

    private fun requestPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.CALL_PHONE,
            Manifest.permission.SEND_SMS,
            Manifest.permission.READ_PHONE_STATE
        )
        if (Build.VERSION.SDK_INT >= 33) permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        ActivityCompat.requestPermissions(this, permissions.toTypedArray(), 100)
    }

    private fun buildUi() {
        val scroll = ScrollView(this)
        val layout = LinearLayout(this)
        layout.orientation = LinearLayout.VERTICAL
        layout.setPadding(32, 32, 32, 32)
        scroll.addView(layout)

        val title = TextView(this)
        title.text = "Telecom Android Agent v1"
        title.textSize = 24f
        layout.addView(title)

        status = TextView(this)
        status.text = "Status: not connected"
        status.textSize = 16f
        layout.addView(status)

        apiUrl = field("API URL", Prefs.get(this, "apiUrl", "https://telecom-platform-apk.onrender.com"))
        wsUrl = field("WebSocket URL", Prefs.get(this, "wsUrl", "wss://telecom-platform-apk.onrender.com/ws"))
        email = field("Email", Prefs.get(this, "email", "admin@example.com"))
        password = field("Password", Prefs.get(this, "password", "Admin123!"))
        deviceIdentifier = field("Device Identifier - must match portal, e.g. phone-a", Prefs.get(this, "deviceIdentifier", "phone-a"))
        deviceLabel = field("Device Label", Prefs.get(this, "deviceLabel", "Test Phone A"))
        msisdn = field("MSISDN", Prefs.get(this, "msisdn", "+64224794052"))
        manufacturer = field("Manufacturer", Build.MANUFACTURER)
        model = field("Model", Build.MODEL)
        operatorName = field("Network Operator", getOperator())

        listOf(apiUrl, wsUrl, email, password, deviceIdentifier, deviceLabel, msisdn, manufacturer, model, operatorName).forEach { layout.addView(it) }

        val loginButton = Button(this)
        loginButton.text = "1. Login"
        loginButton.setOnClickListener { login() }
        layout.addView(loginButton)

        val registerButton = Button(this)
        registerButton.text = "2. Register Device"
        registerButton.setOnClickListener { registerDevice() }
        layout.addView(registerButton)

        val connectButton = Button(this)
        connectButton.text = "3. Connect WebSocket"
        connectButton.setOnClickListener { connectWebSocket() }
        layout.addView(connectButton)

        val stopButton = Button(this)
        stopButton.text = "Stop Agent Service"
        stopButton.setOnClickListener { stopService(Intent(this, AgentWebSocketService::class.java)); setStatus("Service stopped") }
        layout.addView(stopButton)

        setContentView(scroll)
    }

    private fun field(label: String, value: String): EditText {
        val edit = EditText(this)
        edit.hint = label
        edit.setText(value)
        edit.layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        return edit
    }

    private fun login() {
        saveFields()
        setStatus("Logging in...")
        thread {
            try {
                val client = ApiClient(apiUrl.text.toString())
                val response = client.login(email.text.toString(), password.text.toString())
                val token = response.getString("token")
                val user = response.getJSONObject("user")
                val customerId = user.getString("customerId")
                Prefs.put(this, "token", token)
                Prefs.put(this, "customerId", customerId)
                runOnUiThread { setStatus("Login successful. Customer ID saved.") }
            } catch (e: Exception) {
                runOnUiThread { setStatus("Login failed: ${e.message}") }
            }
        }
    }

    private fun registerDevice() {
        saveFields()
        setStatus("Registering device...")
        thread {
            try {
                val token = Prefs.get(this, "token")
                val customerId = Prefs.get(this, "customerId")
                if (token.isBlank() || customerId.isBlank()) throw Exception("Login first")

                val payload = JSONObject()
                    .put("customerId", customerId)
                    .put("deviceLabel", deviceLabel.text.toString())
                    .put("deviceIdentifier", deviceIdentifier.text.toString())
                    .put("deviceSecret", Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID))
                    .put("imei", "")
                    .put("msisdn", msisdn.text.toString())
                    .put("manufacturer", manufacturer.text.toString())
                    .put("model", model.text.toString())
                    .put("androidVersion", Build.VERSION.RELEASE)
                    .put("networkOperator", operatorName.text.toString())

                ApiClient(apiUrl.text.toString()).registerDevice(token, payload)
                runOnUiThread { setStatus("Device registered as ${deviceIdentifier.text}") }
            } catch (e: Exception) {
                runOnUiThread { setStatus("Register failed: ${e.message}") }
            }
        }
    }

    private fun connectWebSocket() {
        saveFields()
        val service = Intent(this, AgentWebSocketService::class.java)
        service.putExtra("wsUrl", wsUrl.text.toString())
        service.putExtra("deviceIdentifier", deviceIdentifier.text.toString())
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startForegroundService(service) else startService(service)
        setStatus("WebSocket service started for ${deviceIdentifier.text}")
    }

    private fun saveFields() {
        Prefs.put(this, "apiUrl", apiUrl.text.toString())
        Prefs.put(this, "wsUrl", wsUrl.text.toString())
        Prefs.put(this, "email", email.text.toString())
        Prefs.put(this, "password", password.text.toString())
        Prefs.put(this, "deviceIdentifier", deviceIdentifier.text.toString())
        Prefs.put(this, "deviceLabel", deviceLabel.text.toString())
        Prefs.put(this, "msisdn", msisdn.text.toString())
    }

    private fun setStatus(text: String) {
        status.text = "Status: $text"
        Toast.makeText(this, text, Toast.LENGTH_LONG).show()
    }

    private fun getOperator(): String {
        return try {
            val tm = getSystemService(TELEPHONY_SERVICE) as TelephonyManager
            tm.networkOperatorName ?: ""
        } catch (_: Exception) {
            ""
        }
    }
}
