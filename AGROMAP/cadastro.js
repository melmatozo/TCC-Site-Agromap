(() => {
  "use strict";

  const formulario = document.getElementById("cadastroForm");
  const mensagem = document.getElementById("mensagem");
  const botao = document.getElementById("botaoCadastro");

  if (!formulario || !mensagem || !botao) return;

  function informar(texto, tipo = "error") {
    mensagem.textContent = texto;
    mensagem.className = "form-message" + (tipo ? " " + tipo : "");
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    informar("");

    const valor = (id) =>
      (document.getElementById(id)?.value ?? "").trim();

    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    const totalTexto = valor("hectaresTotal");
    const plantadosTexto = valor("hectaresPlantados");

    if (senha.length < 6) {
      informar("Sua senha precisa ter pelo menos 6 caracteres.");
      document.getElementById("senha").focus();
      return;
    }

    if (senha !== confirmarSenha) {
      informar("As senhas não coincidem. Confira os dois campos.");
      document.getElementById("confirmarSenha").focus();
      return;
    }

    const total = totalTexto === "" ? null : Number(totalTexto);
    const plantados = plantadosTexto === "" ? null : Number(plantadosTexto);

    if (total !== null && (!Number.isFinite(total) || total < 0)) {
      informar("A área total deve ser um número igual ou maior que zero.");
      return;
    }

    if (plantados !== null && (!Number.isFinite(plantados) || plantados < 0)) {
      informar("A área plantada deve ser um número igual ou maior que zero.");
      return;
    }

    if (total !== null && plantados !== null && plantados > total) {
      informar("A área plantada não pode ser maior que a área total.");
      return;
    }

    const nome = valor("nome");
    const email = valor("email").toLowerCase();
    const telefone = valor("telefone");
    const nomeFazenda = valor("nomeFazenda");
    const endereco = valor("enderecoRural");
    const cidade = valor("cidade");
    const estado = valor("estado");
    const culturaPrincipal = valor("culturaPrincipal");
    const outrasCulturas = valor("outrasCulturas");
    const epocaPlantio = valor("epocaPlantio");
    const irrigacao = valor("irrigacao");
    const observacoes = valor("observacoes");

    const metadados = {
      nome,
      telefone: telefone || null,
      nome_fazenda: nomeFazenda || null,
      endereco: endereco || null,
      cidade: cidade || null,
      estado: estado || null,
      localizacao: [cidade, estado].filter(Boolean).join(", ") || endereco || null,
      area_total: total,
      hectares_plantados: plantados,
      cultura_principal: culturaPrincipal || null,
      outras_culturas: outrasCulturas || null,
      epoca_plantio: epocaPlantio || null,
      irrigacao: irrigacao || null,
      observacoes: observacoes || null
    };

    botao.disabled = true;
    botao.innerHTML = 'Criando sua conta <span>…</span>';

    try {
      const resposta = await fetch("api.php", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "cadastro",
          nome,
          email,
          senha,
          telefone,
          nome_fazenda: nomeFazenda,
          endereco,
          cidade,
          estado,
          hectares_total: totalTexto,
          hectares_plantados: plantadosTexto,
          cultura_principal: culturaPrincipal,
          outras_culturas: outrasCulturas,
          epoca_plantio: epocaPlantio,
          irrigacao,
          observacoes
        })
      });

      const texto = await resposta.text();
      let resultado;

      try {
        resultado = JSON.parse(texto);
      } catch (e) {
        console.error("Resposta inesperada do servidor:", texto);
        throw new Error(
          "O servidor não respondeu como esperado. Abra o site por http://localhost (PHP), não direto pelo arquivo."
        );
      }

      if (!resultado.sucesso) {
        informar(resultado.mensagem || "Não foi possível concluir o cadastro.");
        return;
      }

      informar("Conta criada com sucesso! Redirecionando...", "success");

      window.setTimeout(() => {
        window.location.href = new URL("dashboard.html", window.location.href).href;
      }, 900);
    } catch (erro) {
      console.error("Erro no cadastro:", erro);
      informar(erro.message || "Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
      botao.disabled = false;
      botao.innerHTML = 'Criar minha conta <span>→</span>';
    }
  });
})();
