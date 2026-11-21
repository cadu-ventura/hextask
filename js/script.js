// Pegando os elementos do HTML
var campo = document.getElementById("campo");
var categoria = document.getElementById("categoria");
var botao = document.getElementById("botao");
var limpar = document.getElementById("limpar");
var pendentes = document.getElementById("pendentes");
var fazendo = document.getElementById("fazendo");
var concluidas = document.getElementById("concluidas");
var colunas = document.querySelectorAll(".lista");
var filtros = document.querySelectorAll(".filtro");

// Nome que aparece na etiqueta de cada categoria
var nomesCategorias = {
  casa: "Casa",
  trabalho: "Trabalho",
  estudos: "Estudos",
  mercado: "Mercado",
  saude: "Saúde",
  outros: "Outros"
};

// Guarda a tarefa que está sendo arrastada
var arrastando = null;

// Categoria escolhida no painel ("todas" mostra tudo)
var filtroAtual = "todas";

// Mostra "Bom dia/Boa tarde/Boa noite", a data e o horário do computador
function mostrarSaudacao() {
  var agora = new Date();
  var hora = agora.getHours();
  var saudacao = "Boa noite";

  if (hora >= 5 && hora < 12) {
    saudacao = "Bom dia";
  } else if (hora >= 12 && hora < 18) {
    saudacao = "Boa tarde";
  }

  var data = agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  var horario = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("saudacao").innerText = saudacao + "! Hoje é " + data + " · " + horario;
}

// Atualiza os contadores das colunas, o progresso e as categorias do painel
function atualizarResumo() {
  // Contadores de cada coluna
  document.getElementById("total-pendentes").innerText = pendentes.children.length;
  document.getElementById("total-fazendo").innerText = fazendo.children.length;
  document.getElementById("total-concluidas").innerText = concluidas.children.length;

  // Progresso: quantas foram feitas do total
  var total = pendentes.children.length + fazendo.children.length + concluidas.children.length;
  var feitas = concluidas.children.length;
  var porcentagem = 0;

  if (total > 0) {
    porcentagem = Math.round((feitas / total) * 100);
  }

  document.getElementById("porcentagem").innerText = porcentagem;
  document.getElementById("barra-cheia").style.width = porcentagem + "%";

  var texto = document.getElementById("texto-progresso");

  if (total == 0) {
    texto.innerText = "Nenhuma tarefa ainda";
  } else if (feitas == total) {
    texto.innerText = "Tudo feito! Bom trabalho 🎉";
  } else {
    texto.innerText = feitas + " de " + total + " tarefas concluídas";
  }

  // Quantas tarefas existem em cada categoria
  var itens = document.querySelectorAll("li");
  document.getElementById("qtd-todas").innerText = itens.length;

  for (var cat in nomesCategorias) {
    var quantidade = 0;

    for (var i = 0; i < itens.length; i++) {
      if (itens[i].dataset.categoria == cat) {
        quantidade++;
      }
    }

    document.getElementById("qtd-" + cat).innerText = quantidade;
  }
}

// Esconde as tarefas que não são da categoria escolhida no painel
function aplicarFiltro() {
  var itens = document.querySelectorAll("li");

  for (var i = 0; i < itens.length; i++) {
    if (filtroAtual == "todas" || itens[i].dataset.categoria == filtroAtual) {
      itens[i].hidden = false;
    } else {
      itens[i].hidden = true;
    }
  }
}

// Salva todas as tarefas no navegador (localStorage)
function salvar() {
  var tarefas = [];
  var itens = document.querySelectorAll("li");

  for (var i = 0; i < itens.length; i++) {
    tarefas.push({
      texto: itens[i].dataset.texto,
      categoria: itens[i].dataset.categoria,
      coluna: itens[i].parentElement.id // "pendentes", "fazendo" ou "concluidas"
    });
  }

  localStorage.setItem("hextask", JSON.stringify(tarefas));
}

// Coloca a tarefa em uma coluna e risca se for "Feito"
function moverPara(item, coluna) {
  coluna.appendChild(item);

  if (coluna == concluidas) {
    item.classList.add("feita");
  } else {
    item.classList.remove("feita");
  }

  atualizarResumo();
  salvar();
}

