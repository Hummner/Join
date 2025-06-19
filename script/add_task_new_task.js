/**
 * Stores the current page name extracted from the URL.
 * Used to determine conditional behavior based on page context.
 * 
 * @constant {string}
 */
const currentPage = window.location.pathname.split("/").pop();


/**
 * Global array to store searched tasks (if needed elsewhere).
 * 
 * @type {Array}
 */
let searchedTasks = [];


/**
 * Adds a new task to the task list, validates inputs, and updates the server.
 * If on board.html, it also renders the task into the appropriate column.
 * 
 * @function addTask
 */
function addTask() {
    let newTask;
    let hasError = checkInputFields();
    if (hasError) return;
    newTask = getNewTask();
    tasks.push(newTask);
    putDataToServer(`/join/tasks/${newTask.id}`, newTask);

    if (currentPage === "board.html") {
        let taskIndex = getIndex();
        getSubtasksArrayAfterEdit(taskIndex);
        getAssignedToArrayAfterEdit(taskIndex);
        renderTaskInToColumn();
        closeAddTask();
    }

    if (currentPage === "add_task.html") {
        clearAddTaskAfterAdd()
    }
}


/**
 * Returns the index of the latest task in the `tasks` array.
 * 
 * @returns {number} Index of last task.
 */
function getIndex() {
    return tasks.length - 1;
}


/**
 * Gathers form input data and constructs a new task object.
 * 
 * @returns {Object} New task object.
 */
function getNewTask() {
    let title = document.getElementById("titel_input").value;
    let descripton = document.getElementById("description_input").value;
    let date = document.getElementById("date_input").value;
    let category = document.getElementById("category_select_input").value;
    let priority = getPriority();
    let subtask = getSubtasks().subtasks;
    let assignedTo = getAssignedTo();
    let id = generateID();
    let condition = currentCondition;
    debugger
    let attachment = getAttachment().attachment;
    return { title, descripton, date, category, priority, subtask, assignedTo, id, condition, attachment };
}


/**
 * Adds an edited task to the list by replacing an existing task and updating the server.
 * 
 * @param {number} taskIndex - Index of the task to be replaced.
 */
function addEditedTask(taskIndex) {
    let hasError = checkInputFields();
    if (hasError) return;

    const newEditedTask = getEditedTask(taskIndex);
    putDataToServer(`/join/tasks/${newEditedTask.id}`, newEditedTask);
    tasks[taskIndex] = newEditedTask;
    getSubtasksArrayAfterEdit(taskIndex);
    getAssignedToArrayAfterEdit(taskIndex);
    renderSingleTaskInToColumn(taskIndex);
    closeOverlayTask();
    clearOverlay();
}


/**
 * Constructs a task object using updated values from form inputs.
 * 
 * @param {number} taskIndex - Index of the task being edited.
 * @returns {Object} Edited task object.
 */
function getEditedTask(taskIndex) {
    let title = document.getElementById("titel_input").value;
    let descripton = document.getElementById("description_input").value;
    let date = document.getElementById("date_input").value;
    let category = document.getElementById("category_select_input").value;
    let priority = getPriority();
    let subtask = getSubtasks(taskIndex).subtasks;
    let assignedTo = getAssignedTo();
    let id = tasks[taskIndex].id;
    let condition = tasks[taskIndex].condition;
    return { title, descripton, date, category, priority, subtask, assignedTo, id, condition };
}


/**
 * Validates all required input fields and highlights missing inputs.
 * 
 * @returns {boolean} True if any input is invalid.
 */
