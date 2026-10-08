package app.pitwall.racing;
import android.appwidget.AppWidgetProvider;
import android.appwidget.AppWidgetManager;
import android.content.Context;
public class ConstructorWidget extends AppWidgetProvider {
 @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) { WidgetUpdater.updateAll(context); WidgetUpdater.refreshAsync(context); }
}
