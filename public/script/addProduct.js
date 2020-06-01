document.querySelector('#addProductForm').onsubmit = function(event) {
    event.preventDefault();
    let productName = document.querySelector('#productName').value.trim();
    let productCost = document.querySelector('#productCost').value.trim();
    let filedata = document.querySelector('#filedata').value.trim();
    let filedataObj = document.querySelector('#filedata');
    let productDescription = document.querySelector('#productDescription').value.trim();
    let productCat = document.querySelector('#productCat').value.trim();
    if (productName == '' || productCost == "" || productCat == "") {
        //не заполнены поля
        Swal.fire({
            title: 'Внимание!',
            text: 'Заполните все поля',
            type: 'info',
            confirmButtonText: 'Ok'
        });
        return false;
    }
    fetch('/upload', {
            method: 'POST',
            body: JSON.stringify({
                'productName': productName,
                'productCost': productCost,
                'filedata': filedata,
                'productDescription': productDescription,
                'productCat': productCat
            }),
            headers: {
                'Accept': 'application/jspn',
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            return response.text();
        })
        .then(function(body) {
            if (body == 1) {
                Swal.fire({
                    title: 'Заказ успешно отправлен!',
                    text: 'Успех!',
                    type: 'info',
                    confirmButtonText: 'Ok'
                });
            } else {
                Swal.fire({
                    title: 'Проблема с отправкой заказа!',
                    text: 'Ошибка',
                    type: 'Error',
                    confirmButtonText: 'Ok'
                });
            }
        });
}