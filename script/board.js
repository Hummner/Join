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
async function getAddTaskHTML() {
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
  await getAddTaskHTML();
  document.getElementById("cancel_button").classList.remove("d_none");
  document.getElementById("clear_button").classList.add("d_none");
  document.getElementById("close_add_task_overlay").classList.remove("d_none");
  document.getElementById("board_overlay").classList.remove("d_none");
  document.getElementById("add_container").classList.remove("d_none");
  setTimeout(() => {
    document.getElementById("add_container").classList.remove("overlay-container-sliding");
  }, 1);
  document.getElementById("body").classList.add("overflow-hidden");
  renderUserList();
  datepicker();
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
}


/**
 * Filters tasks based on search input and toggles visibility.
 */
function searchTask() {
  const inputValue = document.getElementById("search_task").value.toLowerCase();
  let matchFound = false;
  const feedbackContainer = document.getElementById("no_task_feedback");
  feedbackContainer.innerHTML = "";

  for (let indexTask = 0; indexTask < tasks.length; indexTask++) {
    const task = document.getElementById("task_index_" + indexTask);
    if (!task) continue;

    const title = tasks[indexTask].title.toLowerCase();
    const descripton = tasks[indexTask].descripton.toLowerCase();

    if (inputValue === "") {
      task.classList.remove("d_none");
      matchFound = true;
    } else {
      const isMatch = title.includes(inputValue) || descripton.includes(inputValue);
      task.classList.toggle("d_none", !isMatch);
      if (isMatch) matchFound = true;
    }
  }

  if (!matchFound && inputValue !== "") {
    const msg = createFeedback(`No task found for: "${inputValue}"`, "absolute");
    feedbackContainer.appendChild(msg);
  }
  renderEmptyColumn();
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
 * 
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
  let usersArray = [];
  let taskKey = tasksKeysArray[index];
  let assignedTo = responseToJson[taskKey].assignedTo;
  if (assignedTo) {
    let usersKeysArray = Object.keys(assignedTo);
    for (let userKey of usersKeysArray) {
      let username = assignedTo[userKey];
      let contact = contactsFirebase.find(user =>
        user.username.toLowerCase() === username.toLowerCase()
      );
      if (contact) {
        usersArray.push(contact);
      } else {
        usersToDeleteFromFirebase.push({
          taskKey: taskKey,
          userKey: userKey,
          username: username
        });
      }
    }
  }
  return usersArray;
}


/**
 * Opens the mobile navigation overlay and sets up the appropriate move options.
 * @param {number} taskIndex - Index of the selected task.
 * @param {string} condition - Current condition/status of the task.
 */
function mobileNavigator(taskIndex, condition) {
  document.getElementById("mobile_nav").classList.remove("d_none");
  currentDraggableTask = taskIndex;

  if (condition === "ToDo") {
    renderTextProg();
  } else if (condition === "inProgress") {
    renderTextFeedback();
  } else if (condition === "feedback") {
    renderTextDone();
  } else if (condition === "done") {
    renderTextBackFeedback();
  }
}


/**
 * Sets up UI to move task from ToDo to inProgress.
 */
function renderTextProg() {
  document.getElementById("arrow_down_text").innerHTML = "in Progress";
  document.getElementById("move_to_arrow_down").classList.remove("d_none");
  document.getElementById("move_to_arrow_down").setAttribute("onclick", "moveTo('inProgress')");
  openMoveToDialog();
}


/**
 * Sets up UI to move task from inProgress to feedback or back to ToDo.
 */
function renderTextFeedback() {
  document.getElementById("arrow_down_text").innerHTML = "Feedback";
  document.getElementById("arrow_up_text").innerHTML = "To-Do";
  document.getElementById("move_to_arrow_up").classList.remove("d_none");
  document.getElementById("move_to_arrow_down").classList.remove("d_none");
  document.getElementById("move_to_arrow_down").setAttribute("onclick", "moveTo('feedback')");
  document.getElementById("move_to_arrow_up").setAttribute("onclick", "moveTo('ToDo')");
  openMoveToDialog();
}


