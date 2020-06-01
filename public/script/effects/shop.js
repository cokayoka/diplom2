function subcategoryToggle() {
    var target = event.target;
    if (target.className == "category__name") {
        if (target.nextElementSibling.style.display == "none") {
            target.nextElementSibling.style.display = "block";
        } else {
            target.nextElementSibling.style.display = "none";
        }
    }
    if (target.className == "category__downArrowBtnImg") {
        if (target.parentElement.parentElement.nextElementSibling.style.display == "none")
            target.parentElement.parentElement.nextElementSibling.style.display = "block";
        else
            target.parentElement.parentElement.nextElementSibling.style.display = "none";
    }
}

function productItemHoverEffect() {
    var target = event.target;
    if (target.parentElement.className == "productListItem productList__item") {
        target.parentElement.lastElementChild.style.height = "170px";
        target.parentElement.firstElementChild.style.height = "83px";
    }
    if (target.parentElement.parentElement.className == "productListItem productList__item") {
        target.parentElement.parentElement.lastElementChild.style.height = "170px";
        target.parentElement.parentElement.firstElementChild.style.height = "83px";
    }
    if (target.parentElement.className == "addBtn aboutProduct__addBtn") {
        target.parentElement.parentElement.parentElement.lastElementChild.style.height = "170px";
        target.parentElement.parentElement.parentElement.firstElementChild.style.height = "83px";

    }
}

function productItemMouseoutEffect() {
    var target = event.target;
    if (target.parentElement.className == "productListItem productList__item") {
        target.parentElement.lastElementChild.style.height = "70px";
        target.parentElement.firstElementChild.style.height = "183px";
    }
    if (target.parentElement.parentElement.className == "productListItem productList__item") {
        target.parentElement.parentElement.lastElementChild.style.height = "70px";
        target.parentElement.parentElement.firstElementChild.style.height = "183px";
    }

}