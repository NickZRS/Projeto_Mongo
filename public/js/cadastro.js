const urlBase = 'https://projeto-mongo-bd.vercel.app/api'




document.getElementById("cadForm").addEventListener("submit", function (event) {
    event.preventDefault()
    const nome = document.getElementById("nome").value
    const login = document.getElementById("login").value
    const senha = document.getElementById("senha").value
    const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"))

    // Dados do usuário para autenticação
    const dadosCadastro = {
        nome: nome,
        email: login,
        senha: senha
    };

fetch(`${urlBase}/usuarios`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(dadosCadastro)
})
    .then(response => response.json())
    .then(data => {
        // Verificar se o token foi retornado        
        if (data.acknowledged) {
            alert('✔ Usuario cadastrado com sucesso!')
            //Limpar o formulário
            window.location.href = "index.html";
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
        document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao cadastrar: ${error.message}</span>`
        resultadoModal.show();
    });

})
