let flatpickrInstance;


/**
 * Opens the task overlay for the given task.
 * @param {number} taskIndex - Index of the task to display.
 */
function openOverlayTask(taskIndex) {
    document.getElementById("board_overlay").classList.remove("d_none");
    document.getElementById("overlay_container").classList.remove("d_none");
    setTimeout(() => {
        document.getElementById("overlay_container").classList.remove("overlay-container-sliding");
    }, 1);
    document.getElementById("body").classList.add("overflow-hidden");
    creatOverlayFromTask(taskIndex);
}


/**
 * Populates the overlay with task details.
 * @param {number} taskIndex - Task index.
 */
function creatOverlayFromTask(taskIndex) {
    document.getElementById("overlay_titel").innerHTML = tasks[taskIndex].title;
    document.getElementById("overlay_description").innerHTML = tasks[taskIndex].descripton;
    document.getElementById("overlay_date").innerHTML = dateForm(taskIndex);
    renderUserIntoTaskOverlay(taskIndex);
    renderSubtaskIntoTaskOverlay(taskIndex);
    renderPrioIntoTaskOverlay(taskIndex);
    renderCategoryIntoTaskOverlay(taskIndex);
    renderButtons(taskIndex);
    renderAttachments(taskIndex);
}


/**
 * Adds edit and delete handlers to the overlay buttons.
 * @param {number} taskIndex - Task index.
 */
function renderButtons(taskIndex) {
    let deleteTask = document.getElementById("delete_task_on_overlay");
    let editTask = document.getElementById("edit_task_on_overlay");
    deleteTask.setAttribute("onclick", `deleteTaskOnOverlay(${taskIndex})`);
    editTask.setAttribute("onclick", `editTaskOnOverlay(${taskIndex})`);
}


/**
 * Displays the category in the overlay and applies color coding.
 * @param {number} taskIndex - Task index.
 */
function renderCategoryIntoTaskOverlay(taskIndex) {
    let categoryRef = document.getElementById("overlay_category_ticket");
    let category = tasks[taskIndex].category;
    categoryRef.innerHTML = category;
    categoryRef.style.backgroundColor = category === "Technical Task" ? "#1FD7C1" : "#0038FF";
}


/**
 * Displays the task priority and its corresponding icon.
 * @param {number} taskIndex - Task index.
 */
function renderPrioIntoTaskOverlay(taskIndex) {
    let prioImg = document.getElementById("task_overlay_prio_img");
    let prioTask = document.getElementById("task_overlay_prio_text");
    let prio = tasks[taskIndex].priority;
    prioTask.innerHTML = prio;
    prioImg.src = `/assets/img/icon/prio_${prio}.svg`;
}


/**
 * Displays the subtasks list in the overlay.
 * @param {number} taskIndex - Task index.
 */
function renderSubtaskIntoTaskOverlay(taskIndex) {
    let subtaskListRef = document.getElementById("task_overlay_subtask_list");
    let subtaskList = tasks[taskIndex].subtask;
    subtaskListRef.innerHTML = "";

    if (subtaskList.length) {
        for (let i = 0; i < subtaskList.length; i++) {
            subtaskListRef.innerHTML += getTaskSubtaskOverlayTemplate(taskIndex, i);
        }
    } else {
        subtaskListRef.innerHTML = "<span style='opacity: 0.2; font-size: 16px'>No Subtask added</span>";
    }
    checkCheckboxInOverlay(taskIndex, subtaskList);
}


/**
 * Applies checked state to subtask checkboxes in overlay.
 * @param {number} taskIndex - Task index.
 * @param {Array} subtaskList - List of subtasks.
 */
function checkCheckboxInOverlay(taskIndex, subtaskList) {
    for (let i = 0; i < subtaskList.length; i++) {
        document.getElementById(`task_${taskIndex}_checkbox_${i}`).checked = !!subtaskList[i].subtaskCheck;
    }
}


/**
 * Renders assigned users into the task overlay.
 * @param {number} taskIndex - Task index.
 */
