let userId, email, userPassword, token, title, description;
const tokenName = 'adtoken';

window.addEventListener('DOMContentLoaded', function () {

    // Verifie si l'utilisateur est connecté si non rediriger
    // sur la page de login
    if (window.localStorage.getItem(tokenName)) {

        [userId, email, token] = window.localStorage.getItem(tokenName).split('_');

    }
    else if (window.location.href.includes('dashboard.html')) {
        window.location.href = 'login.html';
    }

});
