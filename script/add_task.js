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


/**
 * Initializes a flatpickr date picker on the element with ID "date_input_picker".
 * Sets locale to English, enforces "day/month/year" format, disables past dates, 
 * and ensures mobile-friendly behavior is turned off. On date selection, the value 
 * is transformed to ISO format and assigned to a hidden input.
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


