const urlBase = 'https://projeto-mongo.vercel.app/'

const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"))
const access_token = localStorage.getItem("token") || null



//evento submit do formulário
document.getElementById('formEvento').addEventListener('submit', function (event) {
    event.preventDefault() // evita o recarregamento
    const idEvento = document.getElementById('id').value
    let agenda = {}
    

    if (idEvento.length > 0) { //Se possuir o ID, enviamos junto com o objeto

        agenda = {
            "_id": idEvento,
            "titulo": document.getElementById('nome').value,
            "data": document.getElementById('data_evento').value,
            "custo": document.getElementById('custo_ingresso').value,
            "local": document.getElementById('local_evento').value,
            "descricao": document.getElementById('descricao_evento').value,
            "participantes": document.getElementById('participantes_evento').value,
            
            }
        }
     else {
        
        agenda = {
            "titulo": document.getElementById('nome').value,
            "data": document.getElementById('data_evento').value,
            "custo": document.getElementById('custo_ingresso').value,
            "local": document.getElementById('local_evento').value,
            "descricao": document.getElementById('descricao_evento').value,
            "participantes": document.getElementById('participantes_evento').value,
            
            }
    }
    salvaEvento(agenda)
})

async function salvaEvento(agenda) {    
    if (agenda.hasOwnProperty('_id')) { //Se a agenda tem o id iremos alterar os dados (PUT)
        // Fazer a solicitação PUT para o endpoint dos prestadores
        await fetch(`${urlBase}/agenda`, {
            
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            },
            body: JSON.stringify(agenda)
        })
            .then(response => response.json())
            .then(data => {
                // Verificar se o token foi retornado        
                if (data.acknowledged) {
                    alert('✔ Evento alterado com sucesso!')
                    //Limpar o formulário
                    document.getElementById('formEvento').reset()
                    //Atualiza a UI
                    carregaEventos()
                    location. reload()
                } else if (data.errors) {
                    // Caso haja erros na resposta da API
                    const errorMessages = data.errors.map(error => error.msg).join("\n");
                    // alert("Falha no login:\n" + errorMessages);
                    document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${errorMessages}</span>`
                    resultadoModal.show();
                } else {
                    document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${JSON.stringify(data)}</span>`
                    resultadoModal.show();
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o evento: ${error.message}</span>`
                resultadoModal.show();
            });

    } else { //caso não tenha o ID, iremos incluir (POST)
        // Fazer a solicitação POST para o endpoint dos prestadores
        await fetch(`${urlBase}/agenda`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            },
            body: JSON.stringify(agenda)
        })
            .then(response => response.json())
            .then(data => {
                // Verificar se o token foi retornado        
                if (data.acknowledged) {
                    alert('✔ Evento incluído com sucesso!')
                    //Limpar o formulário
                    document.getElementById('formEvento').reset()
                    //Atualiza a UI
                    carregaEventos()
                } else if (data.errors) {
                    // Caso haja erros na resposta da API
                    const errorMessages = data.errors.map(error => error.msg).join("\n");
                    // alert("Falha no login:\n" + errorMessages);
                    document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${errorMessages}</span>`
                    resultadoModal.show();
                } else {
                    document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${JSON.stringify(data)}</span>`
                    resultadoModal.show();
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o prestador: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function carregaEventos() {
    const tabela = document.getElementById('dadosTabela')
    tabela.innerHTML = '' //Limpa a tabela antes de recarregar
    // Fazer a solicitação GET para o endpoint dos prestadores
    await fetch(`${urlBase}/agenda`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": access_token //envia o token na requisição
        }
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(agenda => {
                tabela.innerHTML += `
                <tr>
                   <td>${agenda.titulo}</td>
                   <td>${agenda.data}</td>
                   <td>${agenda.custo}</td>
                   <td>${agenda.local}</td>                   
                   <td>${agenda.descricao}</td>
                   <td>${agenda.participantes}</td>        
                   <td>
                       <button class='btn btn-danger btn-sm' onclick='removeEvento("${agenda._id}")'>🗑 Excluir </button>
                       <button class='btn btn-warning btn-sm' onclick='buscaEventoPeloId("${agenda._id}")'>📝 Editar </button>
                    </td>           
                </tr>
                `
            })
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao carregar o evento: ${error.message}</span>`
            resultadoModal.show();
        });
}

async function removeEvento(id) {
    if (confirm('Deseja realmente excluir o evento?')) {
        await fetch(`${urlBase}/agenda/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.deletedCount > 0) {
                    //alert('Registro Removido com sucesso')
                    carregaEventos() // atualiza a UI
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao remover o evento: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function buscaEventoPeloId(id) {
    await fetch(`${urlBase}/agenda/id/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": access_token //envia o token na requisição
        }
    })
        .then(response => response.json())
        .then(data => {
            alert(data[0].titulo)
            if (data[0]) { //Iremos pegar os dados e colocar no formulário.
                document.getElementById('id').value = data[0]._id
                document.getElementById('nome').value = data[0].titulo
                document.getElementById('data_evento').value = data[0].data
                document.getElementById('custo_ingresso').value = data[0].custo
                document.getElementById('local_evento').value = data[0].local
                document.getElementById('descricao_evento').value = data[0].descricao
                document.getElementById('participantes_evento').value = data[0].participantes
            }
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao buscar o evento: ${error.message}</span>`
            resultadoModal.show();
        });
    }