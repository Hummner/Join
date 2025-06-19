/**
 * Generates the full HTML template for a draggable task card.
 * 
 * @param {number} taskIndex - Index of the task in the task list.
 * @returns {string} - HTML string for the task card.
 */
function getTaskTemplate(taskIndex) {
    return `<div draggable="true" id="task_index_${taskIndex}" class="task" ondragstart="startDragging(${taskIndex}); addHighlight()" ondragend="removeHighlight()" onclick="openOverlayTask(${taskIndex})">
                <div class="task-cat-technical">
                    <p id="task_category_${taskIndex}">${tasks[taskIndex].category}</p>
                    <img class="mobile-button" src="/assets/img/icon/mobile_button.svg" onclick="event.stopPropagation(); mobileNavigator(${taskIndex}, '${tasks[taskIndex].condition}')">
                </div>
                <div class="task-title"><span class="task-title">${tasks[taskIndex].title}</span></div>
                <div class="task-description"><span>${tasks[taskIndex].descripton}</span></div>
                <div class="progress" id="progress_container_${taskIndex}">
                    <progress id="subtasks_user_${taskIndex}" max="" value="0"></progress>
                        <span class="subtask" id="subtask_text_user_${taskIndex}"><span id="subtask_value_user_${taskIndex}">0</span>/<span id="subtask_max_user_${taskIndex}">0</span><span class="subtask-text">&nbsp;Subtasks</span></span>
                </div>
                <div class="task-footer">
                    <div id="task_users_${taskIndex}" onload="renderAssignedTo(${taskIndex})"class="task-users">
                        
    
                    </div>
                    <div class="priority">
                        <img id="task_prio_user_${taskIndex}" src="/assets/img/icon/prio_medium.svg" alt="">
                    </div>
                </div>
            </div>`
}


/**
 * Returns the HTML structure of a task after it has been edited.
 * 
 * @param {number} taskIndex - Index of the task to render.
 * @returns {string} - HTML string for the updated task.
 */
function getSingleTaskAfterEdit(taskIndex) {
    return `<div class="task-cat-technical">
                    <p id="task_category_${taskIndex}">${tasks[taskIndex].category}</p>
                </div>
                <div class="task-title"><span class="task-title">${tasks[taskIndex].title}</span></div>
                <div class="task-description"><span>${tasks[taskIndex].descripton}</span></div>
                <div class="progress" id="progress_container_${taskIndex}">
                    <progress id="subtasks_user_${taskIndex}" max="" value="0"></progress>
                        <span id="subtask_text_user_${taskIndex}"><span id="subtask_value_user_${taskIndex}">0</span>/<span id="subtask_max_user_${taskIndex}">0</span> Subtasks</span>
                </div>
                <div class="task-footer">
                    <div id="task_users_${taskIndex}" onload="renderAssignedTo(${taskIndex})"class="task-users">
                        
    
                    </div>
                    <div class="priority">
                        <img id="task_prio_user_${taskIndex}" src="/assets/img/icon/prio_medium.svg" alt="">
                    </div>
                </div>`
}


/**
 * Returns the HTML for a user avatar inside a task.
 * 
 * @param {number} indexUser - Index of the user in the user list.
 * @param {Array} userList - List of user objects.
 * @returns {string} - HTML string for user avatar.
 */
function getUserInTaskTemplate(indexUser, userList) {
    return `<div class="user" style="background-color:${userList[indexUser].color}">${userList[indexUser].avatar}</div>`
}


/**
 * Generates the HTML for an individual subtask inside a task.
 * 
 * @param {number} indexSubTask - Index of the subtask.
 * @param {string} subtaskValue - Text content of the subtask.
 * @param {number} taskIndex - Index of the parent task.
 * @returns {string} - HTML string for the subtask.
 */
