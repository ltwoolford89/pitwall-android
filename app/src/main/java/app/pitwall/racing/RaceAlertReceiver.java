package app.pitwall.racing;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.widget.Toast;

public class RaceAlertReceiver extends BroadcastReceiver {
    private static final String CHANNEL = "pitwall_race_reminders";
    @Override public void onReceive(Context context, Intent intent) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) nm.createNotificationChannel(new NotificationChannel(CHANNEL, "PITWALL Race Alerts", NotificationManager.IMPORTANCE_DEFAULT));
        if (Build.VERSION.SDK_INT >= 33 && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        Intent start = new Intent(context, MainActivity.class);
        PendingIntent open = PendingIntent.getActivity(context, 450, start, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        String race = context.getSharedPreferences("native_widget_prefs", Context.MODE_PRIVATE).getString("race_name", "Formula 1 race");
        Notification n = new Notification.Builder(context, CHANNEL)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle("PITWALL · Race starts soon")
            .setContentText(race + " is scheduled to start in about 30 minutes.")
            .setContentIntent(open).setAutoCancel(true).build();
        nm.notify(452, n);
    }
    public static void scheduleNext(Context context, boolean showToast) {
        SharedPreferences pref = context.getSharedPreferences("native_widget_prefs", Context.MODE_PRIVATE);
        long millis = pref.getLong("race_time", 0) - 30*60*1000L;
        if (millis <= System.currentTimeMillis()) {
            if (showToast) Toast.makeText(context, "Refresh widgets first; no future race is available", Toast.LENGTH_LONG).show();
            return;
        }
        if (Build.VERSION.SDK_INT >= 33 && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED && context instanceof android.app.Activity) {
            ((android.app.Activity)context).requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 44);
        }
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pi = PendingIntent.getBroadcast(context, 451, new Intent(context, RaceAlertReceiver.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        if (alarm != null) alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, millis, pi);
        if (showToast) { pref.edit().putBoolean("reminder_enabled", true).apply(); Toast.makeText(context, "Race reminder scheduled around 30 min before start", Toast.LENGTH_LONG).show(); }
    }
}
