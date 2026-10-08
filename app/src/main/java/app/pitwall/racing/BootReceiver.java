package app.pitwall.racing;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
public class BootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            if (context.getSharedPreferences("native_widget_prefs",Context.MODE_PRIVATE).getBoolean("reminder_enabled",false))
                RaceAlertReceiver.scheduleNext(context,false);
        }
    }
}
