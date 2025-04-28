const routineData = {
  "শনিবার": {
    morning: ["Bangla Tution", "English tution", "Break", "Higher Math"],
    midday: ["Physics", "Bangla", "ICT"],
    night: ["English", "Chemistry", "Biology"]
  },
  "রবিবার": {
    morning: ["Biology", "Physics", "Break", "Higher Math"],
    midday: ["Chemistry Tution", "Biology Tution", "Physics Tution"],
    night: ["Higher Math Tution", "Bangla", "Spoken English Class", "ICT"]
  },
  "সোমবার": {
    morning: ["Bangla Tution", "English tution", "Physics", "Break"],
    midday: ["Chemistry", "ICT"],
    night: ["English", "Biology"]
  },
  "মঙ্গলবার": {
    morning: ["Biology", "Bangla", "Break", "Higher Math"],
    midday: ["Chemistry Tution", "Biology Tution", "Physics Tution"],
    night: ["Higher Math Tution", "English", "Physics"]
  },
  "বুধবার": {
    morning: ["Bangla Tution", "English Tution (যদি থাকে)", "Break", "Higher Math"],
    midday: ["Chemistry", "Physics"],
    night: ["English", "ICT", "Biology"]
  },
  "বৃহস্পতিবার": {
    morning: ["Biology", "Chemistry", "Break", "Bangla"],
    midday: ["Chemistry Tution", "Biology Tution", "Physics Tution"],
    night: ["Higher Math Tution", "English", "Physics"]
  },
  "শুক্রবার": {
    morning: ["English tution", "Higher Math", "Break", "Chemistry", "গত সপ্তাহের পড়ার রিভিশন"],
    midday: ["Physics", "Ready for Friday prayers", "ICT", "গত সপ্তাহের পড়ার রিভিশন"],
    night: ["Bangla", "English", "Biology", "গত সপ্তাহের পড়ার রিভিশন"]
  }
};

const dayNames = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const timePeriods = [
  { label: "🌅 সকাল", start: 4, end: 11, value: "morning" },
  { label: "🍴 মধ্যাহ্ন", start: 11, end: 17, value: "midday" },
  { label: "🌙 রাত", start: 17, end: 24, value: "night" },
  { label: "🌙 রাত", start: 0, end: 4, value: "night" }
];

// 📌 রুটিন দেখানোর ফাংশন
function showRoutine(time) {
  const day = document.getElementById("day-select").value;
  const output = document.getElementById("routine-output");
  const timeLabels = { morning: "সকাল", midday: "মধ্যাহ্ন", night: "রাত" };

  if (day && routineData[day]) {
    const routineList = routineData[day][time];
    output.innerHTML = `<h3>📅 ${day} (${timeLabels[time] || ""})</h3><ul>` +
      routineList.map(subject => `<li>📘 ${subject}</li>`).join("") +
      `</ul>`;

    localStorage.setItem("selectedRoutine", JSON.stringify({ day, time }));
  } else {
    output.innerHTML = "<p>দয়া করে একটি দিন নির্বাচন করুন।</p>";
  }
}

// 📌 অতিরিক্ত বিষয় যুক্ত করার ফাংশন
function addExtraSubject() {
  const input = document.getElementById("extra-subject");
  const display = document.getElementById("extra-subject-display");
  const subject = input.value.trim();

  if (subject !== "") {
    const item = document.createElement("p");
    item.textContent = `📦 ${subject}`;

    const removeButton = document.createElement("button");
    removeButton.textContent = "❌ মুছুন";
    removeButton.onclick = function () {
      removeExtraSubject(subject, item);
    };

    item.appendChild(removeButton);
    display.appendChild(item);

    let extraSubjects = JSON.parse(localStorage.getItem("extraSubjects")) || [];
    extraSubjects.push(subject);
    localStorage.setItem("extraSubjects", JSON.stringify(extraSubjects));

    input.value = "";
  }
}

// 📌 অতিরিক্ত বিষয় মুছে ফেলার ফাংশন
function removeExtraSubject(subject, item) {
  let extraSubjects = JSON.parse(localStorage.getItem("extraSubjects")) || [];
  extraSubjects = extraSubjects.filter(s => s !== subject);
  localStorage.setItem("extraSubjects", JSON.stringify(extraSubjects));
  item.remove();
}

// ✅ শুধুমাত্র একটি বার `loadSavedExtraSubjects` সংজ্ঞায়িত
function loadSavedExtraSubjects() {
  const extraSubjects = JSON.parse(localStorage.getItem("extraSubjects")) || [];
  const display = document.getElementById("extra-subject-display");

  extraSubjects.forEach(subject => {
    const item = document.createElement("p");
    item.textContent = `📦 ${subject}`;

    const removeButton = document.createElement("button");
    removeButton.textContent = "❌ মুছুন";
    removeButton.onclick = function () {
      removeExtraSubject(subject, item);
    };

    item.appendChild(removeButton);
    display.appendChild(item);
  });
}

