// Pegando os elementos do HTML
var campo = document.getElementById("campo");
var categoria = document.getElementById("categoria");
var botao = document.getElementById("botao");
var limpar = document.getElementById("limpar");
var pendentes = document.getElementById("pendentes");
var concluidas = document.getElementById("concluidas");
var colunas = document.querySelectorAll(".lista");

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

// Atualiza o número ao lado do nome de cada coluna
function atualizarContadores() {
  document.getElementById("total-pendentes").innerText = pendentes.children.length;
  document.getElementById("total-concluidas").innerText = concluidas.children.length;
}

// Coloca a tarefa em uma coluna e risca se for "Feito"
function moverPara(item, coluna) {
  coluna.appendChild(item);

  if (coluna == concluidas) {
    item.classList.add("feita");
  } else {
    item.classList.remove("feita");
  }

  atualizarContadores();
}

// Cria o item da lista com etiqueta, arrastar, clicar e excluir
function criarTarefa(texto, cat) {
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

  // Clicar na tarefa também troca de coluna
  item.onclick = function () {
    if (item.parentElement == pendentes) {
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
    atualizarContadores();
  };

  item.appendChild(excluir);

  // Toda tarefa nova começa em "A fazer"
  moverPara(item, pendentes);
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

// Adiciona a tarefa digitada
function adicionar() {
  var texto = campo.value.trim();

  // Se o campo estiver vazio, não faz nada
  if (texto == "") {
    alert("Digite uma tarefa!");
    return;
  }

  criarTarefa(texto, categoria.value);

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
  atualizarContadores();
};
