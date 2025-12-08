// Theme toggle functionality
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('themeIcon');
  
  body.classList.toggle('light-mode');
  
  if (body.classList.contains('light-mode')) {
    themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
}

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const themeIcon = document.getElementById('themeIcon');
  
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeIcon.textContent = '🌙';
  }
});
// Clock functionality
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const displayHours = String(hours).padStart(2, "0");

  document.getElementById("flipHours").textContent = displayHours;
  document.getElementById("flipMinutes").textContent = minutes;
  document.getElementById("flipSeconds").textContent = seconds;
}

setInterval(updateClock, 1000);
updateClock();

// Navigation
function showTimer() {
  document.getElementById("landingPage").style.display = "none";
  document.getElementById("timerContainer").style.display = "block";
  document.getElementById("backButton").style.display = "block";
}

function showStopwatch() {
  document.getElementById("landingPage").style.display = "none";
  document.getElementById("stopwatchContainer").style.display = "block";
  document.getElementById("backButton").style.display = "block";
}

function showPomodoro() {
  document.getElementById("landingPage").style.display = "none";
  document.getElementById("pomodoroContainer").style.display = "block";
  document.getElementById("backButton").style.display = "block";
}

function showLanding() {
  document.getElementById("landingPage").style.display = "block";
  document.getElementById("timerContainer").style.display = "none";
  document.getElementById("stopwatchContainer").style.display = "none";
  document.getElementById("pomodoroContainer").style.display = "none";
  document.getElementById("backButton").style.display = "none";
  stopTimer();
  resetStopwatch();
  resetPomodoro();
}

// Timer functionality
let totalTime = 0;
let interval;
let startTime = 0;
let history = [];