function checkInputFields() {
    let hasError = false;
    let fields = checkRequiredInputsField();
    fields.forEach(({ id, errorId }) => {
        const input = document.getElementById(id);
        const error = document.getElementById(errorId);
        const isEmpty = !input.value.trim();

        if (isEmpty) {
            error.classList.add('visible');
            if (id === 'category_select_input') {
                input.parentElement.classList.add('error-label-border');
            } else {
                input.classList.add('error-border');
            }
            hasError = true;
        } else if (id === 'date_input') {
            const enteredDate = new Date(input.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            enteredDate.setHours(0, 0, 0, 0);

            if (enteredDate < today) {
                document.getElementById("error-date").innerHTML = "The selected date cannot be in the past.";
                error.classList.add('visible');
                input.classList.add('error-border');
                hasError = true;
            }
        }
    });
    return hasError;
}


/**
 * Determines which priority option is selected.
 * 
 * @returns {string|undefined} The selected priority level.
 */
function getPriority() {
    let priority;
    let prio = [
        document.getElementById("prio_urgent"),
        document.getElementById("prio_medium"),
        document.getElementById("prio_low")
    ];

    for (let i = 0; i < prio.length; i++) {
        if (prio[i].checked) {
            priority = prio[i].value;
        }
    }
    return priority;
}


/**
 * Checks for required inputs and returns field info.
 * @returns {Array<{id: string, errorId: string}>} Required fields.
 */
function checkRequiredInputsField() {
    const fields = [
      { id: 'titel_input', errorId: 'error-title' },
      { id: 'date_input_picker', errorId: 'error-date' },
      { id: 'category_select_input', errorId: 'error-cat' }
    ];
    removeErrorMsg();
    return fields;
}


/**
 * Generates a unique ID for each task using the current timestamp.
 * 
 * @returns {number} Unique task ID.
 */
function generateID() {
    return (new Date()).getTime();
}


/**
 * Collects selected user IDs and converts them into an assignedTo object.
 * 
 * @returns {Object} Object mapping user keys to usernames.
 */
function getAssignedTo() {
    let userID = getUserID();
    let allUsers = getUserObject(userID);
    return Object.fromEntries(allUsers);
}


/**
 * Retrieves an array of selected user IDs from checkboxes.
 * 
 * @returns {Array<string>} Array of usernames.
 */
function getUserID() {
    let userID = [];
    for (let i = 0; i < contactsFirebase.length; i++) {
        let checkbox = document.getElementById("user_" + i);
        if (checkbox?.checked) {
            userID.push(contactsFirebase[i].username);
        }
    }
    return userID;
}


/**
 * Converts an array of user IDs into key-value pairs.
 * 
 * @param {Array<string>} userID - List of usernames.
 * @returns {Array<Array>} Array of user key-value entries.
 */
function getUserObject(userID) {
    return userID.map((name, index) => [`user${index}`, name]);
}


/**
 * Extracts subtask data from the DOM and returns it as an object.
 * 
 * @param {number} [taskIndex] - Optional task index for editing mode.
 * @returns {Object} Subtasks wrapped in a 'subtasks' key.
 */
function getSubtasks(taskIndex) {
    prepareSubtaskIDs();
    const subList = document.getElementById("sub_list");
    if (!subList) return { subtasks: {} };
    const subtasksObject = {};

    [...subList.children].forEach((el, i) => {
        const subtask = extractSubtask(`editable_input_${i}`, taskIndex, i);
        if (subtask) {
            subtasksObject[`subtask${i}`] = subtask;
        }
    });

    return { subtasks: subtasksObject };
}


/**
 * Assigns unique IDs to subtask input fields.
 */
function prepareSubtaskIDs() {
    const subList = document.getElementById("sub_list");
    if (!subList) return;
    [...subList.children].forEach((el, i) => {
        const input = el.querySelector("input");
        if (input) input.id = `editable_input_${i}`;
    });
}


/**
 * Converts the assignedTo object into an array of user objects from Firebase.
 * 
 * @param {number} taskIndex - Index of the task.
 * @returns {Array<Object>} Updated assignedTo array.
 */
function getAssignedToArrayAfterEdit(taskIndex) {
    const usersKeys = Object.keys(tasks[taskIndex].assignedTo);
    const usersArray = usersKeys.map(key => {
        const username = tasks[taskIndex].assignedTo[key];
        return contactsFirebase.find(user => user.username === username);
    });
    return tasks[taskIndex].assignedTo = usersArray;
}


/**
 * Converts the subtasks object into an array of structured subtasks.
 * 
 * @param {number} taskIndex - Index of the task.
 * @returns {Array<Object>} Updated subtasks array.
 */
function getSubtasksArrayAfterEdit(taskIndex) {
    const subtasksObj = tasks[taskIndex].subtask;
    const subtasks = Object.keys(subtasksObj).map(key => ({
        subtaskName: subtasksObj[key].name,
        subtaskCheck: subtasksObj[key].checked
    }));
    return tasks[taskIndex].subtask = subtasks;
}


/**
 * Reloads the task overlay by fetching its HTML content.
 * 
 * @async
 * @function clearOverlay
 */
async function clearOverlay() {
    await getTaskOverlayHTML();
}


/**
 * Handles checking or unchecking a subtask and updating the progress bar.
 * 
 * @param {number} indexSubtask - Subtask index.
 * @param {number} taskIndex - Task index.
 */
function addSubtaskChecked(indexSubtask, taskIndex) {
    const subtask = document.getElementById(`task_${taskIndex}_checkbox_${indexSubtask}`);
    let progress = parseInt(document.getElementById(`subtasks_user_${taskIndex}`).value) || 0;

    subtask.checked ? progress++ : progress > 0 ? progress-- : progress = 0;
    saveCheckboxProcess(taskIndex, indexSubtask, subtask, progress);
}


/**
 * Updates the subtask progress, both in the DOM and on the server.
 * 
 * @param {number} taskIndex - Task index.
 * @param {number} indexSubtask - Subtask index.
 * @param {HTMLElement} subtask - Subtask checkbox element.
 * @param {number} progressValue - New progress value.
 */
function saveCheckboxProcess(taskIndex, indexSubtask, subtask, progressValue) {
    document.getElementById(`subtasks_user_${taskIndex}`).value = progressValue;
    document.getElementById(`subtask_value_user_${taskIndex}`).innerHTML = progressValue;
    tasks[taskIndex].subtask[indexSubtask].subtaskCheck = subtask.checked;

    const taskID = tasks[taskIndex].id;
    const subtaskName = `subtask${indexSubtask}`;
    patchDataToServer(`join/tasks/${taskID}/subtask/${subtaskName}`, { checked: subtask.checked });
}


/**
 * Counts how many subtasks are checked.
 * 
 * @param {number} taskIndex - Index of the task.
 * @param {number} subtaskMax - Total number of subtasks.
 * @returns {number} Number of checked subtasks.
 */
function checkedSubtaskChecked(taskIndex, subtaskMax) {
    let count = 0;
    for (let i = 0; i < subtaskMax; i++) {
        if (tasks[taskIndex].subtask[i].subtaskCheck) count++;
    }
    return count;
}


/**
 * Initializes a flatpickr date picker on the element with ID "date_input_picker".
 * Sets locale to English, enforces "day/month/year" format, disables past dates, 
 * and ensures mobile-friendly behavior is turned off. On date selection, the value 
 * is transformed to ISO format and assigned to a hidden input.
 * 
 * @function datepicker
 */
function datepicker() {
    flatpickrInstance = flatpickr("#date_input_picker", {
        locale: "en",
        dateFormat: "d/m/Y",
        minDate: "today",
        disableMobile: true,
        onChange: function (selectedDates, dateStr, instance) {
            const [day, month, year] = dateStr.split("/");
            const isoDate = `${year}-${month}-${day}`;
            let expiredDate = document.getElementById("expired_date");
            if (expiredDate) {
                expiredDate.classList.add("d_none");
            }
            document.getElementById("date_input").value = isoDate;
        }
    });
}