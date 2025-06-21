/**
 * Array to store all selected or uploaded image files.
 * @type {Array<Object>}
 */
let allFiles = [];


/**
 * Instance of the image viewer.
 * @type {Object|null}
 */
let viewer;


/**
 * Opens and processes the files selected by the user.
 * Only images are compressed, saved as objects, and displayed in the preview.
 * Other files are checked using `checkFileForm`.
 * 
 * @returns {Promise<void>}
 */
async function getFilepicker() {
    let filepicker = document.getElementById('filepicker');
    let files = filepicker.files;
    if (files.length > 0) {
        Array.from(files).forEach(async (file) => {
            if (!file.type.startsWith('image/')) {
                checkFileForm(file);
                return;
            }
            const sizeInKB = (file.size / 1024).toFixed(0);
            const compressedBase64 = await compressImage(file)
            allFiles.push(fileObjekt(file, compressedBase64, sizeInKB));
            renderPreviewImage();
            filepicker.value = "";
        });
    }
}


/**
 * Creates a file object with filename, type, base64 string, and size.
 * 
 * @param {File} file - The original file object
 * @param {string} compressedBase64 - The compressed base64 representation of the image
 * @param {string} sizeInKB - File size in kilobytes
 * @returns {Object} - Object containing file information
 */
function fileObjekt(file, compressedBase64, sizeInKB) {
    return {
        fileName: file.name,
        fileType: file.type,
        base64: compressedBase64,
        size: sizeInKB
    }
}


/**
 * Renders the image preview in the upload section.
 */
function renderPreviewImage() {
    let galleryRef = document.getElementById('gallery_upload');
    if (!galleryRef) return
    galleryRef.innerHTML = "";
    allFiles.forEach((file, fileIndex) => {
        galleryRef.innerHTML += getImagePreviewTemplate(file.fileName, file.base64, fileIndex, file.size);
    });
    renderAllDeleteButton();
}


/**
 * Shows or hides the button to delete all preview images.
 */
function renderAllDeleteButton() {
    if (allFiles.length > 0) {
        document.getElementById("all_delete_img_preview").classList.remove("d_none");
    } else {
        document.getElementById("all_delete_img_preview").classList.add("d_none");
    }
}


/**
 * Deletes a single image from the preview.
 * 
 * @param {number} fileIndex - Index of the image to delete
 */
function deletePreviewImage(fileIndex) {
    allFiles.splice(fileIndex, 1);
    renderPreviewImage();
    renderAllDeleteButton();
}


/**
 * Deletes a single image in edit mode.
 * 
 * @param {number} fileIndex - Index of the image to delete
 * @param {number} taskIndex - (Currently unused)
 */
function deletePreviewImageEdit(fileIndex, taskIndex) {
    allFiles.splice(fileIndex, 1);
    renderPreviewImage();
    renderAllDeleteButton();
}


/**
 * Initializes and renders the image viewer for a given gallery element.
 * @param {string} id - The ID of the gallery DOM element.
 * @param {number} fileIndex - Index of the image in the files array.
 * @param {number} taskIndex - Index used for naming downloaded files.
 */
function renderImageViewer(id, fileIndex, taskIndex) {
    let gallery = document.getElementById(id);
    if (viewer) viewer.destroy();
    viewer = createViewer(gallery, fileIndex, taskIndex);
    viewer.view(fileIndex);
}

/**
 * Creates a new Viewer instance with custom settings and toolbar actions.
 * @param {HTMLElement} gallery - The gallery DOM element.
 * @param {number} fileIndex - Index of the image in the files array.
 * @param {number} taskIndex - Index used for naming downloaded files.
 * @returns {Viewer} The Viewer instance.
 */
function createViewer(gallery, fileIndex, taskIndex) {
    return new Viewer(gallery, {
        inline: false,
        filter: filterImages,
        toolbar: getToolbar(fileIndex, taskIndex),
        shown: hideDeleteIfEmpty
    });
}

/**
 * Filters which images are shown in the viewer.
 * @param {HTMLImageElement} image - The image element to be filtered.
 * @returns {boolean} True if the image should be shown.
 */
function filterImages(image) {
    return image.classList.contains("upload-index-img");
}

/**
 * Returns a toolbar configuration for the viewer.
 * @param {number} fileIndex - Index of the image in the files array.
 * @param {number} taskIndex - Index used for naming downloaded files.
 * @returns {Object} Toolbar configuration object.
 */
function getToolbar(fileIndex, taskIndex) {
    return {
        zoomIn: 1, zoomOut: 1, oneToOne: 1, reset: 1,
        prev: 1, play: 0, next: 1, rotateLeft: 1, rotateRight: 1,
        download: {
            show: 1,
            click: () => downloadImage(fileIndex, taskIndex)
        },
        delete: {
            show: 1,
            click: () => deleteImage(fileIndex)
        }
    };
}


/**
 * Handles the image download process.
 * @param {number} fileIndex - Index of the image in the files array.
 * @param {number} taskIndex - Index used for naming downloaded files.
 */
