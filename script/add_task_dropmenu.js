/**
 * Opens the user selection dropdown menu.
 */
function openUserDropMenu() {
  document.getElementById("dropdown_menu_arrow").classList.add("rotate-img");
  document.getElementById("assigned_select").classList.add("blue-border");
  document.getElementById("add_user_list").classList.add("dropdown-animation-user");
  document.getElementById("assigned_select").classList.add("border-radius-custom");
  document.getElementById("list_overlay").classList.remove("d_none");
  document.getElementById("list_overlay").scrollIntoView({ behavior: "smooth", block: "center" });
}


/**
 * Closes the user selection dropdown menu.
 */
function closeUserDropMenu() {
  document.getElementById("dropdown_menu_arrow").classList.remove("rotate-img");
  document.getElementById("assigned_select").classList.remove("blue-border");
  document.getElementById("add_user_list").classList.remove("dropdown-animation-user");
  document.getElementById("assigned_select").classList.remove("border-radius-custom");
  document.getElementById("list_overlay").classList.add("d_none");
}


/**
 * Sorts the user list alphabetically by username.
 */
function resortUserlist() {
  contactsFirebase.sort((a, b) =>
    a.username.localeCompare(b.username, 'de', { sensitivity: 'base' })
  );
}


/**
 * Renders the user list into the dropdown menu.
 */
function renderUserList() {
  resortUserlist();
  const usersListRef = document.getElementById("add_user_list");
  usersListRef.innerHTML = "";
  for (let i = 0; i < contactsFirebase.length; i++) {
    usersListRef.innerHTML += getUserListTemplate(i);
  }
}


/**
 * Adds or removes a user's avatar after selection.
 * @param {number} indexUsers - Index of the selected user.
 */
function addCheckedUsers(indexUsers) {
  const avatarList = document.getElementById("user_logo_after_seleceted");
  const userCheckbox = document.getElementById("user_" + indexUsers);

  if (userCheckbox.checked) {
    handleUserChecked(indexUsers, avatarList);
  } else {
    handleUserUnchecked(indexUsers, avatarList);
  }
}


/**
 * Handles the UI logic when a user is checked (selected).
 * @param {number} index - Index of the selected user.
 * @param {HTMLElement} avatarList - The container for selected user avatars.
 */
function handleUserChecked(index, avatarList) {
  userCounter++;
  toggleLabelHoverEffect(index, false);
  if (checkAvatarAmount(avatarList)) return;
  insertUserAvatar(index, avatarList);
}


/**
 * Handles the UI logic when a user is unchecked (deselected).
 * @param {number} index - Index of the unselected user.
 * @param {HTMLElement} avatarList - The container for selected user avatars.
 */
function handleUserUnchecked(index, avatarList) {
  userCounter--;
  removeUserAvatar(index);
  toggleLabelHoverEffect(index, true);
  checkAvatarAmount(avatarList);
}


/**
 * Toggles the hover effect on the user label.
 * @param {number} index - Index of the user.
 * @param {boolean} add - Whether to add or remove the effect.
 */
function toggleLabelHoverEffect(index, add) {
  const label = document.getElementById("user_" + index + "_label");
  label.classList.toggle("user-dropmenu-hover-effekt", add);
}


/**
 * Inserts the avatar of the selected user before the user counter.
 * @param {number} index - Index of the user.
 * @param {HTMLElement} avatarList - The avatar container element.
 */
function insertUserAvatar(index, avatarList) {
  const userCounterRef = document.getElementById("user_counter");
  const avatarElement = document.createElement("div");
  avatarElement.innerHTML = getCheckedAvatar(index);
  avatarList.insertBefore(avatarElement.firstChild, userCounterRef);
}


/**
 * Removes the avatar of the unselected user.
 * @param {number} index - Index of the user.
 */
function removeUserAvatar(index) {
  const userAvatar = document.getElementById("user_checked_" + index);
  userAvatar?.remove();
}


/**
 * Displays a user counter if there are more than 4 avatars.
 * 
 * If the total number of users (userCounter) exceeds 4, the function shows
 * a counter element (`user_counter`) indicating how many additional users exist.
 * Otherwise, the counter is hidden.
 * @returns {boolean} Returns true if more than 4 users are present; otherwise false.
 */
function checkAvatarAmount() {
  let userCounterRef = document.getElementById("user_counter");

  if (userCounter > 4) {
    let avatarCounter = (userCounter - 4);
    userCounterRef.classList.remove("d_none");
    userCounterRef.innerHTML = `<span>+${avatarCounter}`;
    return true;
  } else {
    userCounterRef.classList.add("d_none");
    return false;
  }
}


/**
 * Toggles the category dropdown open/closed.
 */
function openCatDropMenu() {
  document.getElementById("dropdown_menu_arrow_select").classList.add("rotate-img");
  document.getElementById("category_input").classList.add("blue-border");
  document.getElementById("category_list").classList.add("dropdown-animation");
  document.getElementById("overlay_category").classList.remove("d_none");
}


/**
 * Closes the category dropdown menu.
 */
function closeCatDropMenu() {
  document.getElementById("dropdown_menu_arrow_select").classList.remove("rotate-img");
  document.getElementById("category_input").classList.remove("blue-border");
  document.getElementById("category_list").classList.remove("dropdown-animation");
  document.getElementById("overlay_category").classList.add("d_none");
}


/**
 * Sets the selected category and closes dropdown.
 * @param {string} category - The selected category.
 */
function selectCategory(category) {
  const input = document.getElementById("category_select_input");
  input.value = category;
  input.parentElement.classList.remove("error-label-border");
  document.getElementById("error-cat").classList.remove("visible");
  closeCatDropMenu();
}


/**
 * Adds highlight border to subtask input.
 */
function addBorder() {
  document.getElementById("subtask_input_label").classList.add("blue-border");
}


/**
 * Removes highlight border from subtask input.
 */
function removeBorder() {
  document.getElementById("subtask_input_label").classList.remove("blue-border");
}