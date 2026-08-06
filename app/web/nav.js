// JavaScript to dynamically load the navigation bar
document.addEventListener("DOMContentLoaded", function () {
    fetch('/portal/web/nav.html')
        .then(response => response.text())
        .then(data => {
            nav_container.insertAdjacentHTML('afterbegin', data);
        })
        .catch(error => console.error('Error loading navigation:', error));
});
