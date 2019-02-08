const criarNovaLinguagem = document.querySelector('.criarNovaLinguagem'); //Search the class criarNovaLinguagem

criarNovaLinguagem.addEventListener('submit', (e) => {
    e.preventDefault();
    const nomeLinguagem = criarNovaLinguagem.querySelector('#nomeLinguagem').value;
    var visibilidade = criarNovaLinguagem.querySelector('#visibilidade').value;
    const descricaoLinguagem = criarNovaLinguagem.querySelector('#descricaoLinguagem').value;
    if(visibilidade === 'Público'){
        visibilidade = 0;
    } else if(visibilidade === 'Privado'){
        visibilidade = 1;
    } else {
        visibilidade = null;
    }
    post('/adicionarLinguagem', {nomeLinguagem, visibilidade, descricaoLinguagem})
    .then(({status}) => {
        if (status === 200) {
            // alert('Linguagem criada com sucesso');
        } else  {
            // alert('Erro na criação da linguagem');
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