package com.example.telecomtestagent

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CALL_PHONE, Manifest.permission.SEND_SMS, Manifest.permission.READ_PHONE_STATE), 100)

        val layout = LinearLayout(this)
        layout.orientation = LinearLayout.VERTICAL
        val server = EditText(this); server.hint = "Backend WS URL e.g. ws://10.0.2.2:4000/ws"; server.setText("ws://10.0.2.2:4000/ws")
        val device = EditText(this); device.hint = "Device Identifier"; device.setText("android-agent-a")
        val button = Button(this); button.text = "Connect Agent"
        layout.addView(server); layout.addView(device); layout.addView(button)
        setContentView(layout)

        button.setOnClickListener {
            val intent = Intent(this, WebSocketService::class.java)
            intent.putExtra("wsUrl", server.text.toString())
            intent.putExtra("deviceIdentifier", device.text.toString())
            startService(intent)
        }
    }
}
