// ✅ Default Tuition Schedule
const tuitionSchedule = {
    "Sunday": [
        { time: "13:30", subject: "Chemistry" },
        { time: "16:00", subject: "Biology" },
        { time: "17:00", subject: "Physics" },
        { time: "18:30", subject: "Higher Math" }
    ],
    "Tuesday": [
        { time: "13:30", subject: "Chemistry" },
        { time: "16:00", subject: "Biology" },
        { time: "17:00", subject: "Physics" },
        { time: "18:30", subject: "Higher Math" }
    ],
    "Thursday": [
        { time: "13:30", subject: "Chemistry" },
        { time: "16:00", subject: "Biology" },
        { time: "17:00", subject: "Physics" },
        { time: "18:30", subject: "Higher Math" }
    ],
    "Saturday": [
        { time: "07:00", subject: "Bangla" },
        { time: "08:00", subject: "English" }
    ],
    "Monday": [
        { time: "07:00", subject: "Bangla" },
        { time: "08:00", subject: "English" }
    ],
    "Wednesday": [
        { time: "07:00", subject: "Bangla" }
    ],
    "Friday": [
        { time: "08:00", subject: "English" }
    ]
};

// ✅ Local Storage Functions
function saveAlarmsToLocalStorage(alarms) {
    localStorage.setItem('tuitionSchedule', JSON.stringify(alarms));
}

function loadAlarmsFromLocalStorage() {
    const stored = localStorage.getItem('tuitionSchedule');
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(tuitionSchedule));
}

// ✅ Delete Button Toggle
function toggleDeleteButton() {
    const deleteBtns = document.querySelectorAll('.delete-btn');
    const toggleBtn = document.getElementById('toggle-delete-btn');
    if (!toggleBtn) return;

    let isHidden = localStorage.getItem('deleteButtonState') === 'true';
    isHidden = !isHidden;

    deleteBtns.forEach(btn => {
        btn.style.display = isHidden ? 'none' : 'inline';
    });

    toggleBtn.textContent = isHidden ? '❌ মুছুন দেখাও' : '❌ মুছুন লুকাও';
    localStorage.setItem('deleteButtonState', JSON.stringify(isHidden));
}

