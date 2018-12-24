const editarLinguagem = document.querySelector('.editarLinguagem'); //Search the class editarLinguagem

editarLinguagem.addEventListener('submit', (e) => {
    e.preventDefault();
    const nomeLinguagem = editarLinguagem.querySelector('#nomeLinguagem').value;
    var visibilidade = editarLinguagem.querySelector('#visibilidade').value;
    const descricaoLinguagem = editarLinguagem.querySelector('#descricaoLinguagem').value;
    if(visibilidade === 'Público'){
        visibilidade = 0;
    } else if(visibilidade === 'Privado'){
        visibilidade = 1;
    } else {
        visibilidade = null;
    }
    post('/salvarEdicaoLinguagem/id', {nomeLinguagem, visibilidade, descricaoLinguagem})
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