function renderUserIntoTaskOverlay(taskIndex) {
    let taskUsers = tasks[taskIndex].assignedTo;
    let taskUsersTableRef = document.getElementById("task_overlay_user_list");
    taskUsersTableRef.innerHTML = "";

    if (taskUsers.length) {
        for (let i = 0; i < taskUsers.length; i++) {
            taskUsersTableRef.innerHTML += getTaskUsersOverlayTemplate(taskIndex, i);
        }
    } else {
        taskUsersTableRef.innerHTML = "<span style='opacity: 0.2; font-size: 16px'>No User added</span>";
    }
}


/**
 * Closes the task overlay with animation and resets scroll.
 */
function closeOverlayTask() {
    document.getElementById("overlay_container").classList.add("overlay-container-sliding");
    setTimeout(() => {
        document.getElementById("board_overlay").classList.add("d_none");
        document.getElementById("overlay_container").classList.add("d_none");
    }, 100);
    document.getElementById("body").classList.remove("overflow-hidden");
    getTaskOverlayHTML();
}


/**
 * Opens the edit form overlay for a specific task.
 * @async
 * @param {number} taskIndex - The index of the task to edit.
 */
async function editTaskOnOverlay(taskIndex) {
    document.getElementById("add_container").innerHTML = "";
    await getEditTaskHTML();
    fitEditTaskToContainer();
    renderUserList();
    datepicker();
    currentInputFieldvalue(taskIndex);
}


/**
 * Adjusts the edit task form layout for the overlay.
 */
function fitEditTaskToContainer() {
    document.getElementById("addTask_headline_h1").classList.add("d_none");
    document.getElementById("spaceholder").classList.add("d_none");
    document.getElementById("addTask_form_container").classList.add("flex-direction");
    document.getElementById("edit_scrolling").classList.add("scrolling");
    document.getElementById("addTask_form_container").classList.add("height-unset");
    document.getElementById("close_edit_task_overlay").classList.remove("d_none");
    document.getElementById("addTask_form_container").classList.add("overflow-hidden");
    document.getElementById("addTask_prio").classList.add("gap-8");
    document.getElementById("assigned_select_dropdown_menu").classList.add("unclickable");
    document.getElementById("addTask_left_side").classList.add("width-100");
    document.getElementById("addTask_right_side").classList.add("width-100");
}


/**
 * Fills the edit form fields with the current task data.
 * @param {number} taskIndex - Index of the task to populate.
 */
function currentInputFieldvalue(taskIndex) {
    document.getElementById("titel_input").value = tasks[taskIndex].title;
    document.getElementById("description_input").value = tasks[taskIndex].descripton;
    document.getElementById("date_input").value = getDate(taskIndex);
    checkPrio(taskIndex);
    checkAssignedTo(taskIndex);
    checkAttachment(taskIndex);
    checkCategory(taskIndex);
    checkSubtasks(taskIndex);
    renderEditButton(taskIndex);
}


/**
 * Fills the date form fields with the current date.
 * @param {number} taskIndex - Index of the task to populate.
 */
function getDate(taskIndex) {
    const defaultDate = tasks[taskIndex].date;
    const dateFromTask = new Date(defaultDate);
    const today = new Date();
    let hiddenInput = document.getElementById("date_input").value


    if (flatpickrInstance) {
        flatpickrInstance.setDate(dateFromTask, true);

        let expiredDate = document.getElementById("expired_date");

        if (expiredDate) {
            expiredDate.classList.add("d_none");
        }

        hiddenInput = defaultDate;
    }

    if (dateFromTask < today) {
        document.getElementById("expired_date").classList.remove("d_none");
    }

    return hiddenInput
}


/**
 * Configures the form to handle task editing instead of adding.
 * @param {number} taskIndex - Index of the task being edited.
 */
function renderEditButton(taskIndex) {
    let formSubmit = document.getElementById("addTask_form");
    let editButton = document.getElementById("edit_button");
    let addButton = document.getElementById("add_button");
    let clearButton = document.getElementById("clear_button");

    clearButton.classList.add("d_none");
    addButton.classList.add("d_none");
    editButton.classList.remove("d_none");
    formSubmit.removeAttribute("onsubmit")
    formSubmit.setAttribute("onsubmit", `addEditedTask(${taskIndex}); return false`);
}


/**
 * Displays existing subtasks in the edit form.
 * @param {number} taskIndex - Index of the task.
 */
