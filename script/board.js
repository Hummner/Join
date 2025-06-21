/**
 * Currently selected task index for mobile navigation.
 * @type {number}
 */
let currentDraggableTask;


/**
 * Array storing all task objects.
 * @type {Array<Object>}
 */
let tasks = [];


/**
 * Current selected task condition (status/category).
 * @type {string}
 */
let currentCondition = "ToDo";


/**
 * List of users that need to be deleted from Firebase due to being unassigned or missing.
 * @type {Array<Object>}
 */
let usersToDeleteFromFirebase = [];


/**
 * Loads the Add Task overlay into the DOM.
 * @async
 */
async function getAddTaskHTMLtoOverlay() {
  await Promise.all([
    loadHTML("add_task_overlay.html", "add_container"),
  ]);
}


/**
 * Loads the Task Overlay into the DOM.
 * @async
 */
async function getTaskOverlayHTML() {
  await Promise.all([
    loadHTML("task_overlay.html", "overlay_container"),
  ]);
}


/**
 * Loads the Edit Task overlay into the DOM.
 * @async
 */
async function getEditTaskHTML() {
  await Promise.all([
    loadHTML("add_task_overlay.html", "overlay_container"),
  ]);
}


/**
 * Opens the Add Task overlay and sets condition if provided.
 * @async
 * @param {string} [condition=""] - Optional condition to set for the new task.
 */
async function openAddTask(condition = "") {
  if (condition) {
    currentCondition = condition;
  }
  await getAddTaskHTMLtoOverlay();
  loadOverlayToAddTask()
  setTimeout(() => {
    document.getElementById("add_container").classList.remove("overlay-container-sliding");
  }, 1);
  document.getElementById("body").classList.add("overflow-hidden");
  fitSublistOpen();
  renderUserList();
  datepicker();
}


/** Load Overlay.
 */
function loadOverlayToAddTask() {
  document.getElementById("cancel_button").classList.remove("d_none");
  document.getElementById("clear_button").classList.add("d_none");
  document.getElementById("close_add_task_overlay").classList.remove("d_none");
  document.getElementById("board_overlay").classList.remove("d_none");
  document.getElementById("add_container").classList.remove("d_none");
}


/**
 * Closes the Add Task overlay and restores scroll behavior.
 */
function closeAddTask() {
  document.getElementById("add_container").classList.add("overlay-container-sliding");
  setTimeout(() => {
    document.getElementById("board_overlay").classList.add("d_none");
    document.getElementById("add_container").classList.add("d_none");
  }, 100);
  document.getElementById("body").classList.remove("overflow-hidden");
  fitSublistClose();
  clearAttachment();
}


/**
 * Adds the 'addTask-subtask-fit' class to the element with the ID 'sub_list',
 * if the element exists. Typically used to visually open or expand a subtask list.
 */
function fitSublistOpen() {

  let id = document.getElementById("sub_list")
  if (id) {
    id.classList.add('addTask-subtask-fit');
  }
}


/**
 * Removes the 'addTask-subtask-fit' class from the element with the ID 'sub_list',
 * if the element exists. Typically used to visually close or collapse a subtask list.
 */
function fitSublistClose() {
  let id = document.getElementById("sub_list")
  if (id) {
    id.classList.remove('addTask-subtask-fit');
  }
}


/**
 * Filters tasks based on search input and toggles visibility.
 */
function searchTask() {
  const input = document.getElementById("search_task").value.toLowerCase();
  const feedbackContainer = document.getElementById("no_task_feedback");
  feedbackContainer.innerHTML = "";

  const matchFound = filterTasksByInput(input);

  if (!matchFound && input !== "") {
    showNoTaskFeedback(input, feedbackContainer);
  }

  renderEmptyColumn();
}


/**
 * Filters and toggles task visibility based on search input.
 * @param {string} input - Lowercased search input.
 * @returns {boolean} True if any task matched.
 */
function filterTasksByInput(input) {
  let match = false;

  tasks.forEach((task, i) => {
    const el = document.getElementById("task_index_" + i);
    if (!el) return;

    const title = task.title.toLowerCase();
    const description = task.descripton.toLowerCase();

    const isMatch = input === "" || title.includes(input) || description.includes(input);
    el.classList.toggle("d_none", !isMatch);
    if (isMatch) match = true;
  });

  return match;
}


/**
 * Displays feedback message when no task matches the search.
 * @param {string} input - The search input.
 * @param {HTMLElement} container - Element to show the message in.
 */
function showNoTaskFeedback(input, container) {
  const msg = createFeedback(`No task found for: "${input}"`, "absolute");
  container.appendChild(msg);
}


/**
 * Clears all task columns in the DOM.
 * @returns {Object} References to cleared column elements.
 */