// Cria o item da lista com etiqueta, arrastar, clicar e excluir
function criarTarefa(texto, cat, nomeColuna) {
  var item = document.createElement("li");
  item.draggable = true;
  item.dataset.texto = texto;
  item.dataset.categoria = cat;

  // Etiqueta colorida com a categoria
  var etiqueta = document.createElement("span");
  etiqueta.innerText = nomesCategorias[cat];
  etiqueta.className = "etiqueta " + cat;
  item.appendChild(etiqueta);

  // Texto da tarefa
  var textoTarefa = document.createElement("span");
  textoTarefa.innerText = texto;
  textoTarefa.className = "texto";
  item.appendChild(textoTarefa);

  // Começou a arrastar
  item.ondragstart = function () {
    arrastando = item;
    item.classList.add("arrastando");
  };

  // Terminou de arrastar
  item.ondragend = function () {
    item.classList.remove("arrastando");
  };

  // Clicar na tarefa avança: A fazer → Fazendo → Feito → A fazer
  item.onclick = function () {
    if (item.parentElement == pendentes) {
      moverPara(item, fazendo);
    } else if (item.parentElement == fazendo) {
      moverPara(item, concluidas);
    } else {
      moverPara(item, pendentes);
    }
  };

  // Cria o botão de excluir
  var excluir = document.createElement("button");
  excluir.innerText = "X";
  excluir.className = "excluir";

  // Clicar no X apaga a tarefa
  excluir.onclick = function (evento) {
    evento.stopPropagation(); // não deixa o clique trocar a tarefa de coluna
    item.remove();
    atualizarResumo();
    salvar();
  };

  item.appendChild(excluir);

  // Coloca na coluna certa (se não vier nenhuma, vai para "A fazer")
  var coluna = document.getElementById(nomeColuna) || pendentes;
  moverPara(item, coluna);
  aplicarFiltro();
}

// Faz cada coluna aceitar tarefas arrastadas
for (var i = 0; i < colunas.length; i++) {
  // Enquanto arrasta por cima da coluna
  colunas[i].ondragover = function (evento) {
    evento.preventDefault(); // sem isso o navegador não deixa soltar
    this.classList.add("destaque");
  };

  // Quando sai de cima da coluna
  colunas[i].ondragleave = function () {
    this.classList.remove("destaque");
  };

  // Quando solta a tarefa na coluna
  colunas[i].ondrop = function (evento) {
    evento.preventDefault();
    this.classList.remove("destaque");
    moverPara(arrastando, this);
  };
}

// Clicar numa categoria do painel filtra as tarefas
for (var f = 0; f < filtros.length; f++) {
  filtros[f].onclick = function () {
    // Tira o destaque de todos os botões e coloca só no clicado
    for (var k = 0; k < filtros.length; k++) {
      filtros[k].classList.remove("ativo");
    }

    this.classList.add("ativo");
    filtroAtual = this.dataset.categoria;
    aplicarFiltro();
  };
}

// Adiciona a tarefa digitada
function adicionar() {
  var texto = campo.value.trim();

  // Se o campo estiver vazio, não faz nada
  if (texto == "") {
    alert("Digite uma tarefa!");
    return;
  }

  criarTarefa(texto, categoria.value, "pendentes");

  // Limpa o campo e deixa pronto pra digitar a próxima
  campo.value = "";
  campo.focus();
}

// Adiciona clicando no botão ou apertando Enter
botao.onclick = adicionar;

campo.onkeydown = function (evento) {
  if (evento.key == "Enter") {
    adicionar();
  }
};

// Apaga de uma vez todas as tarefas já feitas
limpar.onclick = function () {
  concluidas.innerHTML = "";
  atualizarResumo();
  salvar();
};

// Liga ou desliga o tema escuro e guarda a escolha
var tema = document.getElementById("tema");

function aplicarTema(nome) {
  // O botão mostra só o ícone; o title e o aria-label dizem o que ele faz
  if (nome == "escuro") {
    document.body.classList.add("escuro");
    tema.innerText = "☀";
    tema.title = "Ativar tema claro";
  } else {
    document.body.classList.remove("escuro");
    tema.innerText = "☾";
    tema.title = "Ativar tema escuro";
  }

  tema.setAttribute("aria-label", tema.title);

  localStorage.setItem("hextask-tema", nome);
}

// Clicar no botão troca para o outro tema
tema.onclick = function () {
  if (document.body.classList.contains("escuro")) {
    aplicarTema("claro");
  } else {
    aplicarTema("escuro");
  }
};

// Quando a página abre: aplica o tema salvo, mostra a saudação e carrega as tarefas
aplicarTema(localStorage.getItem("hextask-tema") || "claro");
mostrarSaudacao();

// A cada 1 segundo (1000 milissegundos) atualiza a saudação e o horário
setInterval(mostrarSaudacao, 1000);

var salvas = JSON.parse(localStorage.getItem("hextask")) || [];

for (var j = 0; j < salvas.length; j++) {
  criarTarefa(salvas[j].texto, salvas[j].categoria, salvas[j].coluna);
}

atualizarResumo();
