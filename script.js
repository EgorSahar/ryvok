const screens = {
    setup: document.getElementById("setupScreen"),
    work: document.getElementById("workScreen"),
    complete: document.getElementById("completeScreen"),
    break: document.getElementById("breakScreen"),
    breakComplete: document.getElementById("breakCompleteScreen")
};

const durationButtons = document.querySelectorAll(".duration-option");
const nextButtons = document.querySelectorAll("[data-next-minutes]");
const breakNextButtons = document.querySelectorAll("[data-break-next]");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const finishButton = document.getElementById("finishButton");

const startBreakButton = document.getElementById("startBreakButton");
const skipBreakButton = document.getElementById("skipBreakButton");

const backFromComplete = document.getElementById("backFromComplete");
const backFromBreak = document.getElementById("backFromBreak");

const workTimer = document.getElementById("workTimer");
const breakTimer = document.getElementById("breakTimer");

const workProgress = document.getElementById("workProgress");
const breakProgress = document.getElementById("breakProgress");

const completedTime = document.getElementById("completedTime");

const settingsButton = document.getElementById("settingsButton");
const settingsOverlay = document.getElementById("settingsOverlay");
const closeSettings = document.getElementById("closeSettings");

const breakDurationLabel = document.getElementById("breakDurationLabel");
const completeBreakDuration = document.getElementById("completeBreakDuration");

const breakOptions = document.querySelectorAll(".break-option");
const soundToggle = document.getElementById("soundToggle");

const themeButtons = document.querySelectorAll(".theme-option");
const brandButton = document.getElementById("brandButton");


/* STATE */

let selectedMinutes = Number(localStorage.getItem("ryvokSprint")) || 25;
let breakMinutes = Number(localStorage.getItem("ryvokBreak")) || 5;

let currentMode = null;

let timerStart = null;
let timerEnd = null;
let pausedAt = null;

let totalDuration = 0;
let remainingBeforePause = 0;

let timerAnimation = null;

let soundEnabled =
    localStorage.getItem("ryvokSound") !== "false";

let currentTheme =
    localStorage.getItem("ryvokTheme") || "paper";


/* INITIALIZATION */

init();


function init() {

    applyTheme(currentTheme);

    updateSelectedDuration();
    updateBreakUI();
    updateSoundUI();

    durationButtons.forEach(button => {
        button.addEventListener("click", () => {

            selectedMinutes = Number(button.dataset.minutes);

            localStorage.setItem(
                "ryvokSprint",
                selectedMinutes
            );

            updateSelectedDuration();
        });
    });


    nextButtons.forEach(button => {

        button.addEventListener("click", () => {

            const minutes =
                Number(button.dataset.nextMinutes);

            selectedMinutes = minutes;

            startWork(minutes);
        });

    });


    breakNextButtons.forEach(button => {

        button.addEventListener("click", () => {

            const minutes =
                Number(button.dataset.breakNext);

            selectedMinutes = minutes;

            startWork(minutes);
        });

    });


    startButton.addEventListener("click", () => {
        startWork(selectedMinutes);
    });


    pauseButton.addEventListener("click", togglePause);


    finishButton.addEventListener("click", () => {
        finishWork(false);
    });


    startBreakButton.addEventListener("click", () => {
        startBreak();
    });


    skipBreakButton.addEventListener("click", () => {
        finishBreak();
    });


    backFromComplete.addEventListener("click", () => {
        showScreen("setup");
    });


    backFromBreak.addEventListener("click", () => {
        showScreen("setup");
    });


    brandButton.addEventListener("click", () => {

        if (currentMode) {
            return;
        }

        showScreen("setup");
    });


    settingsButton.addEventListener("click", openSettings);

    closeSettings.addEventListener("click", closeSettingsPanel);


    settingsOverlay.addEventListener("click", event => {

        if (event.target === settingsOverlay) {
            closeSettingsPanel();
        }

    });


    breakOptions.forEach(button => {

        button.addEventListener("click", () => {

            breakMinutes =
                Number(button.dataset.break);

            localStorage.setItem(
                "ryvokBreak",
                breakMinutes
            );

            updateBreakUI();
        });

    });


    soundToggle.addEventListener("click", () => {

        soundEnabled = !soundEnabled;

        localStorage.setItem(
            "ryvokSound",
            soundEnabled
        );

        updateSoundUI();

    });


    themeButtons.forEach(button => {

        button.addEventListener("click", () => {

            const theme =
                button.dataset.theme;

            currentTheme = theme;

            localStorage.setItem(
                "ryvokTheme",
                theme
            );

            applyTheme(theme);

        });

    });


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeSettingsPanel();
        }

        if (
            event.code === "Space" &&
            currentMode === "work"
        ) {

            event.preventDefault();

            togglePause();
        }

    });

}


/* SCREEN */

function showScreen(name) {

    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    screens[name].classList.add("active");
}


/* DURATION UI */

function updateSelectedDuration() {

    durationButtons.forEach(button => {

        const isSelected =
            Number(button.dataset.minutes) === selectedMinutes;

        button.classList.toggle(
            "selected",
            isSelected
        );

    });

}


/* WORK */

