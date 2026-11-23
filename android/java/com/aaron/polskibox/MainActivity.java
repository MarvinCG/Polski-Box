package com.aaron.polskibox;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;
import java.util.Locale;

/** Polski Box: a WebView shell around the offline learning app, plus a small native bridge. */
public class MainActivity extends Activity {
    private WebView web;
    private TextToSpeech tts;
    private volatile String ttsState = "init"; // init | ready | nopl | fail
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("polskibox", MODE_PRIVATE);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#F6F3EA"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setSupportZoom(false);
        s.setTextZoom(100);
        web.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new Bridge(), "Native");
        setContentView(web);

        initTts();
        web.loadUrl("file:///android_asset/index.html");
    }

    private void initTts() {
        try {
            tts = new TextToSpeech(getApplicationContext(), new TextToSpeech.OnInitListener() {
                @Override
                public void onInit(int status) {
                    if (status != TextToSpeech.SUCCESS) {
                        ttsState = "fail";
                        return;
                    }
                    int r = tts.setLanguage(new Locale("pl", "PL"));
                    boolean ok = r == TextToSpeech.LANG_AVAILABLE
                            || r == TextToSpeech.LANG_COUNTRY_AVAILABLE
                            || r == TextToSpeech.LANG_COUNTRY_VAR_AVAILABLE;
                    ttsState = ok ? "ready" : "nopl";
                    tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                        @Override public void onStart(String id) { }
                        @Override public void onDone(String id) { notifyDone(id); }
                        @Override public void onError(String id) { notifyDone(id); }
                    });
                }
            });
        } catch (Throwable t) {
            ttsState = "fail";
        }
    }

    private void notifyDone(final String id) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (web != null) {
                    web.evaluateJavascript("window.__ttsDone&&window.__ttsDone('" + id.replaceAll("[^0-9]", "") + "')", null);
                }
            }
        });
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.__back&&window.__back())?'1':'0'", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String v) {
                if (v == null || !v.contains("1")) {
                    finish();
                }
            }
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (tts != null) tts.stop();
        web.evaluateJavascript("window.__pause&&window.__pause()", null);
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        if (web != null) {
            web.removeJavascriptInterface("Native");
            web.destroy();
        }
        super.onDestroy();
    }

    /** Methods callable from the page as window.Native.* */
    public class Bridge {
        @JavascriptInterface
        public boolean ttsReady() { return "ready".equals(ttsState); }

        @JavascriptInterface
        public String ttsInfo() { return ttsState; }

        @JavascriptInterface
        public void speak(String text, double rate, int id) {
            if (tts == null || !"ready".equals(ttsState)) { notifyDone(String.valueOf(id)); return; }
            tts.setSpeechRate((float) rate);
            int r = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, String.valueOf(id));
            if (r != TextToSpeech.SUCCESS) notifyDone(String.valueOf(id));
        }

        @JavascriptInterface
        public void stop() { if (tts != null) tts.stop(); }

        @JavascriptInterface
        public void save(String key, String value) { prefs.edit().putString(key, value).apply(); }

        @JavascriptInterface
        public String load(String key) { return prefs.getString(key, ""); }

        /** HTTPS for sync (GitHub API). Result goes back to window.__httpDone(id, status, body). Only https is allowed. */
        @JavascriptInterface
        public void http(final String method, final String url, final String headersJson, final String body, final int id) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    int status = 0; String out = "";
                    HttpURLConnection c = null;
                    try {
                        if (!url.startsWith("https://")) throw new Exception("https only");
                        c = (HttpURLConnection) new URL(url).openConnection();
                        c.setRequestMethod(method);
                        c.setConnectTimeout(15000); c.setReadTimeout(30000);
                        c.setUseCaches(false);
                        JSONObject h = new JSONObject(headersJson == null || headersJson.isEmpty() ? "{}" : headersJson);
                        Iterator<String> it = h.keys();
                        while (it.hasNext()) { String k = it.next(); c.setRequestProperty(k, h.getString(k)); }
                        c.setRequestProperty("User-Agent", "PolskiBox-Android");
                        if (body != null && !body.isEmpty()) {
                            c.setDoOutput(true);
                            OutputStream os = c.getOutputStream(); os.write(body.getBytes("UTF-8")); os.close();
                        }
                        status = c.getResponseCode();
                        InputStream is = status >= 400 ? c.getErrorStream() : c.getInputStream();
                        if (is != null) {
                            ByteArrayOutputStream bo = new ByteArrayOutputStream(); byte[] buf = new byte[8192]; int n;
                            while ((n = is.read(buf)) > 0) bo.write(buf, 0, n);
                            is.close(); out = bo.toString("UTF-8");
                        }
                    } catch (Exception e) {
                        status = 0; out = String.valueOf(e.getMessage());
                    } finally {
                        if (c != null) c.disconnect();
                    }
                    final String js = "window.__httpDone&&window.__httpDone(" + id + "," + status + "," + JSONObject.quote(out) + ")";
                    runOnUiThread(new Runnable() { @Override public void run() { if (web != null) web.evaluateJavascript(js, null); } });
                }
            }).start();
        }

        @JavascriptInterface
        public void share(final String text) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Intent i = new Intent(Intent.ACTION_SEND);
                    i.setType("text/plain");
                    i.putExtra(Intent.EXTRA_TEXT, text);
                    startActivity(Intent.createChooser(i, "Polski Box"));
                }
            });
        }
    }
}
