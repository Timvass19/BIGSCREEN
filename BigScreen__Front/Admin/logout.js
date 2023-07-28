window.addEventListener('DOMContentLoaded', function () {
    let xhr = new XMLHttpRequest;
    let logoutLink = document.querySelector('.logout');

    logoutLink.onclick = function () {

        xhr.open('GET', `http://127.0.0.1:8000/api/user/logout/${userId}/${token}`);
        xhr.send();

        xhr.onload = function () {
            if (xhr.status != 200) {
                console.error(`Erreur ${xhr.status} : ${xhr.statusText}`);
                return;
            }

            let response = JSON.parse(xhr.response);

            if (response.status === 'done') {

                window.localStorage.removeItem(tokenName);

                setTimeout(function () {
                    window.location.href = 'login.html';
                }, 1000);
            }
        };

        xhr.error = function () {
            console.log(xhr);
        };
    };

});
