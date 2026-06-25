package com.telecom.testagent

import android.content.Context

object Prefs {
    private const val NAME = "telecom_agent_prefs"

    fun put(context: Context, key: String, value: String) {
        context.getSharedPreferences(NAME, Context.MODE_PRIVATE).edit().putString(key, value).apply()
    }

    fun get(context: Context, key: String, default: String = ""): String {
        return context.getSharedPreferences(NAME, Context.MODE_PRIVATE).getString(key, default) ?: default
    }
}