function displayExtraSubjects() {
  const list = document.getElementById("extraSubjectsList");
  list.innerHTML = "";

  let extraSubjects = JSON.parse(localStorage.getItem("extraSubjects")) || [];

  extraSubjects.forEach((subject, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${subject} <button class="remove-btn" data-index="${index}">❌ মুছুন</button>`;
    list.appendChild(li);
  });

  const removeButtons = document.querySelectorAll(".remove-btn");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const indexToRemove = parseInt(this.getAttribute("data-index"));
      extraSubjects.splice(indexToRemove, 1);
      localStorage.setItem("extraSubjects", JSON.stringify(extraSubjects));
      displayExtraSubjects();
    });
  });
}

// 📌 পূর্বে সেভকৃত রুটিন লোড করা
function loadSavedRoutine() {
  const savedRoutine = JSON.parse(localStorage.getItem("selectedRoutine"));
  if (savedRoutine) {
    document.getElementById("day-select").value = savedRoutine.day;
    showRoutine(savedRoutine.time);
  }
}

// 📌 তারিখ, দিন, সময় ও রুটিন দেখানো
function showDateDayAndRoutine() {
  const now = new Date();
  const dateDiv = document.getElementById("date-day-time");

  const dayIndex = now.getDay();
  const hour = now.getHours();

  const dayName = dayNames[dayIndex];
  const date = now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

  let currentTimePeriod = timePeriods.find(tp => hour >= tp.start && hour < tp.end);
  const timeLabel = currentTimePeriod.label;
  const timeValue = currentTimePeriod.value;

  dateDiv.innerHTML = `📅 আজ: ${date} | ${dayName} | ${timeLabel}`;

  document.getElementById("day-select").value = dayName;
  showRoutine(timeValue);
}

// 📌 পেজ লোড হলে সব কিছু চালু করো
document.addEventListener('DOMContentLoaded', function () {
  showDateDayAndRoutine();
  loadSavedRoutine();
  loadSavedExtraSubjects();

  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (document.body.classList.contains('dark')) {
    darkModeToggle.textContent = "🌞";
  } else {
    darkModeToggle.textContent = "🌙";
  }

  darkModeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark');
    darkModeToggle.textContent = document.body.classList.contains('dark') ? "🌞" : "🌙";
  });
});

let timer;
let isRunning = false;
let hours = 0;
let minutes = 0;
let seconds = 0;
let microseconds = 0;  // মাইক্রোসেকেন্ড

// টাইমার ডিভ এলিমেন্ট
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start-timer');
const pauseButton = document.getElementById('pause-timer');
const resetButton = document.getElementById('reset-timer');

// পেজ লোড হলে সেভকৃত টাইমার লোড করা
document.addEventListener('DOMContentLoaded', function () {
  const savedTime = JSON.parse(localStorage.getItem('timer'));
  if (savedTime) {
    hours = savedTime.hours;
    minutes = savedTime.minutes;
    seconds = savedTime.seconds;
    microseconds = savedTime.microseconds;
    updateTimerDisplay();
  }
});

// টাইমার আপডেট ফাংশন
function updateTimerDisplay() {
  const hoursStr = hours > 0 ? (hours < 10 ? '0' + hours : hours) : "00"; // ঘণ্টা ০ থাকলে কিছু দেখাবে না
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  const secondsStr = seconds < 10 ? '0' + seconds : seconds;
  const microsecondsStr = microseconds < 10 ? '0' + microseconds : microseconds;

  // যদি ঘণ্টা ০ না থাকে, তবে ঘণ্টা প্রদর্শন করা হবে
  timerDisplay.textContent = `⏰ টাইমার: ${hoursStr ? hoursStr + ':' : ''}${minutesStr}:${secondsStr}.${microsecondsStr}`;
  saveTimerToLocalStorage();
}


// টাইমার চালু করা
startButton.addEventListener('click', function () {
  if (isRunning) return;

  isRunning = true;
  startButton.textContent = "রানিং...";

  timer = setInterval(function () {
    microseconds++;
    if (microseconds === 100) {
      microseconds = 0;
      seconds++;
    }
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    if (minutes === 60) {
      minutes = 0;
      hours++;
    }
    updateTimerDisplay();
  }, 10);  // প্রতি 10 মিলিসেকেন্ডে আপডেট হবে
});

// টাইমার বিরতি দেওয়া
pauseButton.addEventListener('click', function () {
  clearInterval(timer);
  isRunning = false;
  startButton.textContent = "শুরু করুন";
});

// টাইমার রিসেট করা
resetButton.addEventListener('click', function () {
  clearInterval(timer);
  isRunning = false;
  hours = 0;
  minutes = 0;
  seconds = 0;
  microseconds = 0;
  updateTimerDisplay();
  startButton.textContent = "শুরু করুন";
});

// টাইমার সেভ করা localStorage-এ
function saveTimerToLocalStorage() {
  const timerData = { hours, minutes, seconds, microseconds };
  localStorage.setItem('timer', JSON.stringify(timerData));
}