function startTimer() {
  initAudio(); // Initialize audio on user interaction
  clearInterval(interval);

  const hrs = parseInt(document.getElementById("setHours").value) || 0;
  const mins = parseInt(document.getElementById("setMinutes").value) || 0;
  const secs = parseInt(document.getElementById("setSeconds").value) || 0;

  totalTime = hrs * 3600 + mins * 60 + secs;
  startTime = totalTime;

  if (totalTime <= 0) return;

  interval = setInterval(() => {
    if (totalTime <= 0) {
      clearInterval(interval);
      addToHistory(startTime);
      playSound();
      return;
    }

    totalTime--;

    let h = Math.floor(totalTime / 3600);
    let m = Math.floor((totalTime % 3600) / 60);
    let s = totalTime % 60;

    document.getElementById("hours").innerText = String(h).padStart(2, "0");
    document.getElementById("minutes").innerText = String(m).padStart(2, "0");
    document.getElementById("seconds").innerText = String(s).padStart(2, "0");
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
  totalTime = 0;
  document.getElementById("hours").innerText = "00";
  document.getElementById("minutes").innerText = "00";
  document.getElementById("seconds").innerText = "00";
}

function addToHistory(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(2, "0")}`;
  const timestamp = new Date().toLocaleTimeString();

  history.push({ time: timeStr, timestamp });
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const historyList = document.getElementById("historyList");

  if (history.length === 0) {
    historyList.innerHTML =
      '<div class="no-history">No timers completed yet</div>';
    return;
  }

  historyList.innerHTML = history
    .map(
      (item, index) =>
        `<div class="history-item">
            <span>${item.time}</span>
            <span style="color: #888; font-size: 14px;">${item.timestamp}</span>
          </div>`
    )
    .reverse()
    .join("");
}

// Stopwatch functionality
let swTime = 0;
let swInterval;
let swRunning = false;

function startStopwatch() {
  if (swRunning) return;
  swRunning = true;

  swInterval = setInterval(() => {
    swTime++;

    let h = Math.floor(swTime / 3600);
    let m = Math.floor((swTime % 3600) / 60);
    let s = swTime % 60;

    document.getElementById("swHours").textContent = String(h).padStart(2, "0");
    document.getElementById("swMinutes").textContent = String(m).padStart(
      2,
      "0"
    );
    document.getElementById("swSeconds").textContent = String(s).padStart(
      2,
      "0"
    );
  }, 1000);
}

function pauseStopwatch() {
  clearInterval(swInterval);
  swRunning = false;
}

function resetStopwatch() {
  clearInterval(swInterval);
  swRunning = false;
  swTime = 0;
  document.getElementById("swHours").textContent = "00";
  document.getElementById("swMinutes").textContent = "00";
  document.getElementById("swSeconds").textContent = "00";
}

// Initialize audio context globally
let audioContext = null;

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function playSound() {
  initAudio();
  
  const now = audioContext.currentTime;
  
  // Create a pleasant bell-like alarm sound
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    // Smooth envelope for bell sound
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    
    oscillator.start(now);
    oscillator.stop(now + 1.5);
  });
  
  // Add a second chime after 0.3 seconds
  setTimeout(() => {
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const delayTime = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, delayTime);
      gainNode.gain.linearRampToValueAtTime(0.15, delayTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, delayTime + 1.2);
      
      oscillator.start(delayTime);
      oscillator.stop(delayTime + 1.2);
    });
  }, 300);
}

// Pomodoro functionality
let pomTime = 25 * 60; // 25 minutes in seconds
let pomInterval;
let pomRunning = false;
let pomSession = 1;
let pomCompleted = 0;
let isWorkTime = true;

const WORK_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK = 5 * 60; // 5 minutes
const LONG_BREAK = 15 * 60; // 15 minutes

function startPomodoro() {
  initAudio(); // Initialize audio on user interaction
  if (pomRunning) return;
  pomRunning = true;

  pomInterval = setInterval(() => {
    if (pomTime <= 0) {
      clearInterval(pomInterval);
      pomRunning = false;
      handlePomodoroComplete();
      return;
    }

    pomTime--;

    let m = Math.floor(pomTime / 60);
    let s = pomTime % 60;

    document.getElementById("pomMinutes").textContent = String(m).padStart(2, "0");
    document.getElementById("pomSeconds").textContent = String(s).padStart(2, "0");
  }, 1000);
}

function pausePomodoro() {
  clearInterval(pomInterval);
  pomRunning = false;
}

function resetPomodoro() {
  clearInterval(pomInterval);
  pomRunning = false;
  pomTime = WORK_TIME;
  pomSession = 1;
  pomCompleted = 0;
  isWorkTime = true;
  
  document.getElementById("pomMinutes").textContent = "25";
  document.getElementById("pomSeconds").textContent = "00";
  document.getElementById("pomStatus").textContent = "Work Time";
  document.getElementById("pomSession").textContent = "1";
  document.getElementById("pomCompleted").textContent = "0";
}

function handlePomodoroComplete() {
  playSound();
  
  if (isWorkTime) {
    pomCompleted++;
    document.getElementById("pomCompleted").textContent = pomCompleted;
    
    if (pomSession === 4) {
      // Long break after 4 sessions
      pomTime = LONG_BREAK;
      document.getElementById("pomStatus").textContent = "Long Break";
      pomSession = 1;
    } else {
      // Short break 
      pomTime = SHORT_BREAK;
      document.getElementById("pomStatus").textContent = "Short Break";
      pomSession++;
    }
    isWorkTime = false;
  } else {
    // Break is over, start work time
    pomTime = WORK_TIME;
    document.getElementById("pomStatus").textContent = "Work Time";
    isWorkTime = true;
  }
  
  document.getElementById("pomSession").textContent = pomSession;
  let m = Math.floor(pomTime / 60);
  let s = pomTime % 60;
  document.getElementById("pomMinutes").textContent = String(m).padStart(2, "0");
  document.getElementById("pomSeconds").textContent = String(s).padStart(2, "0");
}
