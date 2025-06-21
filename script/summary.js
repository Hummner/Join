// Extract parameters from the URL
let urlParams = new URLSearchParams(window.location.search);
let greetsName = urlParams.get("name");
let isLogin = urlParams.get("login") === "true";


// Firebase endpoint for retrieving task data
let FIREBASE_URL = "https://join-4215a-default-rtdb.europe-west1.firebasedatabase.app/join/tasks.json";


/**
 * Returns the appropriate greeting phrase based on the current time.
 * @returns {string} - Greeting phrase
 */
function getGreetingPhrase() {
    let now = new Date();
    let hour = now.getHours() + now.getMinutes() / 60;
    return (hour >= 5.5 && hour < 10.5) ? "Good morning" :
        (hour < 17) ? "Good day" :
            (hour < 21.5) ? "Good evening" :
                "Good night";
}


/**
 * Sets the greeting text dynamically based on login state and user name.
 * @param {HTMLElement} element - The element to insert the greeting text into
 * @param {string} name - User's name
 */
function setGreetingText(element, name) {
    if (!element) return;
    let greetingPhrase = getGreetingPhrase();
    element.innerHTML = (name && name !== "Guest")
        ? `${greetingPhrase}, <span class="greeting-name">${name}</span>`
        : `${greetingPhrase}!`;
}


/**
 * Initializes greeting logic on page load.
 * Triggers animated greeting once after login on mobile view.
 */
function initGreeting() {
    let greeting = document.querySelector(".greeting");
    let greetingText = document.querySelector(".greeting-text");
    let grid = document.querySelector(".metrics-grid");
    let header = document.querySelector(".dashboard-header");
    let dashboard = document.querySelector(".dashboard-container");
    if (!greeting || !greetingText || !grid || !header || !dashboard) return;
    setGreetingText(greetingText, greetsName);
    if (isLogin && window.innerWidth <= 990) {
        showGreetingWithTransition();
        urlParams.delete("login");
        window.history.replaceState({}, document.title, `?${urlParams}`);
    } else {
        [grid, header, dashboard].forEach(el => el.classList.remove("hidden"));
        loadSummaryData();
    }
}


/**
 * Displays the greeting with transition and starts hiding logic.
 */
function showGreetingWithTransition() {
    let greeting = document.querySelector(".greeting");
    let grid = document.querySelector(".metrics-grid");
    let header = document.querySelector(".dashboard-header");
    let dashboard = document.querySelector(".dashboard-container");
    if (!greeting || !grid || !header || !dashboard) return;
    [grid, header, dashboard].forEach(el => el.classList.add("hidden"));
    greeting.style.display = "flex";
    greeting.classList.add("animate-in");
    setGreetingHideTimeout(greeting, [grid, header, dashboard]);
}


/**
 * Starts timeout to hide the greeting and show other elements.
 * 
 * @param {HTMLElement} greeting - The greeting element.
 * @param {HTMLElement[]} toShow - Elements to show again after hiding greeting.
 */
function setGreetingHideTimeout(greeting, toShow) {
    setTimeout(() => {
        greeting.classList.replace("animate-in", "animate-out");
        setTimeout(() => {
            greeting.style.display = "none";
            greeting.classList.remove("animate-out");
            toShow.forEach(el => el.classList.remove("hidden"));
            loadSummaryData();
        }, 400);

    }, 2000);
}


/**
 * Re-applies the greeting text (e.g. when returning to the page from another view).
 */
function initGreetingRepeat() {
    let greetingRepeatText = document.querySelector(".greeting-text-repeat");
    setGreetingText(greetingRepeatText, greetsName);
}


/**
 * Fetches task data from Firebase and updates summary metrics in the DOM.
 */
async function loadSummaryData() {
    try {
        const res = await fetch(FIREBASE_URL);
        const data = await res.json();
        const { todo, done, inProgress, awaitingFeedback, urgent, total, upcomingDate } = computeTaskMetrics(data);
        const ids = {
            summaryTodo: todo,
            summaryDone: done,
            summaryProgress: inProgress,
            summaryFeedback: awaitingFeedback,
            summaryUrgent: urgent,
            summaryTotal: total
        };
        Object.entries(ids).forEach(([id, val]) => document.getElementById(id).textContent = val);
        if (upcomingDate) document.getElementById("summaryDeadline").textContent = formatDate(upcomingDate);
    } catch (e) {
        console.error("Error loading summary:", e);
    }
}


/**
 * Calculates task summary metrics from the given tasks.
 * 
 * @param {Object} tasks - The task data object from Firebase.
 * @returns {Object} Summary metrics including counts and upcoming date.
 */
function computeTaskMetrics(tasks) {
    let todo = 0, done = 0, inProgress = 0, awaitingFeedback = 0;
    let urgent = 0, total = 0, upcomingDate = null;
    for (let taskId in tasks) {
        const task = tasks[taskId];
        total++;
        switch (task.condition) {
            case "ToDo": todo++; break;
            case "done": done++; break;
            case "inProgress": inProgress++; break;
            case "feedback": awaitingFeedback++; break;
        }
        if (task.priority === "urgent") urgent++;
        const taskDate = new Date(task.date);
        if (taskDate > new Date() && (!upcomingDate || taskDate < new Date(upcomingDate))) {
            upcomingDate = task.date;
        }
    }
    return { todo, done, inProgress, awaitingFeedback, urgent, total, upcomingDate };
}


/**
 * Formats ISO date string to readable format.
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
    let date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


/**
 * Handles metric tile click and visual feedback.
 * @param {string} url
 * @param {HTMLElement} element
 */
function navigateTo(url, element) {
    element.classList.add("clicked");
    setTimeout(() => {
        window.location.href = url;
    }, 80);
}