function getSubtaskTemplate(indexSubTask, subtaskValue, taskIndex) {
    return `<div id="subtask_${indexSubTask}" class="list-element-div" ondblclick="editSubtask(${indexSubTask})" onmouseover="showEditIcons(${indexSubTask})" onmouseout="blindEditIcons(${indexSubTask})"><div class="list-subtask-element list-subtask-element-hover" id="list_subtask_element_${indexSubTask}"><div class="disc-with-input"><span style="margin-right: 8px" id="disc_${indexSubTask}">&#9679;</span> <input id="editable_input_${indexSubTask}" readonly onkeydown="checkEnterEditSubtask(event, ${indexSubTask})" onchange="emptySubtaskDelete(${indexSubTask})" onblur="editSubmit(${indexSubTask})" value="${subtaskValue}"></div><div id="edit_and_delete_icons_${indexSubTask}"  class="delete-and-add-icon opacity-null margin-left"><img src="/assets/img/icon/edit.svg" ondblclick="event.stopPropagation()" id="edit_subtask_icon_${indexSubTask}" onclick="editSubtask(${indexSubTask})"><img id="confirm_edit_icon_${indexSubTask}" src="/assets/img/icon/check_subtask.svg" class="d_none" ondblclick="event.stopPropagation()" onclick="editSubmit(${indexSubTask})">
    <div class="placholder-for-icons"></div><img src="/assets/img/icon/delete.svg" ondblclick="event.stopPropagation()" onclick="removeSubtask(${indexSubTask}, ${taskIndex})" alt=""></div></div></div>`
}


/**
 * Generates the HTML for a user selection item in the user dropdown.
 * 
 * @param {number} indexUsers - Index of the user in the contacts list.
 * @returns {string} - HTML string for the user dropdown item.
 */
function getUserListTemplate(indexUsers) {
    return `<label for="user_${indexUsers}" id="user_${indexUsers}_label" class="user-dropmenu" onclick="checkedStyle(${indexUsers})">
                <div class="user-logo-container">
                    <div id="avatar_user_${indexUsers}" class="user-logo-small" style="background-color:${contactsFirebase[indexUsers].color}">${contactsFirebase[indexUsers].avatar}</div>
                    <span class="margin-left-24">${contactsFirebase[indexUsers].username}</span>
                </div>
                <input id="user_${indexUsers}" type="checkbox" class="checkbox" onclick="addCheckedUsers(${indexUsers})">
                <label for="user_${indexUsers}"><img src="/assets/img/icon/checkbox.svg" alt=""></label>
            </label>`
}


/**
 * Returns the HTML for a checked avatar in the selected user list.
 * 
 * @param {number} indexUsers - Index of the user in the contacts list.
 * @returns {string} - HTML string for the avatar.
 */
function getCheckedAvatar(indexUsers) {
    return `<div id="user_checked_${indexUsers}" class="user-logo-small no-margin" style="background-color:${contactsFirebase[indexUsers].color}">${contactsFirebase[indexUsers].avatar}</div>`
    
}


/**
 * Generates HTML for a user in the task overlay view.
 * 
 * @param {number} taskIndex - Index of the task.
 * @param {number} indexUser - Index of the assigned user.
 * @returns {string} - HTML string for the user row.
 */
function getTaskUsersOverlayTemplate(taskIndex, indexUser) {
    return `<tr>
                <td>
                    <div class="user overlay-user" style="background-color: ${tasks[taskIndex].assignedTo[indexUser].color}">${tasks[taskIndex].assignedTo[indexUser].avatar}</div>
                </td>
                <td>${tasks[taskIndex].assignedTo[indexUser].username}</td>
            </tr>`
}


/**
 * Returns the HTML structure of a subtask shown in the overlay.
 * 
 * @param {number} taskIndex - Index of the task.
 * @param {number} indexSubtask - Index of the subtask.
 * @returns {string} - HTML string for the subtask with a checkbox.
 */
