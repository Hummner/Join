let allFiles = [];
let viewer;


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

function fileObjekt(file, compressedBase64, sizeInKB) {
    return {
                fileName: file.name,
                fileType: file.type,
                base64: compressedBase64,
                size: sizeInKB
            }
}


function renderPreviewImage() {
    let galleryRef = document.getElementById('gallery_upload');
    galleryRef.innerHTML = "";
    allFiles.forEach((file, fileIndex) => {

        galleryRef.innerHTML += getImagePreviewTemplate(file.fileName, file.base64, fileIndex, file.size);
    })


}


function deletePreviewImage(fileIndex) {
    allFiles.splice(fileIndex, 1);
    renderPreviewImage();
}

function deletePreviewImageEdit(fileIndex, taskIndex) {
    allFiles.splice(fileIndex, 1);
    checkAttachment(taskIndex);
}


function renderImageViewer(id, fileIndex) {
    let gallery = document.getElementById(id);
    if (viewer) {
        viewer.destroy();
    }
    viewer = new Viewer(gallery, {
        inline: false,
        filter(image) {
            return image.classList.contains("upload-index-img");
        }
    });
    viewer.view(fileIndex);
}



function checkFileForm(file) {
    let error = document.getElementById('error-upload');
    if (!file.type.startsWith('image/')) {
        error.classList.add("visible")
        console.error('invalid file');
        error.innerHTML = 'Only image files are allowed (e.g. JPG, PNG).';
        return;

    } else if (file.type.startsWith('image/')) {
        error.classList.remove("visible");
    }
}



/**
 * Compresses an image to a target size or quality.
 * @param {File} file - The image file to be compressed
 * @param {number} maxWidth - The maximum width of the image
 * @param {number} maxHeight - The maximum height of the image
 * @param {number} quality - Quality of the compressed image (between 0 and 1)
 * @returns {Promise<string>} - Base64 string of the compressed image
 */
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new size while maintaining aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    } else {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Export the image as a Base64 string
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };

            img.onerror = () => reject('Error loading the image.');
            img.src = event.target.result;
        };

        reader.onerror = () => reject('Error reading the file.');
        reader.readAsDataURL(file);
    });
}


function showDeleteIcon(fileIndex) {
    document.getElementById('image_preview_hover_' + fileIndex).classList.remove('d_none')
}

function hideDeleteIcon(fileIndex) {
    document.getElementById('image_preview_hover_' + fileIndex).classList.add('d_none')
}

function getAttachment() {
    const attachmentObj = {}
    allFiles.forEach((file, i) => {
        let att = createAttachmentObject(file);
        attachmentObj[`attachment_${i}`] = att
    })

    return { attachment: attachmentObj };

}

function createAttachmentObject(file) {
    let attachment = {}
    attachment.fileName = file.fileName
    attachment.fileType = file.fileType
    attachment.base64 = file.base64
    attachment.size = file.size
    return attachment;

}











