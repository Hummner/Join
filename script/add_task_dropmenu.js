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
  const userAvatar = document.getElementById("user_checked_" + indexUsers);
  const userCounterRef = document.getElementById("user_counter");

  if (userCheckbox.checked) {
    userCounter++;
    document.getElementById("user_" + indexUsers + "_label").classList.remove("user-dropmenu-hover-effekt");
    if (checkAvatarAmount(avatarList)) return
    const avatarElement = document.createElement("div");
    avatarElement.innerHTML = getCheckedAvatar(indexUsers);
    avatarList.insertBefore(avatarElement.firstChild, userCounterRef);
  } else {
    userCounter--;
    userAvatar?.remove();
    document.getElementById("user_" + indexUsers + "_label").classList.add("user-dropmenu-hover-effekt");
    checkAvatarAmount(avatarList)
  }
}


/**
 * Displays a user counter if there are more than 4 avatars.
 * 
 * If the total number of users (userCounter) exceeds 4, the function shows
 * a counter element (`user_counter`) indicating how many additional users exist.
 * Otherwise, the counter is hidden.
 * 
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