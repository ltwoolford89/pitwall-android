package app.pitwall.racing;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private WebView browser;
    private android.webkit.ValueCallback<Uri[]> fileChooserCallback;
    private String pendingExport;
    private static final int PICK_FILE = 101;
    private static final int EXPORT_FILE = 102;
    private static final String HOME = "https://appassets.androidplatform.net/assets/pitwall/index.html";

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(android.graphics.Color.rgb(8, 11, 18));
        getWindow().setNavigationBarColor(android.graphics.Color.rgb(8, 11, 18));
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(android.graphics.Color.rgb(8, 11, 18));
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(16, 0, 16, 0);
        header.setBackgroundColor(android.graphics.Color.rgb(18, 24, 35));
        TextView name = new TextView(this);
        name.setText("PITWALL · ANDROID");
        name.setTextColor(android.graphics.Color.WHITE);
        name.setTextSize(13);
        name.setLetterSpacing(.12f);
        name.setTypeface(null, android.graphics.Typeface.BOLD);
        header.addView(name, new LinearLayout.LayoutParams(0, Math.round(44 * getResources().getDisplayMetrics().density), 1));
        TextView tools = new TextView(this);
        tools.setText("⚙  WIDGETS & ALERTS");
        tools.setTextColor(android.graphics.Color.rgb(255, 122, 132));
        tools.setTextSize(11);
        tools.setTypeface(null, android.graphics.Typeface.BOLD);
        tools.setGravity(Gravity.CENTER_VERTICAL);
        tools.setOnClickListener(v -> showNativeControls());
        header.addView(tools);
        root.addView(header);
        browser = new WebView(this);
        browser.setBackgroundColor(android.graphics.Color.rgb(8, 11, 18));
        root.addView(browser, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(root);
        WebSettings settings = browser.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setDefaultTextEncodingName("UTF-8");
        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        browser.setWebViewClient(new WebViewClient() {
            @Override public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("appassets.androidplatform.net".equalsIgnoreCase(uri.getHost())) return false;
                if ("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()) || "mailto".equalsIgnoreCase(uri.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) { }
                }
                return true;
            }
        });
        browser.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, android.webkit.ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
                fileChooserCallback = callback;
                try { startActivityForResult(params.createIntent(), PICK_FILE); return true; }
                catch (Exception e) { fileChooserCallback = null; return false; }
            }
        });
        browser.addJavascriptInterface(new AndroidBridge(), "PitwallAndroid");
        if (state != null) browser.restoreState(state); else browser.loadUrl(HOME);
        WidgetUpdater.refreshAsync(getApplicationContext());
    }

    private void showNativeControls() {
        String[] options = {"Choose favourite driver", "Refresh F1 widgets", "Remind me before next Grand Prix"};
        new AlertDialog.Builder(this).setTitle("PITWALL Android tools")
          .setItems(options, (dialog, selected) -> {
              if (selected == 0) driverSettings();
              else if (selected == 1) { WidgetUpdater.refreshAsync(getApplicationContext()); Toast.makeText(this,"Updating widgets…",Toast.LENGTH_SHORT).show(); }
              else RaceAlertReceiver.scheduleNext(this, true);
          }).show();
    }

    public class AndroidBridge {
        @JavascriptInterface public void saveTextFile(String name, String mime, String text) {
            if (name == null || mime == null || text == null || text.length() > 4_000_000) return;
            if (!(name.matches("[a-zA-Z0-9._-]{1,90}\\.(json|ics)"))) return;
            if (!(mime.startsWith("application/json") || mime.startsWith("text/calendar"))) return;
            runOnUiThread(() -> {
                pendingExport = text;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType(mime);
                i.putExtra(Intent.EXTRA_TITLE, name);
                try { startActivityForResult(i, EXPORT_FILE); }
                catch (Exception e) { Toast.makeText(MainActivity.this, "Could not open file picker", Toast.LENGTH_LONG).show(); }
            });
        }
    }

    @Override protected void onActivityResult(int code, int result, Intent data) {
        super.onActivityResult(code, result, data);
        if (code == PICK_FILE) {
            if (fileChooserCallback != null) {
                fileChooserCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
                fileChooserCallback = null;
            }
        } else if (code == EXPORT_FILE) {
            if (result == RESULT_OK && data != null && data.getData() != null && pendingExport != null) {
                try (OutputStream os = getContentResolver().openOutputStream(data.getData())) {
                    if (os != null) { os.write(pendingExport.getBytes(StandardCharsets.UTF_8)); Toast.makeText(this, "PITWALL file saved", Toast.LENGTH_SHORT).show(); }
                } catch (Exception e) { Toast.makeText(this, "File could not be saved", Toast.LENGTH_LONG).show(); }
            }
            pendingExport = null;
        }
    }

    @Override public boolean onCreateOptionsMenu(Menu menu) {
        menu.add(0, 1, 0, "PITWALL widget settings");
        menu.add(0, 2, 1, "Refresh F1 widgets");
        menu.add(0, 3, 2, "Remind me before next race");
        return true;
    }
    @Override public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == 1) { driverSettings(); return true; }
        if (item.getItemId() == 2) { WidgetUpdater.refreshAsync(getApplicationContext()); Toast.makeText(this, "Updating widgets…", Toast.LENGTH_SHORT).show(); return true; }
        if (item.getItemId() == 3) { RaceAlertReceiver.scheduleNext(this, true); return true; }
        return super.onOptionsItemSelected(item);
    }
    private void driverSettings() {
        final SharedPreferences prefs = getSharedPreferences("native_widget_prefs", MODE_PRIVATE);
        final EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setText(prefs.getString("driver_id", "norris"));
        input.setHint("Driver ID, e.g. hamilton or norris");
        LinearLayout outer = new LinearLayout(this); outer.setPadding(30, 16, 30, 6); outer.addView(input);
        new AlertDialog.Builder(this).setTitle("Favourite driver for widgets")
            .setMessage("Enter their Jolpica driver ID. Examples: hamilton, leclerc, norris, russell, antonelli.")
            .setView(outer).setPositiveButton("Save", (d, w) -> {
                String driver = input.getText().toString().trim().toLowerCase(java.util.Locale.ROOT);
                if (!driver.matches("[a-z_0-9]{1,40}")) { Toast.makeText(this,"Invalid driver ID",Toast.LENGTH_SHORT).show(); return; }
                prefs.edit().putString("driver_id", driver).apply();
                WidgetUpdater.refreshAsync(getApplicationContext());
            }).setNegativeButton("Cancel",null).show();
    }
    @Override public void onBackPressed() {
        if (browser != null && browser.canGoBack()) browser.goBack();
        else new AlertDialog.Builder(this).setMessage("Close PITWALL?").setPositiveButton("Close",(a,b)->finish()).setNegativeButton("Stay",null).show();
    }
    @Override protected void onSaveInstanceState(Bundle b) { browser.saveState(b); super.onSaveInstanceState(b); }
    @Override protected void onDestroy() { if (browser != null) browser.destroy(); super.onDestroy(); }
}
