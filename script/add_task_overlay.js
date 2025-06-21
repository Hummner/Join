/**
 * Available added user for new tasks.
 * @type {number}
 */
let userCounter = 0;


/**
 * List of current subtasks.
 * @type {Array}
 */
let subtasks = [];


/**
 * Global index tracker for subtasks.
 * @type {number}
 */
let subtaskIndex = -1;


/**
 * Shows the clear button on the form.
 */
function addClearButtonToThePage() {
  document.getElementById("clear_button").classList.remove("d_none");
}


/**
 * Adds event listener to the task form submission.
 */
function addTaskButton() {
  document.getElementById("addTask_form").addEventListener("submit", addTask(condition = ""));
}


/**
 * Removes all visible error messages and styling.
 */
function removeErrorMsg() {
  document.querySelectorAll('.error-message').forEach(e => e.classList.remove('visible'));
  document.querySelectorAll('.error-border').forEach(e => e.classList.remove('error-border'));
  document.querySelectorAll('.error-label-border').forEach(e => e.classList.remove('error-label-border'));
}


/**
 * Returns the checked status of a subtask.
 * @param {number} taskIndex - Index of the task.
 * @param {number} subtaskIndex - Index of the subtask.
 * @returns {boolean} True if checked.
 */
function getCheckStatus(taskIndex, subtaskIndex) {
  const task = tasks?.[taskIndex];
  const subtask = task?.subtask?.[subtaskIndex];
  return !!subtask?.subtaskCheck;
}


/**
 * Extracts a subtask object from the input field.
 * @param {string} inputId - ID of the input field.
 * @param {number} taskIndex - Task index.
 * @param {number} i - Subtask index.
 * @returns {{name: string, checked: boolean}|null} Subtask object.
 */
function extractSubtask(inputId, taskIndex, i) {
  const input = document.getElementById(inputId);
  const value = input ? input.value.trim() : "";
  if (!value) return null;
  return {
    name: value,
    checked: getCheckStatus(taskIndex, i)
  };
}


/**
 * Toggles visibility of subtask icons depending on input presence.
 */
function showAddSubtaskButton() {
  let subtask = document.getElementById("subtask_input");

  if (subtask.value) {
    document.getElementById("delete_and_add_icon").classList.remove("d_none");
    document.getElementById("subtask_plus_icon").classList.add("d_none")
  } else {
    document.getElementById("delete_and_add_icon").classList.add("d_none");
    document.getElementById("subtask_plus_icon").classList.remove("d_none");
  }
}


/**
 * Adds a new subtask to the subtask list in the UI.
 */
function addSubtask() {
  let subtask = document.getElementById("subtask_input");
  let listRef = document.getElementById("sub_list");
  let subtaskValue = subtask.value;

  if (subtask.value) {
    subtaskIndex++;
    listRef.innerHTML += getSubtaskTemplate(subtaskIndex, subtaskValue);
    subtask.value = "";
    document.getElementById("delete_and_add_icon").classList.add("d_none");
    document.getElementById("subtask_plus_icon").classList.remove("d_none");
  }
}


/**
 * Shows edit/delete icons for a given subtask on hover/focus.
 * @param {number} indexSubTask - Index of the subtask.
 */
function showEditIcons(indexSubTask) {
  document.getElementById("edit_and_delete_icons_" + indexSubTask).classList.remove("opacity-null")
}


/**
 * Hides edit/delete icons for a given subtask.
 * @param {number} indexSubTask - Index of the subtask.
 */
function blindEditIcons(indexSubTask) {
  document.getElementById("edit_and_delete_icons_" + indexSubTask).classList.add("opacity-null")
}


/**
 * Enables editing of a subtask input field.
 * @param {number} indexSubTask - Index of the subtask.
 */
function editSubtask(indexSubTask) {
  let input = document.getElementById("editable_input_" + indexSubTask);
  const len = input.value.length;

  input.readOnly = false;
  input.setSelectionRange(len, len);
  input.focus();
  editSubtaskStyle(indexSubTask, input);
}


/**
 * Applies styles for subtask editing mode.
 * @param {number} indexSubTask - Index of the subtask.
 */
function editSubtaskStyle(indexSubTask) {
  let inputSubtask = document.getElementById("subtask_" + indexSubTask);
  let inputSubtaskChild = document.getElementById("list_subtask_element_" + indexSubTask);
  let editIcon = document.getElementById("edit_subtask_icon_" + indexSubTask);
  let editConfirmIcon = document.getElementById("confirm_edit_icon_" + indexSubTask);

  inputSubtaskChild.classList.add("edit-subtask-style");
  editIcon.classList.add("d_none");
  editConfirmIcon.classList.remove("d_none");
  inputSubtask.removeAttribute("onmouseover");
  inputSubtask.removeAttribute("onmouseout");
  inputSubtaskChild.classList.remove("list-subtask-element-hover");
  document.getElementById("edit_and_delete_icons_" + indexSubTask).classList.remove("opacity-null");
  document.getElementById("disc_" + indexSubTask).classList.add("d_none");
}


/**
 * Deletes a subtask if its content is empty.
 * @param {number} indexSubTask - Index of the subtask.
 */
function emptySubtaskDelete(indexSubTask) {
  let input = document.getElementById("editable_input_" + indexSubTask).value;

  if (!input) {
    removeSubtask(indexSubTask);
  }
}


/**
 * Finalizes the subtask input after editing.
 * @param {number} indexSubTask - Index of the subtask.
 */
function editSubmit(indexSubTask) {
  document.getElementById("editable_input_" + indexSubTask).readOnly = true;
  removeEditSubtaskStyle(indexSubTask);
}


