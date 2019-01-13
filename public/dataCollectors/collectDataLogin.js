const login = document.querySelector('#modal-login');

//OBS.: O botão com o submit deverá ficar dentro da tag form , senão ele não é detectado
login.addEventListener('submit', (e) => {
    console.log('clicou');
    e.preventDefault();                                                         
    const email = login.querySelector('[name=login-email]').value;
    const password = login.querySelector('[name=login-password]').value;
    // post('/fazerLogin', {email, password})
    post('/users/login', {email, password})
    .then(({status}) => {
        if (status === 200) {
            window.location = "http://localhost:3000/users/profile";
        } else  {
            alert('Login failed');
        }
    });
});

function post(path, data) {
    return window.fetch(path, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}