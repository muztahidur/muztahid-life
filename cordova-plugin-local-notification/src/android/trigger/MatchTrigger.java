/*
 * Apache 2.0 License
 *
 * Copyright (c) Sebastian Katzer 2017
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

package de.appplant.cordova.plugin.localnotification.trigger;

import android.util.Log;
import org.json.JSONObject;
import java.util.Calendar;
import java.util.Date;

import de.appplant.cordova.plugin.localnotification.Options;

public class MatchTrigger extends DateTrigger {

    private JSONObject triggerEvery;

    /**
     * E.g. trigger every: { minute: 10, hour: 9, day: 27, month: 10 }
     */
    public MatchTrigger(Options options) {
        super(options);
        this.triggerEvery = options.getTriggerEveryAsObject();
    }

    public boolean isLastOccurrence() {
        // Check if trigger.count is exceeded if it is set
        return options.getTriggerCount() > 0 && occurrence >= options.getTriggerCount();
    }

    /**
     * Calculates the next trigger.
     * @param baseCalendar The base calendar from where to calculate the next trigger.
     */
    public Date calculateNextTrigger(Calendar baseCalendar) {
        Log.d(TAG, "Calculating next trigger" +
            ", baseCalendar=" + baseCalendar.getTime() +
            ", occurrence=" + occurrence +
            ", trigger.count=" + options.getTriggerCount());
        
        // All occurrences are done
        if (isLastOccurrence()) return null;

        Calendar nextCalendar = (Calendar) baseCalendar.clone();

        // Set calendar to trigger.every values like minute: 20, hour: 9, etc.
        // Returns the next higher Calendar field for calculating the next trigger
        // If 0 is returned the options are empty or wrong
        int nextTriggerCalendarFieldToIncrease = setToEveryValues(nextCalendar);

        // Nothing should be increased, options are empty or wrong
        if (nextTriggerCalendarFieldToIncrease == 0) return null;

        // If the next trigger is in the past or equal, increase the calendar
        // The trigger could be set by trigger.every to the past.
        // For e.g., if the current time is 9:30 and every: {minute: 10} is set, the trigger
        // would be set to 9:10. To get a next trigger, the hour have to be increased by 1 to 10:10.
        if (nextCalendar.compareTo(baseCalendar) <= 0) {
            nextCalendar.add(nextTriggerCalendarFieldToIncrease, 1);
            // Correct trigger after incrementing it
            // Example: If weekday was set to monday and a year was added,
            // the weekday could be changed to another day, set to monday again
            setToEveryValues(nextCalendar);
        }

        // Check if the trigger is within the before option
        if (!isWithinTriggerbefore(nextCalendar)) return null;

        return nextCalendar.getTime();
    }

    /**
     * Set trigger.every values like { month: 10, day: 27, ...} in the given calendar.
     * @param calendar
     * @return The next higher {@link Calendar} field that has to be increase from the highest trigger.every option
     * For e.g. returns {@link Calendar.HOUR} when maximum minute is set,
     * or {@link Calendar.DAY_OF_YEAR} when maximum hour is set.
     * Returns 0 if no or wrong trigger.every values are set.
     */
    private int setToEveryValues(Calendar calendar) {
        int nextTriggerCalendarFieldToIncrease = 0;

        // Set second to 0
        calendar.set(Calendar.SECOND, 0);

        // Set minute from options in next calendar
        if (triggerEvery.has("minute")) {
            calendar.set(Calendar.MINUTE, triggerEvery.optInt("minute"));
            // One hour has to be added for the next trigger
            nextTriggerCalendarFieldToIncrease = Calendar.HOUR;
        }

        // Set hour from options in next calendar
        if (triggerEvery.has("hour")) {
            calendar.set(Calendar.HOUR_OF_DAY, triggerEvery.optInt("hour"));
            resetTimeIfNotSetByTrigger(calendar);
            // One day has to be added for the next trigger
            nextTriggerCalendarFieldToIncrease = Calendar.DAY_OF_YEAR;
        }

        // Set day from options in next calendar
        if (triggerEvery.has("day")) {
            calendar.set(Calendar.DAY_OF_MONTH, triggerEvery.optInt("day"));
            resetTimeIfNotSetByTrigger(calendar);
            // One month has to be added for the next trigger
            nextTriggerCalendarFieldToIncrease = Calendar.MONTH;
        }
 
        // Set weekday (day of week) from options in next calendar (1 = Monday, 7 = Sunday)
        if (triggerEvery.has("weekday")) {
            // Calendar.MONDAY is 2, so we have to add 1 to the weekday
            calendar.set(Calendar.DAY_OF_WEEK, 1 + triggerEvery.optInt("weekday"));

            resetTimeIfNotSetByTrigger(calendar);

            // One week has to be added for the next trigger
            nextTriggerCalendarFieldToIncrease = Calendar.WEEK_OF_YEAR;
        }
 
        // Set weekOfMonth from options in next calendar
        if (triggerEvery.has("weekOfMonth")) {
 
            int weekOfMonth = triggerEvery.optInt("weekOfMonth");
            calendar.set(Calendar.WEEK_OF_MONTH, weekOfMonth);
 
            // Reset hour/minute
            resetTimeIfNotSetByTrigger(calendar);
            resetWeekdayIfNotSetByTrigger(calendar);

            // If the week of month is the first week, set day of month to 1
            if (weekOfMonth == 1) {
                calendar.set(Calendar.DAY_OF_MONTH, 1);
                // Correct weekday if it is set, but prevent jumping to the last month
                setWeekdayIfInFuture(calendar);
            }

            // One month has to be added for the next trigger
            nextTriggerCalendarFieldToIncrease = Calendar.MONTH;
        }
 
        // Set week of year from options in next calendar
        if (triggerEvery.has("week")) {
            int weekOfYear = triggerEvery.optInt("week");
            calendar.set(Calendar.WEEK_OF_YEAR, weekOfYear);

            resetTimeIfNotSetByTrigger(calendar);
            resetWeekdayIfNotSetByTrigger(calendar);
            
            // If the week of year is the first week, set day of year to 1
            if (weekOfYear == 1) {
                calendar.set(Calendar.DAY_OF_YEAR, 1);
                // Correct weekday if it is set, but prevent jumping to the last year
                setWeekdayIfInFuture(calendar);
            }

            nextTriggerCalendarFieldToIncrease = Calendar.YEAR;
        }
 
        // Set month from options in next calendar
        if (triggerEvery.has("month")) {
            // The first month is 0 for Calendar
            calendar.set(Calendar.MONTH, triggerEvery.optInt("month") - 1);

            resetTimeIfNotSetByTrigger(calendar);
            resetDayIfNotSetByTrigger(calendar);

            // One year has to be added for the next trigger
            nextTriggerCalendarFieldToIncrease = Calendar.YEAR;
        }

        return nextTriggerCalendarFieldToIncrease;
    }

    /**
     * Set minute/hour to 0 if not set by trigger
     **/
    private void resetTimeIfNotSetByTrigger(Calendar calendar) {
        // Reset minute if not set
        if (!triggerEvery.has("minute")) calendar.set(Calendar.MINUTE, 0);
        // Reset hour if not set
        if (!triggerEvery.has("hour")) calendar.set(Calendar.HOUR_OF_DAY, 0);
    }

    /**
     * Set day to 1 if not set by trigger
     * @param calendar
     */
    private void resetDayIfNotSetByTrigger(Calendar calendar) {
        if (triggerEvery.has("day") || triggerEvery.has("weekday")) return;
        calendar.set(Calendar.DAY_OF_MONTH, 1);
    }

    private void resetWeekdayIfNotSetByTrigger(Calendar calendar) {
        if (triggerEvery.has("weekday")) return;
        calendar.set(Calendar.DAY_OF_WEEK, calendar.getFirstDayOfWeek());
    }

    /**
     * Sets a configured weekday only if it is in the future. This should prevent the calendar
     * jump to the last month or year, if the date was set to the first of a month or year.
     */
    private void setWeekdayIfInFuture(Calendar calendar) {
        // Not set by options
        if (!triggerEvery.has("weekday")) return;

        // Only set if in future. For weekday 1 is Monday and for Calendar it is 2,
        // so we have to consider it
        if (calendar.get(Calendar.DAY_OF_WEEK) < 1 + triggerEvery.optInt("weekday")) {
            calendar.set(Calendar.DAY_OF_WEEK, 1 + triggerEvery.optInt("weekday"));
        }
    }
}