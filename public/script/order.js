document.querySelector('#order').onsubmit = function(event) {
    event.preventDefault();
    let username = document.querySelector('#orderName').value.trim();
    let phone = document.querySelector('#orderPhone').value.trim();
    let email = document.querySelector('#orderEmail').value.trim();
    let address = document.querySelector('#orderAddress').value.trim();
    if (username == '' || phone == "" || email == "" || address == "") {
        //не заполнены поля
        Swal.fire({
            title: 'Внимание!',
            text: 'Заполните все поля',
            type: 'info',
            confirmButtonText: 'Ok'
        });
        return false;
    }
    fetch('/finish-order', {
            method: 'POST',
            body: JSON.stringify({
                'username': username,
                'phone': phone,
                'address': address,
                'email': email,
                'key': JSON.parse(localStorage.getItem('cart'))
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