

function getFilepicker() {
    document.getElementById("filepicker").addEventListener('change', () => {
        let filepicker = document.getElementById('filepicker');
        let files = filepicker.files

        if (files.length > 0) {

            Array.from(files).forEach(file => {
                const blob = new Blob([file], {type: file.type})
                console.log('New data: ', blob);
            });
            
        }


    })
}
