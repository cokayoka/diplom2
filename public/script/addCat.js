document.querySelector('#addCatForm').onsubmit = function(event) {
    event.preventDefault();
    let catName = document.querySelector('#catName').value.trim();
    if (catName == '') {
        //не заполнены поля
        Swal.fire({
            title: 'Внимание!',
            text: 'Заполните все поля',
            type: 'info',
            confirmButtonText: 'Ok'
        });
        return false;
    }
    fetch('/uploadCat', {
            method: 'POST',
            body: JSON.stringify({
                'catName': catName
            }),
            headers: {
                'Accept': 'application/jspn',
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {

            return response.text();
        })
}