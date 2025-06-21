/**
 * Parses the "msg" parameter from the current URL.
 */
const urlParams = new URLSearchParams(window.location.search);


/**
 * Message from URL, used for user feedback.
 * 
 */
const msg = urlParams.get('msg');


/**
 * Element for displaying feedback messages.
 */
let info = document.getElementById('poppin');


/**
 * Indicates whether the password is currently visible.
 */
let isPasswordVisible = false;


/**
 * Initializes the login page by showing the logo with a delay
 * and displaying a feedback message if provided in the URL or global context.
 */
function loginInit() {
    logoAnimation();
    checkUrlParam();
}


/**
 * Checks for a feedback message (from the global `msg` variable)
 * and updates the `info` element's appearance accordingly.
 */
function checkUrlParam() {
    if (msg) {
        info.classList.remove('opacity');
        info.classList.add('poppins-success');
        info.innerHTML = msg;
    } else {
        info.classList.add('opacity');
        info.classList.remove('poppins-success');
    }
}


/**
 * Animates the login logo by revealing it with a slight delay.
 * 
 * Targets an element with the ID `logoImg` and removes the `d-none` class
 * after 1060 milliseconds to make it visible.
 */
function logoAnimation() {
    setTimeout(() => {
        document.getElementById('logoImg').classList.remove('d-none');
    }, 1060);
}


/**
 * Attempts to log in with user credentials from the form inputs.
 * Redirects on success or shows an error message on failure.
 */
async function login() {
    if (checkValueInput()) return;
    spinningLoaderStart();
    let email = document.getElementById('email');
    let passwd = document.getElementById('password');
    await loadUserData();
    spinningLoaderEnd();
    let user = userFirebase.find(
        user => user.email === email.value && user.password === passwd.value
    );
    if (user) {
        localStorage.setItem("username", user.username);
        localStorage.setItem("loggedIn", "true");
        window.location.href = `html/summary.html?name=${encodeURIComponent(user.username)}&login=true`;
        resetUserArray();
    } else {
        displayErrorLogin();
    }
}


/**
 * Displays an error message if login fails.
 */
function displayErrorLogin() {
    document.getElementById('labelPassword').classList.add('error-border');
    info.classList.remove('opacity');
    info.innerHTML = "Check your e-mail and password.<br> Please try again.";
}


/**
 * Loads user data from Firebase and assigns to `userFirebase`.
 */
async function loadUserData() {
    try {
        let data = await loadUsersFromFirebase();
        userFirebase = Object.values(data || {});
    } catch (error) {
        console.error("Error loading user login function:", error);
    }
}


/**
 * Logs in a guest user by bypassing required fields and redirecting.
 * @param {Event} event - The click event from the form.
 */
function guestLogin(event) {
    event.preventDefault();
    document.getElementById('email').removeAttribute('required');
    document.getElementById('password').removeAttribute('required');
    localStorage.setItem("username", "Guest");     // 👈 Auch hier speichern!
    localStorage.setItem("loggedIn", "true");
    window.location.href = "html/summary.html?name=Guest&login=true";
}


/**
 * Updates the password input icon depending on whether input is present and visible.
 */
function updatePasswdIcon() {
    const passwdInput = document.getElementById('password');
    const passwdIcon = document.getElementById('passwdIcon');

    if (passwdInput.value.length > 0) {
        passwdIcon.src = isPasswordVisible
            ? '../assets/img/icon/visibility.svg'
            : '../assets/img/icon/visibility_off.svg';
    } else {
        passwdIcon.src = '../assets/img/icon/lock.svg';
    }
}


/**
 * Toggles the password visibility in the input field and updates the icon accordingly.
 */
function togglePasswordVisibility() {
    const passwdInput = document.getElementById('password');
    const passwdIcon = document.getElementById('passwdIcon');
    isPasswordVisible = !isPasswordVisible;
    passwdInput.type = isPasswordVisible ? 'text' : 'password';
    passwdIcon.src = isPasswordVisible
        ? '../assets/img/icon/visibility.svg'
        : '../assets/img/icon/visibility_off.svg';
}