/**
 * Restores original style after subtask editing is finished.
 * @param {number} indexSubTask - Index of the subtask.
 */
function removeEditSubtaskStyle(indexSubTask) {
  let inputSubtask = document.getElementById("subtask_" + indexSubTask);
  let inputSubtaskChild = document.getElementById("list_subtask_element_" + indexSubTask);
  let editIcon = document.getElementById("edit_subtask_icon_" + indexSubTask);
  let editConfirmIcon = document.getElementById("confirm_edit_icon_" + indexSubTask);

  inputSubtaskChild.classList.remove("edit-subtask-style");
  editIcon.classList.remove("d_none");
  editConfirmIcon.classList.add("d_none");
  inputSubtask.setAttribute("onmouseover", `showEditIcons(${indexSubTask})`);
  inputSubtask.setAttribute("onmouseout", `blindEditIcons(${indexSubTask})`);
  inputSubtaskChild.classList.add("list-subtask-element-hover");
  document.getElementById("edit_and_delete_icons_" + indexSubTask).classList.add("opacity-null")
  document.getElementById("disc_" + indexSubTask).classList.remove("d_none");
}


/**
 * Removes a subtask from the DOM.
 * @param {number} indexSubTask - Index of the subtask.
 * @param {number} taskIndex - (Optional) Task index (not used).
 */
function removeSubtask(indexSubTask, taskIndex) {
  document.getElementById("subtask_" + indexSubTask).remove();
}


/**
 * Clears all input fields and resets the UI for adding a new task.
 */
function clearAddTaskField() {
  userCounter = 0;
  clearInputsValues();
  document.getElementById("prio_medium").checked = true;
  unsetCheckbox();
  document.getElementById("user_logo_after_seleceted").innerHTML = '<div class="user-counter d_none" id="user_counter"></div>';
  document.getElementById("error-long").classList.add("d_none");
  clearSubtaskInput();
  successfulClearTask();
  userFeedback();
  renderUserList();
  clearAttachment();
}


/**
 * Clears the values of the main input fields used in the task form.
 */
function clearInputsValues() {
  document.getElementById("titel_input").value = "";
  document.getElementById("description_input").value = "";
  document.getElementById("date_input").value = "";
  document.getElementById("date_input_picker").value = "";
  document.getElementById("category_select_input").value = "";
}


/**
 * Clears the list of attached files and re-renders the preview area.
 */
function clearAttachment() {
  allFiles = [];
  renderPreviewImage();
}


/**
 * Clears all input fields for adding a task after a new task has been added.
 */
function clearAddTaskAfterAdd() {
  userCounter = 0;
  clearInputsValues();
  document.getElementById("prio_medium").checked = true;
  unsetCheckbox();
  document.getElementById("user_logo_after_seleceted").innerHTML = '<div class="user-counter d_none" id="user_counter"></div>';
  document.getElementById("error-long").classList.add("d_none");
  clearSubtaskInput();
  renderUserList();
  clearAttachment();
}


/**
 * Clears the subtask input field and subtask list.
 */
function clearSubtaskInput() {
  document.getElementById("subtask_input").value = "";
  document.getElementById("sub_list").innerHTML = "";
}


/**
 * Clears the subtask input field.
 */

function clearSubtaskInputField() {
  document.getElementById("subtask_input").value = "";
}


/**
 * Unchecks all user checkboxes in the user list.
 */
function unsetCheckbox() {
  for (let userIndex = 0; userIndex < contactsFirebase.length; userIndex++) {
    document.getElementById("user_" + userIndex).checked = false;
  }
}


/**
 * Shows success message after clearing the task form.
 */
function successfulClearTask() {
  let success = document.getElementById('success');
  success.innerHTML = showSuccessfulClear();
}


/**
 * Shows success message after a task was successfully added.
 */
function successfulAddedTask() {
  let success = document.getElementById('success');
  success.innerHTML = showSuccessfulAddedTask();
}


/**
 * Filters the user list by input and updates the visibility of matching users.
 */
function searchContactToTask() {
  const input = getSanitizedInput("assigned_select_input");
  const list = document.getElementById("add_user_list");
  let userFoundCounter = 0;

  for (let i = 0; i < contactsFirebase.length; i++) {
    const user = document.getElementById("user_" + i + "_label");
    if (!user) continue;
    const match = isUserMatch(i, input);
    userFoundCounter += updateUserVisibility(user, match, input);
  }

  checkUserFound(input, userFoundCounter, list);
}


/**
 * Gets sanitized (lowercased and trimmed) input from a field.
 * 
 * @param {string} id - The input field's ID.
 * @returns {string} The cleaned input string.
 */
function getSanitizedInput(id) {
  return document.getElementById(id).value.toLowerCase().replace(/\s+/g, "");
}


/**
 * Checks if the user's name matches the input.
 * 
 * @param {number} index - Index of the user in the contacts list.
 * @param {string} input - The sanitized input to match against.
 * @returns {boolean} True if the user's name matches.
 */
function isUserMatch(index, input) {
  const name = contactsFirebase[index].username.toLowerCase().replace(/\s+/g, "");
  return name.includes(input);
}


/**
 * Shows or hides a user element based on whether there's a match.
 * 
 * @param {HTMLElement} user - The user's label element.
 * @param {boolean} isMatch - Whether the user matches the search input.
 * @param {string} input - The original search input.
 * @returns {number} +1 if hidden, -1 if shown, 0 if input is empty.
 */
function updateUserVisibility(user, isMatch, input) {
  if (input === "") {
    user.classList.remove("d_none");
    return 0;
  }

  if (isMatch) {
    user.classList.remove("d_none");
    return -1;
  } else {
    user.classList.add("d_none");
    return 1;
  }
}
