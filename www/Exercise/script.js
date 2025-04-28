// Routine Data
const routines = {
    Saturday: [
        "Warm-up: ৩ মিনিট জাম্প রোপ",
        "Push-Up – ৩ সেট x যতটা পারো",
        "Shoulder Press (ডাম্বেল) – ৩ সেট x ১২",
        "Lateral Raise – ৩ সেট x ১২",
        "Chest Fly (ডাম্বেল) – ৩ সেট x ১০",
        "Front Raise – ৩ সেট x ১২",
        "৩ মিনিট স্ট্রেচ"
    ],
    Sunday: [
        "Warm-up: ৩ মিনিট হালকা দৌড়",
        "Pull-Up বা Doorway Row – ৩ সেট x যতটা পারো",
        "Bicep Curl (ডাম্বেল) – ৩ সেট x ১২",
        "Bent Over Row – ৩ সেট x ১২",
        "Hammer Curl – ৩ সেট x ১২",
        "৩ মিনিট স্ট্রেচ"
    ],
    Monday: [
        "Cardio Focus: ২০ মিনিট জাম্পিং/দৌড়",
        "Burpees – ৩ সেট x ১৫",
        "Mountain Climbers – ৩ সেট x ৩০ সেকেন্ড",
        "High Knees – ৩ সেট x ১ মিনিট",
        "Jump Rope – ৩ সেট x ২ মিনিট",
        "Cooldown Stretch"
    ],
    Tuesday: [
        "Lower Body: পা এবং গ্লুটস",
        "Squats – ৩ সেট x ১৫",
        "Lunges – ৩ সেট x ১২ প্রতি পা",
        "Deadlifts (ডাম্বেল) – ৩ সেট x ১২",
        "Glute Bridge – ৩ সেট x ১৫",
        "৩ মিনিট স্ট্রেচ"
    ],
    Wednesday: [
        "Core: পেট এবং কোমর",
        "Plank – ৩ সেট x ৩০-৬০ সেকেন্ড",
        "Crunches – ৩ সেট x ২০",
        "Russian Twist – ৩ সেট x ২০",
        "Leg Raise – ৩ সেট x ১৫",
        "৩ মিনিট স্ট্রেচ"
    ],
    Thursday: [
        "Full Body Strength",
        "Push-Up – ৩ সেট x যতটা পারো",
        "Squat to Press – ৩ সেট x ১২",
        "Deadlift to Row – ৩ সেট x ১২",
        "Burpees – ৩ সেট x ১০",
        "৩ মিনিট স্ট্রেচ"
    ],
    Friday: [
        "Recovery Day: Light Yoga বা Stretching",
        "Full Body Stretch – ১০ মিনিট",
        "Light Walk – ১৫ মিনিট",
        "Breathing Exercise – ৫ মিনিট",
        "Foam Rolling – যদি থাকে"
    ]
};

// Clock and Date
function updateClock() {
    const now = new Date();
    const clock = document.getElementById('clock');
    const date = document.getElementById('date');
    clock.innerText = now.toLocaleTimeString('bn-BD');
    date.innerText = now.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
setInterval(updateClock, 1000);
updateClock(); // প্রথমে কল করা যেন লোডের সাথে দেখা যায়

// Show Routine
function showRoutine() {
    const selectedDay = document.getElementById('day').value;
    const routineList = document.getElementById('routine-list');
    routineList.innerHTML = '';

    if (routines[selectedDay]) {
        routines[selectedDay].forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = item;
            routineList.appendChild(li);
        });
    }
    loadExtraSubjects(); // রুটিন পরিবর্তন হলে extra subjects আবার দেখানো
}

// Dark Mode Toggle
const toggleButton = document.getElementById('toggle-darkmode');
toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Add Extra Subject
function addExtraSubject() {
    const input = document.getElementById('extra-subject');
    const subject = input.value.trim();
    if (subject) {
        const subjects = JSON.parse(localStorage.getItem('extraSubjects')) || [];
        subjects.push(subject);
        localStorage.setItem('extraSubjects', JSON.stringify(subjects));
        input.value = '';
        loadExtraSubjects();
    }
}

// Load Extra Subjects
function loadExtraSubjects() {
    const subjects = JSON.parse(localStorage.getItem('extraSubjects')) || [];
    const list = document.getElementById('extraSubjectsList');
    list.innerHTML = '';

    subjects.forEach((subject, index) => {
        const li = document.createElement('li');
        li.innerText = subject;

        const removeBtn = document.createElement('button');
        removeBtn.innerText = 'Remove';
        removeBtn.className = 'remove-btn';
        removeBtn.onclick = function () {
            removeExtraSubject(index);
        };

        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

// Remove Extra Subject
function removeExtraSubject(index) {
    const subjects = JSON.parse(localStorage.getItem('extraSubjects')) || [];
    subjects.splice(index, 1);
    localStorage.setItem('extraSubjects', JSON.stringify(subjects));
    loadExtraSubjects();
}

// প্রথমে পেজ লোড হলে রুটিন আর extra subjects দেখাও
document.addEventListener('DOMContentLoaded', () => {
    showRoutine();
    loadExtraSubjects();
});

window.onload = function() {
    // আজকের দিন বের করো
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // সিলেক্ট এলিমেন্ট খুঁজে বের করো
    const daySelect = document.getElementById('day');
    
    // আজকের দিন সিলেক্ট করো
    daySelect.value = today;

    // সঙ্গে সঙ্গে রুটিন দেখাও
    showRoutine();
};
