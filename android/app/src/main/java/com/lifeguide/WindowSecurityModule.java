package com.lifeguide;

import android.app.Activity;
import android.view.WindowManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class WindowSecurityModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "WindowSecurityModule";

    public WindowSecurityModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void setSecureWindow(boolean secure) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            if (secure) {
                activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
            } else {
                activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            }
        }
    }
}