function getTaskSubtaskOverlayTemplate(taskIndex, indexSubtask) {
    return `<label for="task_${taskIndex}_checkbox_${indexSubtask}" class="subtask-overlay">
                <input type="checkbox" class="checkbox" id="task_${taskIndex}_checkbox_${indexSubtask}" onclick="addSubtaskChecked(${indexSubtask}, ${taskIndex})" >
                <div for="task_${taskIndex}_checkbox_${indexSubtask}" class="subtask-img"><img src="/assets/img/icon/checkbox.svg" alt=""></div>
            
                <div class="subtask-label">${tasks[taskIndex].subtask[indexSubtask].subtaskName}</div>
            </label>`  
}


/**
 * Displays feedback when a task has been cleared successfully.
 * 
 * @returns {string} - HTML string for the feedback.
 */
function showSuccessfulClear() {
    return `<p>Task successfully cleared! </p><img src="/assets/img/icon/close_white.svg">`;
}


/**
 * Displays feedback when a task is added successfully.
 * 
 * @returns {string} - HTML string for the feedback.
 */
function showSuccessfulAddedTask() {
    return `<p>Task added to board! </p><img class="feedback-img" src="/assets/img/icon/board_icon.svg">`;
}


/**
 * Displays feedback when there is an error adding a task.
 * 
 * @returns {string} - HTML string for the error feedback.
 */
function showErrorAddedTask() {
    return `<p>There was an error saving the data</p><img class="feedback-img" src="/assets/img/icon/close_white.svg">`;
}


/**
 * Displays feedback when a task is deleted.
 * 
 * @returns {string} - HTML string for the feedback.
 */

function showTaskDeleted() {
    return `<p>Task deleted successfully!</p><img class="feedback-img" src="/assets/img/icon/delete.svg">`;
}

function getImagePreviewTemplate(fileName, url, fileIndex, size) {
    return `      <div class="image-preview" onmouseenter="showDeleteIcon(${fileIndex})" onmouseleave="hideDeleteIcon(${fileIndex})" id="preview_image_${fileIndex}">
                        <div class="image-preview-hover d_none" id="image_preview_hover_${fileIndex}" onclick="renderImageViewer('gallery_upload', ${fileIndex})">
                            <div class="icon-container id="icon_container_${fileIndex}">
                                <img src="/assets/img/icon/delete.svg" onclick="deletePreviewImage(${fileIndex});" alt="">
                            </div>
                            
                        </div>
                        <img src="${url}" class="upload-index-img"  alt="${fileName}, ${size} kB">
                        <span>${fileName}</span>
                    </div>`
}

function getImagePreviewTicketTemplate(fileName, url, fileIndex, size) {
    return `      <div class="image-preview" onmouseenter="showDeleteIcon(${fileIndex})" onmouseleave="hideDeleteIcon(${fileIndex})" id="preview_image_${fileIndex}">
                        <div class="image-preview-hover d_none" id="image_preview_hover_${fileIndex}" onclick="renderImageViewer('ticket_gallery', ${fileIndex})">
                            <div class="icon-container">
                                <a href="${url}" download="${fileName}"><img src="/assets/img/icon/cloud_download.png" alt=""></a>
                            </div>
                            
                        </div>
                        <img src="${url}" class="upload-index-img"  alt="${fileName}, ${size} kB">
                        <span>${fileName}</span>
                    </div>`
}

function getImagePreviewEditTemplate(fileName, url, fileIndex, taskIndex, size) {
    return `      <div class="image-preview" onmouseenter="showDeleteIcon(${fileIndex})" onmouseleave="hideDeleteIcon(${fileIndex})" id="preview_image_${fileIndex}">
                        <div class="image-preview-hover d_none" id="image_preview_hover_${fileIndex}" onclick="renderImageViewer('gallery_upload', ${fileIndex})">
                            <div class="icon-container">
                                <img src="/assets/img/icon/delete.svg" onclick="deletePreviewImageEdit(${fileIndex}, ${taskIndex});" alt="">
                            </div>
                        </div>
                        <img src="${url}" class="upload-index-img"  alt="${fileName}, ${size} kB">
                        <span>${fileName}</span>
                    </div>`
}