function clearColumn() {
  let toDoColumnRef = document.getElementById("toDo_column");
  let inProgColumnRef = document.getElementById("inProg_column");
  let feedbackColumnRef = document.getElementById("feedback_column");
  let doneColumnRef = document.getElementById("done_column");

  toDoColumnRef.innerHTML = "";
  inProgColumnRef.innerHTML = "";
  feedbackColumnRef.innerHTML = "";
  doneColumnRef.innerHTML = "";
  return { toDoColumnRef, inProgColumnRef, feedbackColumnRef, doneColumnRef };
}


/**
 * Checks if a column is empty and inserts or removes the empty message accordingly.
 * @param {HTMLElement} columnRef - DOM element reference of the column.
 * @param {string} message - Message to display if the column is empty.
 */
function checkAndRenderEmptyMessage(columnRef, message) {
  const visibleTasks = Array.from(columnRef.children).filter(child =>
    !child.classList.contains("d_none") &&
    !child.classList.contains("empty-column")
  );
  const alreadyHasPlaceholder = columnRef.querySelector(".empty-column");
  if (visibleTasks.length === 0 && !alreadyHasPlaceholder) {
    const placeholder = document.createElement("div");
    placeholder.classList.add("empty-column");
    placeholder.innerHTML = `<p>${message}</p>`;
    columnRef.appendChild(placeholder);
  }

  if (visibleTasks.length > 0 && alreadyHasPlaceholder) {
    alreadyHasPlaceholder.remove();
  }
}


/**
 * Renders a counter element that displays how many additional users are not shown.
 * @param {HTMLElement} userListRef - The parent DOM element where the counter should be appended.
 * @param {number} userCounterFromTask - The total number of users, used to calculate the remaining count.
 */
function renderCounterElement(userListRef, userCounterFromTask) {
  const remaining = userCounterFromTask - 3;
  const counterDiv = document.createElement("div");
  counterDiv.classList.add("user");
  counterDiv.innerHTML = `<span>+${remaining}</span>`;
  counterDiv.style.color = "rgb(121, 121, 121)";
  userListRef.appendChild(counterDiv);
}


/**
 * Extracts subtask data from Firebase task object.
 * @param {number} index - Task index.
 * @param {Object} responseToJson - Parsed Firebase response.
 * @param {Array<string>} tasksKeysArray - Array of task keys.
 * @returns {Array<Object>} Array of subtask objects.
 */
function arraySubtasks(index, responseToJson, tasksKeysArray) {
  let subtasks = [];
  if (responseToJson[tasksKeysArray[index]].subtask !== undefined) {
    let subtasksKeys = Object.keys(responseToJson[tasksKeysArray[index]].subtask);

    for (let indexSubtask = 0; indexSubtask < subtasksKeys.length; indexSubtask++) {
      subtasks.push({
        subtaskName: responseToJson[tasksKeysArray[index]].subtask[subtasksKeys[indexSubtask]].name,
        subtaskCheck: responseToJson[tasksKeysArray[index]].subtask[subtasksKeys[indexSubtask]].checked
      });
    }
  }
  return subtasks;
}


/**
 * Extracts and validates assigned users from Firebase task object.
 * @param {number} index - Task index.
 * @param {Object} responseToJson - Parsed Firebase response.
 * @param {Array<string>} tasksKeysArray - Array of task keys.
 * @returns {Array<Object>} Array of valid user objects.
 */
function arrayAssignedTo(index, responseToJson, tasksKeysArray) {
  const taskKey = tasksKeysArray[index];
  const assignedTo = responseToJson[taskKey].assignedTo;
  if (!assignedTo) return [];

  return extractValidUsers(taskKey, assignedTo);
}


/**
 * Extracts valid users and collects unknown ones to remove.
 * @param {string} taskKey - Firebase task key.
 * @param {Object} assignedTo - Object with assigned usernames.
 * @returns {Array<Object>} Array of valid user objects.
 */
function extractValidUsers(taskKey, assignedTo) {
  const validUsers = [];
  const userKeys = Object.keys(assignedTo);

  for (const userKey of userKeys) {
    const username = assignedTo[userKey];
    const match = findContactByUsername(username);

    if (match) {
      validUsers.push(match);
    } else {
      addUserToDelete(taskKey, userKey, username);
    }
  }
  return validUsers;
}


/**
 * Finds a contact by username (case-insensitive).
 * @param {string} username - Username to match.
 * @returns {Object|null} Matching user or null.
 */
function findContactByUsername(username) {
  return contactsFirebase.find(
    user => user.username.toLowerCase() === username.toLowerCase()
  ) || null;
}


/**
 * Stores user data that should be removed from Firebase.
 * @param {string} taskKey - Task key.
 * @param {string} userKey - User key inside the task.
 * @param {string} username - The invalid username.
 */
function addUserToDelete(taskKey, userKey, username) {
  usersToDeleteFromFirebase.push({ taskKey, userKey, username });
}