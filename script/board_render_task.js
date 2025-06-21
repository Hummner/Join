/**
 * Renders all tasks into their corresponding status columns.
 */
function renderTaskInToColumn() {
  let columns = clearColumn();
  sortTask(columns);
  renderEmptyColumn();
  renderDragDropHighlights(columns);
}


/**
 * Sorts tasks by their condition and injects them into the correct columns.
 * @param {Object} columns - References to each column container in the DOM.
 */
function sortTask(columns) {
  for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
    let taskCondition = tasks[taskIndex].condition;
    if (taskCondition == "ToDo") {
      columns.toDoColumnRef.innerHTML += getTaskTemplate(taskIndex);
    } else if (taskCondition == "inProgress") {
      columns.inProgColumnRef.innerHTML += getTaskTemplate(taskIndex);
    } else if (taskCondition == "feedback") {
      columns.feedbackColumnRef.innerHTML += getTaskTemplate(taskIndex);
    } else if (taskCondition == "done") {
      columns.doneColumnRef.innerHTML += getTaskTemplate(taskIndex);
    }
    renderDetails(taskIndex);
  }
}


/**
 * Calls sub-functions to render specific task details.
 * @param {number} taskIndex - Index of the task to render.
 */
function renderDetails(taskIndex) {
  renderAssignedTo(taskIndex);
  renderSubtasks(taskIndex);
  renderPrio(taskIndex);
  renderCategoryColor(taskIndex);
}


/**
 * Renders empty placeholder messages for columns without visible tasks.
 */
function renderEmptyColumn() {
  let toDoColumnRef = document.getElementById("toDo_column");
  let inProgColumnRef = document.getElementById("inProg_column");
  let feedbackColumnRef = document.getElementById("feedback_column");
  let doneColumnRef = document.getElementById("done_column");

  checkAndRenderEmptyMessage(toDoColumnRef, "No task To do");
  checkAndRenderEmptyMessage(inProgColumnRef, "No task in Progress");
  checkAndRenderEmptyMessage(feedbackColumnRef, "No task waiting");
  checkAndRenderEmptyMessage(doneColumnRef, "No task is done");
}


/**
 * Renders the background color of a task based on its category.
 * @param {number} taskIndex - Index of the task.
 */
function renderCategoryColor(taskIndex) {
  let categoryRef = document.getElementById("task_category_" + taskIndex);
  let category = tasks[taskIndex].category;

  if (category === "Technical Task") {
    categoryRef.style.backgroundColor = "#1FD7C1";
  } else {
    categoryRef.style.backgroundColor = "#0038FF";
  }
}


/**
 * Renders the priority icon for the task.
 * @param {number} taskIndex - Index of the task.
 */
function renderPrio(taskIndex) {
  let prioRef = document.getElementById("task_prio_user_" + taskIndex);
  let taskPrio = tasks[taskIndex].priority;

  if (taskPrio === "low") {
    prioRef.src = "/assets/img/icon/prio_low.svg";
  } else if (taskPrio === "medium") {
    prioRef.src = "/assets/img/icon/prio_medium.svg";
  } else if (taskPrio === "urgent") {
    prioRef.src = "/assets/img/icon/prio_urgent.svg";
  }
}


/**
 * Renders the subtask progress bar and value for a task.
 * @param {number} taskIndex - Index of the task.
 */
function renderSubtasks(taskIndex) {
  let subtaskProgressBar = document.getElementById("subtasks_user_" + taskIndex);
  let subtaskMaxRef = document.getElementById("subtask_max_user_" + taskIndex);
  let subtaskMax = tasks[taskIndex].subtask.length;
  let subtaskValueRef = document.getElementById("subtask_value_user_" + taskIndex);
  let subtaskValue = subtaskProgressBar.value;
  subtaskProgressBar.setAttribute("max", subtaskMax);
  if (subtaskMax) {
    subtaskMaxRef.innerHTML = subtaskMax;
  }
  subtaskValue = checkedSubtaskChecked(taskIndex, subtaskMax);
  if (subtaskValue > 0) {
    subtaskProgressBar.setAttribute("value", subtaskValue);
    subtaskValueRef.innerHTML = subtaskValue;
  }
  checkSubtaskLenght(taskIndex, subtaskMax)
}