/**
 * Marks user as logged in by setting a flag in localStorage.
 */
function usrerIsLoggedIn() {
    localStorage.setItem("loggedIn", "true");
}


/**
 * Displays an error message and highlights the input field in error.
 * 
 * @param {string} inputLabel - The key of the input field with the error.
 */
function inputError(inputLabel) {
    let info = document.getElementById('poppin');
    info.classList.remove('opacity');
    info.innerHTML = errorMessage(inputLabel);
    errorInputField(inputLabel);
}


/**
 * Returns a predefined error message for a given input key.
 * 
 * @param {string} key - Identifier for the input field (e.g., "Email", "Password").
 * @returns {string} - Corresponding error message.
 */
function errorMessage(key) {
    const messages = {
        "Email": "Please check your email entry!",
        "Password": "Please use 6 - 15 characters!"
    };
    return messages[key] || "Unknown error!";
}


/**
 * Applies an error class to the label of the faulty input field.
 * 
 * @param {string} inputLabel - Identifier of the input field.
 */
function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}


/**
 * Checks whether the given input value is empty after trimming whitespace.
 * 
 * @param {string} value - Input value to validate.
 * @returns {boolean} - True if empty, otherwise false.
 */
function checkEmptyInput(value) {
    return value.trim() === "";
}


/**
 * Collects and returns input values from the login form.
 * 
 * @returns {Object} - Object with keys `email` and `password`.
 */
function readsTheInputValues() {
    return {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
}


/**
 * Validates input values for email and password formats.
 * 
 * @returns {string|undefined} - Returns input key if invalid, otherwise undefined.
 */
function checkValues() {
    let { email, password } = readsTheInputValues();
    if (checkEmptyInput(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email";
    if (checkEmptyInput(password) || !/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,15}$/.test(password)) return "Password";
}


/**
 * Initiates validation and error handling for login form inputs.
 * 
 * @returns {boolean} - True if error found, false if all inputs are valid.
 */
function checkValueInput() {
    let input = checkValues();
    if (input) {
        inputError(input);
        return true;
    }
    return false;
}


/**
 * Returns a set of regular expression patterns used to validate input fields.
 * @function inputValidations
 * @returns {Object} An object containing validation regex for username, email, password, and phoneNumber.
 */
function inputValidations() {
    return {
        username: /^[a-zA-ZäöüÄÖÜß\s]+$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,15}$/,
        phoneNumber: /^\d+$/,
    };
}


/**
 * Validates the input value based on its ID and updates the label style accordingly.
 * Removes the error class and adds a success class if validation passes.
 * @function correctedInput
 * @param {string} labelID - The ID of the label element to modify.
 * @param {string} inputID - The ID of the input element to validate.
 */
function correctedInput(labelID, inputID) {
    let label = document.getElementById(labelID);
    let input = document.getElementById(inputID);
    let validation = inputValidations();
    if (label.classList.contains("error-border")) {
        let validationKey = validationType(inputID);
        let pattern = validation[validationKey];
        if (pattern && pattern.test(input.value)) {
            label.classList.remove("error-border");
            label.classList.add("correct-input");
        }
    }
}


/**
 * Determines the validation type (e.g., username, email, etc.) based on the input ID.
 * @function validationType
 * @param {string} inputID - The ID of the input element to analyze.
 * @returns {string} The corresponding validation type key.
 */
function validationType(inputID) {
    let validationType = "";
    let lowerID = inputID.toLowerCase();
    if (lowerID.includes("name")) {
        validationType = "username";
    } else if (lowerID.includes("email")) {
        validationType = "email";
    } else if (lowerID.includes("password")) {
        validationType = "password";
    } else if (lowerID.includes("phone")) {
        validationType = "phoneNumber";
    }
    return validationType;
}


/**
 * Removes the success styling from a label, used to reset the state after input was corrected.
 * @function finishTheCorrection
 * @param {string} labelID - The ID of the label element to reset.
 */
function finishTheCorrection(labelID) {
    let label = document.getElementById(labelID);
    if (label.classList.contains("correct-input")) {
        label.classList.remove("correct-input");
    }
}