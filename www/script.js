// ডার্ক মোড টগল ফাংশন
const darkModeBtn = document.getElementById('dark-mode-toggle');
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  // ডার্ক মোড স্টেট সংরক্ষণ
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
});

// পেজ লোডের সময় প্রয়োজনীয় ডেটা লোড
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  loadSavedPrayerTimes();
  updateDateTime();
  loadSunTimes();
  loadUserName();
  checkFajrAlarm();
});

// ইউজারের নাম লোড করা
function loadUserName() {
  const userName = document.getElementById('user-name');
  userName.textContent = localStorage.getItem('userName') || 'মুজতাহিদ';
}

// নামাজের সময় সেভ করার ফাংশন
document.getElementById('saveTimes').addEventListener('click', () => {
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  prayers.forEach(prayer => {
    const time = document.getElementById(prayer).value;
    localStorage.setItem(prayer, time);
  });

  alert('✅ সময় সফলভাবে সংরক্ষিত হয়েছে!');
});

// নামাজের সময় লোড করার ফাংশন
function loadSavedPrayerTimes() {
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  prayers.forEach(prayer => {
    const savedTime = localStorage.getItem(prayer);
    if (savedTime) {
      document.getElementById(prayer).value = savedTime;
    }
  });
}

// তারিখ, শুভেচ্ছা ও সময় আপডেট
function updateDateTime() {
  const now = new Date();

  // ইংরেজি তারিখ
  document.getElementById('date-time').textContent = now.toLocaleString('bn-BD');

  // আরবি তারিখ হিসাব করা
  const hijriDate = gregorianToHijri(now);
  document.getElementById('arabic-date').textContent = `আরবি তারিখ: ${hijriDate.day} ${hijriDate.month} ${hijriDate.year}`;

  // শুভেচ্ছা বার্তা
  const hour = now.getHours();
  let greeting = "🌅 সুপ্রভাত!";
  if (hour >= 12 && hour < 18) {
    greeting = "🍴 শুভ দুপুর!";
  } else if (hour >= 18 || hour < 5) {
    greeting = "🌙 শুভ রাত্রি!";
  }
  document.getElementById('greeting').textContent = greeting;

  // প্রতি মিনিটে আপডেট হবে
  setTimeout(updateDateTime, 60000);
}

// সূর্যোদয়, দুপুর, সূর্যাস্তের সময় সেট
function loadSunTimes() {
  // কাস্টম সময় দেওয়া হচ্ছে, চাইলে GPS লোকেশন থেকে ডায়নামিক করতেও পারবো!
  const sunrise = "05:15 AM";
  const noon = "12:00 PM";
  const sunset = "06:30 PM";

  document.getElementById('sunrise-time').textContent = sunrise;
  document.getElementById('noon-time').textContent = noon;
  document.getElementById('sunset-time').textContent = sunset;
}

// ফজরের সময় এলার্ম বাজানো
function checkFajrAlarm() {
  const alarmSound = document.getElementById('alarm-sound');
  const fajrTime = localStorage.getItem('fajr');

  if (!fajrTime) return; // যদি ফজর সময় সেট না করা থাকে

  setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5); // "HH:MM"

    if (currentTime === fajrTime) {
      alarmSound.play();
      alert('🕋 ফজরের সময় হয়েছে! নামাজ আদায় করুন।');
    }
  }, 30000); // ৩০ সেকেন্ড পরপর চেক করা হবে
}

// Gregorian to Hijri Date Conversion Function
function gregorianToHijri(date) {
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1; // months are 0-based
  const gregorianDay = date.getDate();

  // হিজরি বছরের হিসাব
  const hijriYear = Math.floor((gregorianYear - 622) * 1.030681);
  const hijriMonth = Math.floor((gregorianMonth - 1) * 1.032856);
  const hijriDay = Math.floor(gregorianDay - 1);
  
  const hijriMonths = [
    "মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জমাদিউল আউয়াল", "জমাদিউস সানি",
    "রজব", "শাবান", "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ্জ"
  ];

  return {
    year: hijriYear,
    month: hijriMonths[hijriMonth],
    day: hijriDay
  };
}
