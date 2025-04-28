/*
 * Apache 2.0 License
 *
 * Copyright (c) Sebastian Katzer 2017
 * Copyright (c) Manuel Beck 2024
 *
 * This file contains Original Code and/or Modifications of Original Code
 * as defined in and that are subject to the Apache License
 * Version 2.0 (the 'License'). You may not use this file except in
 * compliance with the License. Please obtain a copy of the License at
 * http://opensource.org/licenses/Apache-2.0/ and read it before using this
 * file.
 *
 * The Original Code and all software distributed under the License are
 * distributed on an 'AS IS' basis, WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, AND APPLE HEREBY DISCLAIMS ALL SUCH WARRANTIES,
 * INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT OR NON-INFRINGEMENT.
 * Please see the License for the specific language governing rights and
 * limitations under the License.
 */

package de.appplant.cordova.plugin.localnotification;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import androidx.core.app.RemoteInput;

import org.json.JSONException;
import org.json.JSONObject;

import de.appplant.cordova.plugin.localnotification.LocalNotification;
import de.appplant.cordova.plugin.localnotification.Manager;
import de.appplant.cordova.plugin.localnotification.Notification;
import de.appplant.cordova.plugin.localnotification.Options;
import de.appplant.cordova.plugin.localnotification.action.Action;

/**
 * The receiver activity is triggered when a notification is clicked by a user.
 * The activity calls the background callback and brings the launch intent
 * up to foreground.
 */
public class ClickHandlerActivity extends Activity {

    /**
     * Activity started when local notification was clicked by the user.
     * @param notification Wrapper around the local notification.
     * @param bundle The bundled extras.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Notification notification = Notification.getFromSharedPreferences(
            getApplicationContext(), getIntent().getExtras().getInt(Notification.EXTRA_ID));

        finish();
        
        if (notification == null) return;

        // Gets input from action and sets it in data
        String action = getIntent().getExtras().getString(Action.EXTRA_ID, Action.CLICK_ACTION_ID);
        JSONObject data = new JSONObject();
        setTextInput(action, data);
        
        if (getIntent().getBooleanExtra(Options.EXTRA_LAUNCH, true)) LocalNotification.launchApp(getApplicationContext());

        LocalNotification.fireEvent(action, notification, data);

        if (notification.getOptions().isAndroidOngoing()) return;

        if (notification.getDateTrigger().isLastOccurrence()) {
            notification.cancel();
        } else {
            notification.clear();
        }
    }

    /**
     * Set the text if any remote input is given.
     * @param action The action where to look for.
     * @param data The object to extend.
     */
    private void setTextInput(String action, JSONObject data) {
        Bundle input = RemoteInput.getResultsFromIntent(getIntent());
        if (input == null) return;

        try {
            data.put("text", input.getCharSequence(action));
        } catch (JSONException jsonException) {
            jsonException.printStackTrace();
        }
    }
}
