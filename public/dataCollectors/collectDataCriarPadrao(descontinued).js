const criarNovoPadrao = document.querySelector('.criarNovoPadrao'); //Search the class criarNovoPadrao

criarNovoPadrao.addEventListener('submit', (e) => {
    e.preventDefault();
    const nomePadrao = criarNovoPadrao.querySelector('#nomePadrao').value;
    var visibilidade = criarNovoPadrao.querySelector('#visibilidade').value;
    const texto = criarNovoPadrao.querySelector('#texto').value;
    if(visibilidade === 'Público'){
        visibilidade = 0;
    } else if(visibilidade === 'Privado'){
        visibilidade = 1;
    } else {
        visibilidade = null;
    }
    post('/adicionarPadrao', {nomePadrao, visibilidade, texto})
    .then(({status}) => {
        if (status === 200) {
            // alert('Padrão criado com sucesso');
        } else  {
            // alert('Erro na criação do padrão');
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