/**
 * Sets up UI to move task from done to feedback.
 */
function renderTextBackFeedback() {
  document.getElementById("arrow_up_text").innerHTML = "Feedback";
  document.getElementById("move_to_arrow_up").classList.remove("d_none");
  document.getElementById("move_to_arrow_up").setAttribute("onclick", "moveTo('feedback')");
  openMoveToDialog();
}


/**
 * Sets up UI to move task from feedback to done or back to inProgress.
 */
function renderTextDone() {
  document.getElementById("arrow_down_text").innerHTML = "Done";
  document.getElementById("arrow_up_text").innerHTML = "in Progress";
  document.getElementById("move_to_arrow_up").classList.remove("d_none");
  document.getElementById("move_to_arrow_down").classList.remove("d_none");
  document.getElementById("move_to_arrow_down").setAttribute("onclick", "moveTo('done')");
  document.getElementById("move_to_arrow_up").setAttribute("onclick", "moveTo('inProgress')");
  openMoveToDialog();
}


/**
 * Opens the move-to modal overlay for mobile navigation.
 */
function openMoveToDialog() {
  document.getElementById("moveTo_overlay").classList.remove("d_none");
  document.getElementById("mobile_nav").classList.remove("d_none");
  setTimeout(() => {
    document.getElementById("mobile_nav").classList.remove("overlay-container-sliding");
  }, 1);
  document.getElementById("body").classList.add("overflow-hidden");
  document.getElementById(`task_index_${currentDraggableTask}`).classList.add('dragging');
}


/**
 * Closes the move-to modal overlay.
 */
function closeMoveToDialog() {
  document.getElementById("mobile_nav").classList.add("overlay-container-sliding");
  setTimeout(() => {
    document.getElementById("moveTo_overlay").classList.add("d_none");
    document.getElementById("mobile_nav").classList.add("d_none");
  }, 100);
  document.getElementById("body").classList.remove("overflow-hidden");
  document.getElementById(`task_index_${currentDraggableTask}`).classList.remove('dragging');
  resetDisplayMovtoDialog();
}


/**
 * Hides all move-to arrows after dialog close.
 */
function resetDisplayMovtoDialog() {
  document.getElementById("move_to_arrow_up").classList.add("d_none");
  document.getElementById("move_to_arrow_down").classList.add("d_none");
}


function arrayAttachment(index, responseToJson, tasksKeysArray) {
  let attachments = [];
  if (responseToJson[tasksKeysArray[index]].attachment !== undefined) {
    let attachmentKeys = Object.keys(responseToJson[tasksKeysArray[index]].attachment);

    for (let indexAttachment = 0; indexAttachment < attachmentKeys.length; indexAttachment++) {
      attachments.push({
        fileName: responseToJson[tasksKeysArray[index]].attachment[attachmentKeys[indexAttachment]].fileName,
        fileType: responseToJson[tasksKeysArray[index]].attachment[attachmentKeys[indexAttachment]].fileType,
        base64: responseToJson[tasksKeysArray[index]].attachment[attachmentKeys[indexAttachment]].base64,
        size: responseToJson[tasksKeysArray[index]].attachment[attachmentKeys[indexAttachment]].size
      });
    }
  }
  return attachments;
}

function arrayAttachmentAfterEdit(taskIndex) {
  let attachments = [];
  if (tasks[taskIndex].attachment !== undefined) {
    let attachmentKeys = Object.keys(tasks[taskIndex].attachment);

    for (let indexAttachment = 0; indexAttachment < attachmentKeys.length; indexAttachment++) {
      attachments.push({
        fileName: tasks[taskIndex].attachment[attachmentKeys[indexAttachment]].fileName,
        fileType: tasks[taskIndex].attachment[attachmentKeys[indexAttachment]].fileType,
        base64: tasks[taskIndex].attachment[attachmentKeys[indexAttachment]].base64,
        size: tasks[taskIndex].attachment[attachmentKeys[indexAttachment]].size
      });
    }
  }
  return tasks[taskIndex].attachment = attachments;
}

