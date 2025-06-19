
let allFiles = [];




async function getFilepicker() {




    let filepicker = document.getElementById('filepicker');
    let files = filepicker.files;
    let gallery = document.getElementById("gallery_uplaod");








    if (files.length > 0) {

        Array.from(files).forEach(async (file) => {
            if (!file.type.startsWith('image/')) {
                checkFileForm(file);
                return
            }

            const blob = new Blob([file], { type: file.type })
            console.log('New data: ', blob);








            const compressedBase64 = await compressImage(file)

            allFiles.push({
                fileName: file.name,
                fileType: file.type,
                base64: compressedBase64
            })



            const img = document.createElement('img')
            img.src = compressedBase64;
            renderPreviewImage();
            // img.setAttribute('onclick', "showImageViewer()")
            // gallery.appendChild(img);



        });


    }



}


function renderPreviewImage() {
    let galleryRef = document.getElementById('gallery_uplaod');
    galleryRef.innerHTML = "";
    allFiles.forEach((file, fileIndex) => {

        galleryRef.innerHTML += getImagePreviewTemplate(file.fileName, file.base64, fileIndex);
    })


}



function getImagePreviewTemplate(fileName, url, fileIndex) {
    return `      <div class="image-preview" onmouseenter="showDeleteIcon(${fileIndex})" onmouseleave="hideDeleteIcon(${fileIndex})" id="preview_image_${fileIndex}">
                        <div class="image-preview-hover d_none" id="image_preview_hover_${fileIndex}">
                            <div class="icon-container">
                                <img src="/assets/img/icon/delete.svg" onclick="deletePreviewImage(${fileIndex});" alt="">
                            </div>
                            
                        </div>
                        <img src="${url}" class="upload-index-img"  alt="">
                        <span>${fileName}</span>
                    </div>`
}

function getImagePreviewTicketTemplate(fileName, url, fileIndex) {
    return `      <div class="image-preview" onmouseenter="showDeleteIcon(${fileIndex})" onmouseleave="hideDeleteIcon(${fileIndex})" id="preview_image_${fileIndex}">
                        <div class="image-preview-hover d_none" id="image_preview_hover_${fileIndex}">
                            <div class="icon-container">
                                <a href="${url}" download="${fileName}"><img src="/assets/img/icon/cloud_download.png" alt=""></a>
                            </div>
                            
                        </div>
                        <img src="${url}" class="upload-index-img"  alt="">
                        <span>${fileName}</span>
                    </div>`
}

function getImagePreviewEditTemplate(fileName, url, fileIndex, taskIndex) {
    return `      <div class="image-preview" onmouseenter="showDeleteIcon(${fileIndex})" onmouseleave="hideDeleteIcon(${fileIndex})" id="preview_image_${fileIndex}">
                        <div class="image-preview-hover d_none" id="image_preview_hover_${fileIndex}">
                            <div class="icon-container">
                                <img src="/assets/img/icon/delete.svg" onclick="deletePreviewImageEdit(${fileIndex}, ${taskIndex});" alt="">
                            </div>
                        </div>
                        <img src="${url}" class="upload-index-img"  alt="">
                        <span>${fileName}</span>
                    </div>`
}

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

function deletePreviewImage(fileIndex) {
    allFiles.splice(fileIndex, 1);
    renderPreviewImage();
}

function deletePreviewImageEdit(fileIndex, taskIndex) {
    allFiles.splice(fileIndex, 1);
    checkAttachment(taskIndex);
}

function getUploadFileTemlpate(fileName) {
    return `
         <span>${fileName}</span>    
        `
}

function showImageViewer() {
    let gallery = document.getElementById("gallery_uplaod");
    const galleryViewer = new Viewer(gallery);
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
    return attachment;

}