function downloadImage(fileIndex, taskIndex) {
    const link = document.createElement('a');
    link.href = viewer.image.src;
    link.download = generateDonwloadName(fileIndex, taskIndex);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Deletes the selected image and updates the preview.
 * @param {number} fileIndex - Index of the image in the files array.
 */
function deleteImage(fileIndex) {
    allFiles.splice(fileIndex, 1);
    renderPreviewImage();
    viewer.hide();
}

/**
 * Hides the delete button if there are no images left.
 */
function hideDeleteIfEmpty() {
    const deleteButton = document.querySelector('.viewer-delete');
    if (deleteButton && allFiles.length === 0) {
        deleteButton.classList.add('d_none');
    }
}


/**
 * Generates a filename for downloading an image.
 * 
 * @param {number} fileIndex - Index of the file
 * @param {number} taskIndex - Index of the task
 * @returns {string} - Filename for download
 */
function generateDonwloadName(fileIndex, taskIndex) {
    if (allFiles.length > 0) return allFiles[fileIndex].fileName
    return tasks[taskIndex].attachment[fileIndex].fileName
}


/**
 * Checks if the file is an image and shows feedback if not.
 * 
 * @param {File} file - The file to check
 */
function checkFileForm(file) {
    if (!file.type.startsWith('image/')) {
        invalidImageFeedback();
        userFeedbackImage();
    } else if (file.type.startsWith('image/')) {
    }
}


/**
 * Displays feedback for invalid image formats.
 */
function invalidImageFeedback() {
    let error = document.getElementById('invalid_image');
    error.innerHTML = showInvalidImage();
}


/**
 * Compresses an image file to a base64 JPEG string.
 * 
 * @param {File} file - The image to compress.
 * @param {number} [maxWidth=800] - Maximum width.
 * @param {number} [maxHeight=800] - Maximum height.
 * @param {number} [quality=0.8] - Compression quality (0 to 1).
 * @returns {Promise<string>} - Compressed image as a base64 string.
 */
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return readFileAsDataURL(file)
        .then(dataURL => loadImage(dataURL))
        .then(img => resizeAndCompress(img, maxWidth, maxHeight, quality, file));
}

/**
 * Reads a file and returns its data URL.
 * 
 * @param {File} file - The file to read.
 * @returns {Promise<string>} - The file content as a data URL.
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject('Error reading the file.');
        reader.readAsDataURL(file);
    });
}

/**
 * Loads an image from a data URL.
 * 
 * @param {string} dataURL - The data URL to load the image from.
 * @returns {Promise<HTMLImageElement>} - Loaded image element.
 */
function loadImage(dataURL) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject('Error loading the image.');
        img.src = dataURL;
    });
}

/**
 * Resizes and compresses an image to base64 JPEG format.
 * 
 * @param {HTMLImageElement} img - The image to compress.
 * @param {number} maxWidth - Max allowed width.
 * @param {number} maxHeight - Max allowed height.
 * @param {number} quality - JPEG quality (0–1).
 * @returns {string} - Compressed image as base64 string.
 */
function resizeAndCompress(img, maxWidth, maxHeight, quality, file) {
    const { width, height } = getScaledDimensions(img, maxWidth, maxHeight);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    console.log(file.type);
    
    return canvas.toDataURL(file.type, quality);
}

/**
 * Calculates scaled dimensions while preserving aspect ratio.
 * 
 * @param {HTMLImageElement} img - The image element.
 * @param {number} maxWidth - Maximum width.
 * @param {number} maxHeight - Maximum height.
 * @returns {{ width: number, height: number }} - Scaled dimensions.
 */
function getScaledDimensions(img, maxWidth, maxHeight) {
    let { width, height } = img;
    if (width > maxWidth || height > maxHeight) {
        if (width > height) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        } else {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
    }
    return { width, height };
}


/**
 * Shows the delete icon on image hover.
 * 
 * @param {number} fileIndex - Index of the image
 */
function showDeleteIcon(fileIndex) {
    document.getElementById('image_preview_hover_' + fileIndex).classList.remove('d_none')
}

function toggleDeleteIcon(fileIndex) {
    document.getElementById('image_preview_hover_' + fileIndex).classList.toggle('d_none')
}


/**
 * Hides the delete icon when mouse leaves the image.
 * 
 * @param {number} fileIndex - Index of the image
 */
function hideDeleteIcon(fileIndex) {
    document.getElementById('image_preview_hover_' + fileIndex).classList.add('d_none')
}


/**
 * Creates an object containing all attachments for upload or submission.
 * 
 * @returns {Object} - Object with all attachments (base64 + metadata)
 */
function getAttachment() {
    const attachmentObj = {}
    allFiles.forEach((file, i) => {
        let att = createAttachmentObject(file);
        attachmentObj[`attachment_${i}`] = att
    })

    return { attachment: attachmentObj };
}


/**
 * Deletes all preview images and clears the `allFiles` array.
 */
function deleteAllPreview() {
    allFiles = [];
    renderPreviewImage();
}


/**
 * Creates a single attachment object with metadata.
 * 
 * @param {Object} file - A single file object
 * @returns {Object} - Attachment data structure
 */
function createAttachmentObject(file) {
    let attachment = {}
    attachment.fileName = file.fileName
    attachment.fileType = file.fileType
    attachment.base64 = file.base64
    attachment.size = file.size
    return attachment;
}