/**
 * Checks if a task has a defined maximum number of subtasks and clears the progress container if not.
 *
 * @param {number|string} taskIndex - The index or identifier of the task, used to target the container element.
 * @param {number} subtaskMax - The maximum number of subtasks for the task. If falsy, the progress is cleared.
 */
function checkSubtaskLenght(taskIndex, subtaskMax) {
  if (!subtaskMax) {
    document.getElementById("progress_container_" + taskIndex).innerHTML = "";
  }
}


/**
 * Renders avatars or user labels assigned to a task.
 * @param {number} taskIndex - Index of the task.
 * @returns {string} HTML content inserted into the task user list.
 */
function renderAssignedTo(taskIndex) {
  let userListRef = document.getElementById("task_users_" + taskIndex);
  let userList = tasks[taskIndex].assignedTo;
  userCounterFromTask = userList.length

  if (userCounterFromTask <= 4 && userCounterFromTask != 0) {
    for (let indexUser = 0; indexUser < userList.length; indexUser++) {
      userListRef.innerHTML += getUserInTaskTemplate(indexUser, userList);
    }
  } else if (userCounterFromTask > 4) {
    for (let indexUser = 0; indexUser < 3; indexUser++) {
      userListRef.innerHTML += getUserInTaskTemplate(indexUser, userList);
    }
    renderCounterElement(userListRef, userCounterFromTask);
  } else {
    userListRef.innerHTML = "<span style='opacity: 0.2'>No User added</span>";
  }
  return userListRef.innerHTML;
}


/**
 * Adds invisible drop targets to each column for drag-and-drop support.
 * @param {Object} columns - The task columns DOM references.
 */
function renderDragDropHighlights(columns) {
  columns.toDoColumnRef.innerHTML += "<div id='empty_task_toDo' class='empty-task d_none'></div>";
  columns.inProgColumnRef.innerHTML += "<div id='empty_task_inProg' class='empty-task d_none'></div>";
  columns.feedbackColumnRef.innerHTML += "<div id='empty_task_feedback' class='empty-task d_none'></div>";
  columns.doneColumnRef.innerHTML += "<div id='empty_task_done' class='empty-task d_none'></div>";
}


/**
 * Renders a single edited task into the correct column in the board view.
 * 
 * @param {number} taskIndex - Index of the task to render.
 */
function renderSingleTaskInToColumn(taskIndex) {
  selectConditionForSingleTask(taskIndex);
  renderAssignedTo(taskIndex);
  renderSubtasks(taskIndex);
  renderPrio(taskIndex);
  renderCategoryColor(taskIndex);
}


/**
 * Selects the correct column for a task and sets its HTML content.
 * 
 * @param {number} taskIndex - Index of the task.
 */
function selectConditionForSingleTask(taskIndex) {
  const taskRef = document.getElementById(`task_index_${taskIndex}`);
  taskRef.innerHTML = getSingleTaskAfterEdit(taskIndex);
}


/**
 * Displays user feedback after a task has been added, based on a URL parameter.
 * 
 * If the URL contains the query parameter `?feedback=taskAdded`,
 * it triggers feedback functions and then removes the parameter from the URL
 * to prevent repeated feedback on page reload.
 * 
 * Example URL: board.html?feedback=taskAdded
 */
function userFeedbackAfterAddTaskPage() {
  const params = new URLSearchParams(window.location.search);


  if (params.get("feedback") === "taskAdded") {
    successfulAddedTask();
    userFeedback();
    debugger
    params.delete("feedback");
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }
}