function startWork(minutes) {

    stopAnimation();

    currentMode = "work";

    totalDuration = minutes * 60 * 1000;

    timerStart = Date.now();
    timerEnd = timerStart + totalDuration;

    pausedAt = null;
    remainingBeforePause = 0;

    pauseButton.textContent = "ПАУЗА";

    showScreen("work");

    updateWorkTimer();

    timerAnimation =
        requestAnimationFrame(updateWorkTimer);
}


function updateWorkTimer() {

    if (currentMode !== "work") {
        return;
    }

    if (pausedAt !== null) {
        return;
    }

    const now = Date.now();

    const remaining =
        Math.max(0, timerEnd - now);

    const seconds =
        Math.ceil(remaining / 1000);

    workTimer.textContent =
        formatTime(seconds);

    const progress =
        remaining / totalDuration;

    workProgress.style.transform =
        `scaleX(${Math.max(0, progress)})`;

    if (remaining <= 0) {

        finishWork(true);

        return;
    }

    timerAnimation =
        requestAnimationFrame(updateWorkTimer);
}


/* PAUSE */

function togglePause() {

    if (currentMode !== "work") {
        return;
    }

    if (pausedAt === null) {

        pausedAt = Date.now();

        remainingBeforePause =
            Math.max(
                0,
                timerEnd - pausedAt
            );

        pauseButton.textContent = "ПРОДОЛЖИТЬ";

        stopAnimation();

    } else {

        const now = Date.now();

        timerStart = now;

        timerEnd =
            now + remainingBeforePause;

        pausedAt = null;

        pauseButton.textContent = "ПАУЗА";

        updateWorkTimer();

        timerAnimation =
            requestAnimationFrame(updateWorkTimer);
    }

}


/* FINISH WORK */

function finishWork(completed) {

    if (currentMode !== "work") {
        return;
    }

    stopAnimation();

    currentMode = null;

    const elapsedTime =
        completed
            ? totalDuration
            : Math.max(
                0,
                totalDuration -
                Math.max(
                    0,
                    timerEnd - Date.now()
                )
            );

    completedTime.textContent =
        formatTime(
            Math.round(elapsedTime / 1000)
        );

    if (completed) {
        playFinishSound();
    }

    showScreen("complete");
}


/* BREAK */

function startBreak() {

    stopAnimation();

    currentMode = "break";

    totalDuration =
        breakMinutes * 60 * 1000;

    timerStart = Date.now();
    timerEnd = timerStart + totalDuration;

    showScreen("break");

    updateBreakTimer();

    timerAnimation =
        requestAnimationFrame(updateBreakTimer);
}


function updateBreakTimer() {

    if (currentMode !== "break") {
        return;
    }

    const now = Date.now();

    const remaining =
        Math.max(0, timerEnd - now);

    const seconds =
        Math.ceil(remaining / 1000);

    breakTimer.textContent =
        formatTime(seconds);

    const progress =
        remaining / totalDuration;

    breakProgress.style.transform =
        `scaleX(${Math.max(0, progress)})`;

    if (remaining <= 0) {

        finishBreak();

        return;
    }

    timerAnimation =
        requestAnimationFrame(updateBreakTimer);
}


/* BREAK FINISHED */

function finishBreak() {

    stopAnimation();

    currentMode = null;

    playFinishSound();

    showScreen("breakComplete");
}


/* SETTINGS */

function openSettings() {

    settingsOverlay.classList.add("open");

}


function closeSettingsPanel() {

    settingsOverlay.classList.remove("open");

}


/* BREAK UI */

function updateBreakUI() {

    const formatted =
        formatTime(breakMinutes * 60);

    breakDurationLabel.textContent =
        formatted;

    completeBreakDuration.textContent =
        formatted;


    breakOptions.forEach(button => {

        button.classList.toggle(
            "active",
            Number(button.dataset.break) === breakMinutes
        );

    });

}


/* SOUND UI */

function updateSoundUI() {

    soundToggle.classList.toggle(
        "active",
        soundEnabled
    );

}


/* THEME */

function applyTheme(theme) {

    if (theme === "paper") {

        document.body.removeAttribute("data-theme");

    } else {

        document.body.dataset.theme =
            theme;

    }


    themeButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.theme === theme
        );

    });


    const themeColors = {
        paper: "#f4f3ef",
        warm: "#eee8dd",
        mist: "#e8eae8",
        midnight: "#111111",
        graphite: "#292929",
        forest: "#17201b"
    };


    document
        .querySelector('meta[name="theme-color"]')
        .setAttribute(
            "content",
            themeColors[theme]
        );

}


/* SOUND */

function playFinishSound() {

    if (!soundEnabled) {
        return;
    }

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        const context =
            new AudioContext();

        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            520,
            context.currentTime
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            760,
            context.currentTime + .16
        );

        gain.gain.setValueAtTime(
            0.0001,
            context.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.12,
            context.currentTime + .02
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            context.currentTime + .45
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start();

        oscillator.stop(
            context.currentTime + .45
        );

    } catch (error) {

        console.warn(
            "Не удалось воспроизвести звук:",
            error
        );

    }

}


/* UTILITIES */

function formatTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );

}


function stopAnimation() {

    if (timerAnimation !== null) {

        cancelAnimationFrame(
            timerAnimation
        );

        timerAnimation = null;
    }

}