function checkSubtasks(taskIndex) {
    let subtaskListRef = document.getElementById("sub_list");
    let subtaskList = tasks[taskIndex].subtask;
    subtaskIndex = subtaskList.length;
    subtaskListRef.innerHTML = "";
    for (let indexCheckSubtask = 0; indexCheckSubtask < subtaskList.length; indexCheckSubtask++) {
        let subtaskCheckValue = subtaskList[indexCheckSubtask].subtaskName;
        subtaskListRef.innerHTML += getSubtaskTemplate(indexCheckSubtask, subtaskCheckValue, taskIndex)
    }
}


/**
 * Selects the task's category in the dropdown.
 * @param {number} taskIndex - Index of the task.
 */
function checkCategory(taskIndex) {
    let category = tasks[taskIndex].category;
    selectCategory(category);
}


/**
 * Checks the corresponding priority radio button.
 * @param {number} taskIndex - Index of the task.
 */
function checkPrio(taskIndex) {
    const prio = tasks[taskIndex].priority;
    const prioIds = ["urgent", "medium", "low"];

    prioIds.forEach(level => {
        document.getElementById(`prio_${level}`).checked = (level === prio);
    });
}


/**
 * Checks assigned users and highlights them in the dropdown.
 * @param {number} taskIndex - Index of the task.
 */
function checkAssignedTo(taskIndex) {
    userCounter = 0;
    let checkedUsers = tasks[taskIndex].assignedTo;
    let ids = [];

    for (let index = 0; index < checkedUsers.length; index++) {
        let username = tasks[taskIndex].assignedTo[index]
        let user = contactsFirebase.indexOf(username)
        ids.push(user);
        ;
    }
    for (let index = 0; index < ids.length; index++) {
        const userIndex = ids[index];
        let checkbox = document.getElementById("user_" + userIndex);
        checkbox.checked = true;
        addCheckedUsers(userIndex);
        checkedStyle(userIndex);
    }
}


/**
 * Deletes a task from Firebase and updates the UI.
 * @async
 * @param {number} taskIndex - Index of the task to delete.
 */
async function deleteTaskOnOverlay(taskIndex) {
    let task = tasks[taskIndex].id
    let path = "join/tasks/";
    await fetch(BASE_URL + path + task + ".json", {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    deleteTaskFromTaskArray(taskIndex)
    renderTaskInToColumn();
    closeOverlayTask();
    successfulTaskDeleted();
    userFeedback();
}


/**
 * Shows a visual success message after deleting a task.
 */
function successfulTaskDeleted() {
    let success = document.getElementById('success');
    success.innerHTML = showTaskDeleted();
}


/**
 * Removes the task from the local array.
 * @param {number} taskIndex - Index of the task to remove.
 */
function deleteTaskFromTaskArray(taskIndex) {
    tasks.splice(taskIndex, 1);
}


function dateForm(taskIndex) {
    let firebaseDate = tasks[taskIndex].date
    const [year, month, day] = firebaseDate.split("-");

    const timeEl = document.getElementById("overlay_date");
    timeEl.setAttribute("datetime", firebaseDate);

    return timeEl.textContent = `${day}/${month}/${year}`;
}

function renderAttachments(taskIndex) {
    let gallery = document.getElementById('ticket_gallery');
    gallery.innerHTML = "";

    if (tasks[taskIndex].attachment.length > 0) {
        tasks[taskIndex].attachment.forEach((att, index) => {
            gallery.innerHTML += getImagePreviewTicketTemplate(att.fileName, att.base64, index, att.size);
        })
    } else {
        gallery.innerHTML = "<span style='opacity: 0.2; font-size: 16px'>No attachment added</span>";
    }
}

function checkAttachment(taskIndex) {
    let gallery = document.getElementById('gallery_upload');
    if (!tasks[taskIndex].attachment.length > 0) return;
    allFiles = [];
    allFiles = tasks[taskIndex].attachment;
    gallery.innerHTML = "";
    allFiles.forEach((att, index) => {
        gallery.innerHTML += getImagePreviewEditTemplate(att.fileName, att.base64, index, taskIndex, att.size);
    })
}