// ✅ Alarm Display Function
function displayTodayAlarms() {
    const now = new Date();
    const today = now.toLocaleString('en-US', { weekday: 'long' });
    const alarmList = document.getElementById('alarm-list');
    alarmList.innerHTML = '';

    const storedSchedule = loadAlarmsFromLocalStorage();
    if (!storedSchedule[today]) return;

    storedSchedule[today].forEach((schedule, index) => {
        const [hour, minute] = schedule.time.split(":").map(Number);
        const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

        const li = document.createElement('li');
        li.textContent = `${schedule.subject} at ${schedule.time}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "❌ মুছুন";
        deleteBtn.classList.add('delete-btn');
        deleteBtn.onclick = () => deleteAlarm(today, index);
        li.appendChild(deleteBtn);

        li.classList.add(now > alarmTime ? 'past' : 'upcoming');
        alarmList.appendChild(li);
    });

    const isHidden = localStorage.getItem('deleteButtonState') === 'true';
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.style.display = isHidden ? 'none' : 'inline';
    });
}

// ✅ Add Alarm
document.getElementById('add-alarm-btn').addEventListener('click', () => {
    const time = document.getElementById('new-alarm-time').value;
    const subject = document.getElementById('new-alarm-subject').value;
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });

    if (time && subject) {
        const schedule = loadAlarmsFromLocalStorage();
        if (!schedule[today]) schedule[today] = [];

        schedule[today].push({ time, subject });
        saveAlarmsToLocalStorage(schedule);
        displayTodayAlarms();

        // ✅ New: Add Local Notification
        const now = new Date();
        const [hour, minute] = time.split(':').map(Number);
        const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

        // যদি সময় অতীত হয়, আগামী দিনের জন্য সেট করো
        if (alarmTime <= now) {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }

        // Local Notification schedule
        cordova.plugins.notification.local.schedule({
            id: Math.floor(Math.random() * 100000), // ইউনিক ID
            title: '📚 এলার্ম এসেছে!',
            text: subject,
            trigger: { at: alarmTime },
            foreground: true
        });

        alert('✅ নতুন এলার্ম যোগ হয়েছে!');
    } else {
        alert('দয়া করে সময় ও বিষয় পূরণ করুন।');
    }
});


// ✅ Delete Alarm
function deleteAlarm(day, index) {
    const schedule = loadAlarmsFromLocalStorage();
    schedule[day].splice(index, 1);
    saveAlarmsToLocalStorage(schedule);
    displayTodayAlarms();
    alert('এলার্ম মুছে ফেলা হয়েছে!');
}

// ✅ Clock
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('current-time').innerText = `${h}:${m}:${s}`;
}

// ✅ Alarm 20 Min Before (Improved)
const playedAlarms = new Set();

function checkAndPlayAlarm() {
    const now = new Date();
    const today = now.toLocaleString('en-US', { weekday: 'long' });
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const todayAlarms = loadAlarmsFromLocalStorage()[today] || [];
    todayAlarms.forEach(alarm => {
        const [alarmH, alarmM] = alarm.time.split(':').map(Number);
        const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), alarmH, alarmM);
        const before20 = new Date(alarmTime.getTime() - 20 * 60 * 1000);
        const beforeTime = `${before20.getHours().toString().padStart(2, '0')}:${before20.getMinutes().toString().padStart(2, '0')}`;

        const alarmKey = `${today}-${beforeTime}-${alarm.subject}`;
        if (currentTime === beforeTime && !playedAlarms.has(alarmKey)) {
            const audio = document.getElementById('alarm-audio');
            audio.play()
                .then(() => console.log("🔊 অডিও চলছে..."))
                .catch(e => console.log("⚠️ অডিও চালু হয়নি:", e));

            document.getElementById('stop-alarm-btn').style.display = 'inline';
            playedAlarms.add(alarmKey);
        }
    });
}

// ✅ Stop Alarm
document.getElementById('stop-alarm-btn').addEventListener('click', () => {
    const audio = document.getElementById('alarm-audio');
    audio.pause();
    audio.currentTime = 0;
    document.getElementById('stop-alarm-btn').style.display = 'none';
});

// ✅ Dark Mode Toggle
document.getElementById('dark-mode-toggle').addEventListener('click', function () {
    document.body.classList.toggle('dark');
    this.classList.toggle('active');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// ✅ Page Load Initialization
window.addEventListener('DOMContentLoaded', () => {
    // Load theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('dark-mode-toggle').classList.add('active');
    }

    // Display alarms & clock
    displayTodayAlarms();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(checkAndPlayAlarm, 1000);
    setInterval(displayTodayAlarms, 60000);

    // Set initial state of delete button visibility
    const deleteBtnState = localStorage.getItem('deleteButtonState');
    if (deleteBtnState === 'true') {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.style.display = 'none';
        });
        document.getElementById('toggle-delete-btn').textContent = '❌ মুছুন দেখাও';
    } else {
        document.getElementById('toggle-delete-btn').textContent = '❌ মুছুন লুকাও';
    }
});

// ✅ Delete Toggle Event
document.getElementById('toggle-delete-btn').addEventListener('click', toggleDeleteButton);

// ✅ Background Mode চালু করা
cordova.plugins.backgroundMode.enable();

// অ্যাপ ব্যাকগ্রাউন্ডে চলে গেলে নোটিফিকেশন পাঠানো
cordova.plugins.backgroundMode.on('activate', function () {
    console.log('অ্যাপ ব্যাকগ্রাউন্ডে চলে গেছে');
    // এখানে আপনি যেকোনো কাজ করতে পারেন, যেমন রুটিন নোটিফিকেশন পাঠানো
});
// ✅ এলার্ম যোগ করার সময় নোটিফিকেশন শিডিউল করা
cordova.plugins.notification.local.schedule({
    id: Math.floor(Math.random() * 100000), // ইউনিক ID
    title: '📚 এলার্ম এসেছে!',
    text: subject,
    trigger: { at: alarmTime },
    foreground: true  // ব্যাকগ্রাউন্ডে এলার্ম ট্রিগার করা হবে
});
// ✅ ব্যাকগ্রাউন্ডে এলার্ম চেক করা
setInterval(checkAndPlayAlarm, 1000);
