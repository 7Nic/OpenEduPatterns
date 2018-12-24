const createUser = document.querySelector('.createUser'); //Search the class createUser

createUser.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = createUser.querySelector('#name').value;
    const email = createUser.querySelector('#email').value; //Search for id: email
    const password = createUser.querySelector('#password').value;
    const confirm = createUser.querySelector('#confirm').value;
    if (password === confirm) {
        post('/cadastrarUsuario', {name, email, password});
        alert('Usuário cadastrado com sucesso');
    } else {
        alert('Senha de confirmação digitada diferente. Tente novamente');
    }
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