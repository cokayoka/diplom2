function getCategoryList() {
    fetch('/get-category-list', {
        method: 'POST'
    }).then(function(response) {
        return response.text();
    }).then(function(body) {
        showCategoryList(JSON.parse(body));
    })
}

function showCategoryList(data) {
    console.log(data);
    let out = '';
    for (let i = 0; i < data.length; i++) {
        out += `<li class="category__name"><a href="/cat?id=${data[i]['id']}">${data[i]['category']}</li>`;
    }
    out += '</ul>';
    document.querySelector('#category-list').innerHTML = out;
}

getCategoryList();