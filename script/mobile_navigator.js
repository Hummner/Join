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