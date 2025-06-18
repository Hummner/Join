/**
 * Loads the HTML and data needed to display the add-task overlay.
 * 
 * - Loads the HTML content for the task overlay.
 * - Loads contact data from Firebase.
 * - Renders the user list in the overlay.
 * 
 * @async
 * @function getAddTaskHTML
 */
async function getAddTaskHTML() {
  await Promise.all([
    loadHTML("add_task_overlay.html", "addTask_container"),
  ]);
  await loadContactsFromFirebase();
  renderUserList();
  datepicker();
  getFilepicker();
}


