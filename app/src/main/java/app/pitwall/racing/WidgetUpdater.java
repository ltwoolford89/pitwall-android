package app.pitwall.racing;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class WidgetUpdater {
    private static final String API = "https://api.jolpi.ca/ergast/f1/2026/";
    private static final String PREFS = "native_widget_prefs";
    private static final String APP = "PITWALL";
    private WidgetUpdater() { }

    public static void refreshAsync(Context context) {
        Context app = context.getApplicationContext();
        new Thread(() -> { sync(app); updateAll(app); }, "pitwall-widget-sync").start();
    }

    static void sync(Context context) {
        SharedPreferences pref = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        long last = pref.getLong("refresh_time", 0L);
        if (System.currentTimeMillis() - last < 10 * 60_000L) return;
        String favorite = pref.getString("driver_id", "norris");
        boolean updated = false;
        SharedPreferences.Editor editor = pref.edit();
        try {
            JSONArray races = new JSONObject(get("https://api.jolpi.ca/ergast/f1/2026.json?limit=100"))
                    .getJSONObject("MRData").getJSONObject("RaceTable").getJSONArray("Races");
            long next = Long.MAX_VALUE;
            String raceName = "", circuitName = "";
            for (int n = 0; n < races.length(); n++) {
                JSONObject race = races.getJSONObject(n);
                String start = race.optString("date") + "T" + race.optString("time", "12:00:00Z");
                try {
                    long when = Instant.parse(start).toEpochMilli();
                    if (when > System.currentTimeMillis() && when < next) {
                        next = when;
                        raceName = race.optString("raceName", "Grand Prix");
                        circuitName = race.optJSONObject("Circuit") != null ? race.getJSONObject("Circuit").optString("circuitName", "") : "";
                    }
                } catch (Exception ignored) { }
            }
            if (next != Long.MAX_VALUE) {
                editor.putLong("race_time", next).putString("race_name", raceName).putString("circuit_name", circuitName);
            } else { editor.putLong("race_time", 0).putString("race_name", "2026 season complete"); }
            updated = true;
        } catch (Exception ignored) { }
        try {
            JSONArray standings = new JSONObject(get(API + "driverstandings.json"))
                    .getJSONObject("MRData").getJSONObject("StandingsTable").getJSONArray("StandingsLists");
            if (standings.length() > 0) {
                JSONArray drivers = standings.getJSONObject(0).getJSONArray("DriverStandings");
                String driverName = "Not found", position = "–", points = "–";
                for (int i = 0; i < drivers.length(); i++) {
                    JSONObject standing = drivers.getJSONObject(i);
                    JSONObject driver = standing.getJSONObject("Driver");
                    if (favorite.equalsIgnoreCase(driver.optString("driverId"))) {
                        driverName = driver.optString("givenName") + " " + driver.optString("familyName");
                        position = standing.optString("position", "–");
                        points = standing.optString("points", "–"); break;
                    }
                }
                editor.putString("driver_name", driverName).putString("driver_position", position).putString("driver_points", points);
                updated = true;
            }
        } catch (Exception ignored) { }
        try {
            JSONArray standings = new JSONObject(get(API + "constructorstandings.json"))
                    .getJSONObject("MRData").getJSONObject("StandingsTable").getJSONArray("StandingsLists");
            if (standings.length() > 0) {
                JSONArray constructors = standings.getJSONObject(0).getJSONArray("ConstructorStandings");
                StringBuilder result = new StringBuilder();
                for (int i = 0; i < Math.min(3, constructors.length()); i++) {
                    JSONObject item = constructors.getJSONObject(i);
                    String name = item.getJSONObject("Constructor").optString("name", "Team");
                    result.append(i+1).append(". ").append(name).append("  ").append(item.optString("points", "–")).append(" pts");
                    if (i < Math.min(3, constructors.length())-1) result.append("\n");
                }
                editor.putString("constructor_top", result.toString()); updated = true;
            }
        } catch (Exception ignored) { }
        if (updated) editor.putLong("refresh_time", System.currentTimeMillis());
        editor.apply();
    }

    private static String get(String url) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setConnectTimeout(4000); conn.setReadTimeout(4000);
        conn.setRequestProperty("User-Agent", "PITWALL-Android/1.0 personal-F1-companion");
        try {
            if (conn.getResponseCode() != 200) throw new Exception("HTTP " + conn.getResponseCode());
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            try (InputStream in = conn.getInputStream()) {
                byte[] chunk = new byte[8192]; int amount;
                while ((amount = in.read(chunk)) != -1) { buffer.write(chunk,0,amount); if (buffer.size() > 1_000_000) throw new Exception("too large"); }
            }
            return buffer.toString(StandardCharsets.UTF_8.name());
        } finally { conn.disconnect(); }
    }

    public static void updateAll(Context context) {
        update(context, NextRaceWidget.class, R.layout.widget_next_race, "NEXT GRAND PRIX");
        update(context, DriverWidget.class, R.layout.widget_driver, "FAVOURITE DRIVER");
        update(context, ConstructorWidget.class, R.layout.widget_constructor, "CONSTRUCTORS");
    }
    private static void update(Context context, Class<?> provider, int layout, String title) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, provider));
        SharedPreferences pref = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String main = "Open PITWALL to sync", sub = "F1 2026 championship";
        if (provider == NextRaceWidget.class) {
            main = pref.getString("race_name", main);
            long time = pref.getLong("race_time", 0);
            if (time > 0) {
                String adelaideTime = DateTimeFormatter.ofPattern("EEE d MMM · h:mm a", Locale.ENGLISH)
                        .withZone(ZoneId.of("Australia/Adelaide")).format(Instant.ofEpochMilli(time));
                sub = adelaideTime + " Adelaide\n" + pref.getString("circuit_name", "");
            } else sub = "Open PITWALL to update upcoming races";
        } else if (provider == DriverWidget.class) {
            main = pref.getString("driver_name", main);
            sub = "P" + pref.getString("driver_position", "–") + " · " + pref.getString("driver_points", "–") + " points";
        } else {
            main = pref.getString("constructor_top", main); sub = "2026 constructor championship";
        }
        for (int id : ids) {
            RemoteViews widget = new RemoteViews(context.getPackageName(), layout);
            widget.setTextViewText(R.id.widgetTitle, title);
            widget.setTextViewText(R.id.widgetMain, main);
            widget.setTextViewText(R.id.widgetSub, sub);
            Intent launch = new Intent(context, MainActivity.class);
            PendingIntent pending = PendingIntent.getActivity(context, 200 + id, launch, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            widget.setOnClickPendingIntent(R.id.widgetRoot, pending);
            manager.updateAppWidget(id, widget);
        }
    }
}
