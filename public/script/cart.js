let cart = {};
document.querySelectorAll('.add-to-cart').forEach(function(element) {
    element.onclick = addToCart;
});

if (localStorage.getItem('cart')) {
    cart = JSON.parse(localStorage.getItem('cart'));
    ajaxGetProductsInfo();
}


function addToCart() {
    let productsId = this.dataset.products_id;
    if (cart[productsId]) {
        cart[productsId]++;
    } else {
        cart[productsId] = 1;
    }
    console.log(cart);

    ajaxGetProductsInfo();
}

function ajaxGetProductsInfo() {
    updateLocalStorageCart();
    fetch('/get-products-info', {
            method: 'POST',
            body: JSON.stringify({ key: Object.keys(cart) }),
            headers: {
                'Accept': 'application/jspn',
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            return response.text();
        })
        .then(function(body) {
            console.log(body);
            showCart(JSON.parse(body));
        })
}

function showCart(data) {
    let out = '';
    let total = 0;
    for (let key in cart) {
        out += `
        <li class="cartList__item cartListItem">
        <div class="cartListItem__nameAndQuantity"><a href="products?id=${key}">${cart[key]} х ${data[key]['name']}</a></div>
        <div class="cartListItem__price">${formatPrice(data[key]['cost']*cart[key])}р.</div>
        <div class="cartListItem__btns">
            <button class="addBtn cart__addBtn" data-products_id="${key}">
            <img src='img/icons/addBtn.png' alt=''>
            </button>
            <button class="closeBtn cart__closeBtn" data-products_id="${key}">
            <img src='img/icons/close.png' alt=''>
            </button>
        </div>
        </li>`;
        total += cart[key] * data[key]['cost'];
    }
    document.querySelector('#amount').innerHTML = formatPrice(total) + 'р.'
    document.querySelector('#cart-list').innerHTML = out;
    document.querySelectorAll('.cart__closeBtn').forEach(function(element) {
        element.onclick = cartMinus;
    });
    document.querySelectorAll('.cart__addBtn').forEach(function(element) {
        element.onclick = cartPlus;
    });
}


function cartPlus() {
    let productsId = this.dataset.products_id;
    cart[productsId]++;
    ajaxGetProductsInfo();
}

function cartMinus() {
    let productsId = this.dataset.products_id;
    if (cart[productsId] - 1 > 0) {
        cart[productsId]--;
    } else {
        delete(cart[productsId]);
    }
    ajaxGetProductsInfo();
}

function updateLocalStorageCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function formatPrice(price) {
    return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
}