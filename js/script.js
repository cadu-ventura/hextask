var campo = document.getElementById("campo");
var categoria = document.getElementById("categoria");
var prioridade = document.getElementById("prioridade");
var botao = document.getElementById("botao");
var limpar = document.getElementById("limpar");
var pendentes = document.getElementById("pendentes");
var fazendo = document.getElementById("fazendo");
var concluidas = document.getElementById("concluidas");
var colunas = document.querySelectorAll(".lista");
var filtros = document.querySelectorAll(".filtro");

var nomesCategorias = {
  casa: "Casa",
  trabalho: "Trabalho",
  estudos: "Estudos",
  mercado: "Mercado",
  saude: "Saúde",
  outros: "Outros"
};

var nomesPrioridades = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa"
};

var pesos = {
  alta: 1,
  media: 2,
  baixa: 3
};

var arrastando = null;

var filtroAtual = "todas";

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

function atualizarResumo() {
  document.getElementById("total-pendentes").innerText = pendentes.children.length;
  document.getElementById("total-fazendo").innerText = fazendo.children.length;
  document.getElementById("total-concluidas").innerText = concluidas.children.length;

  var total = pendentes.children.length + fazendo.children.length + concluidas.children.length;
  var feitas = concluidas.children.length;
  var porcentagem = 0;

  if (total > 0) {
    porcentagem = Math.round((feitas / total) * 100);
  }

  document.getElementById("porcentagem").innerText = porcentagem;
  document.getElementById("barra-cheia").style.width = porcentagem + "%";
  document.getElementById("barra").setAttribute("aria-valuenow", porcentagem);

  var texto = document.getElementById("texto-progresso");

  if (total == 0) {
    texto.innerText = "Nenhuma tarefa ainda";
  } else if (feitas == total) {
    texto.innerText = "Tudo feito! Bom trabalho 🎉";
  } else {
    texto.innerText = feitas + " de " + total + " tarefas concluídas";
  }

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

function salvar() {
  var tarefas = [];
  var itens = document.querySelectorAll("li");

  for (var i = 0; i < itens.length; i++) {
    tarefas.push({
      texto: itens[i].dataset.texto,
      categoria: itens[i].dataset.categoria,
      prioridade: itens[i].dataset.prioridade,
      coluna: itens[i].parentElement.id
    });
  }

  localStorage.setItem("hextask", JSON.stringify(tarefas));
}

function moverPara(item, coluna) {
  var antesDe = null;

  for (var i = 0; i < coluna.children.length; i++) {
    var outra = coluna.children[i];

    if (outra != item && pesos[outra.dataset.prioridade] > pesos[item.dataset.prioridade]) {
      antesDe = outra;
      break;
    }
  }

  coluna.insertBefore(item, antesDe);

  if (coluna == concluidas) {
    item.classList.add("feita");
  } else {
    item.classList.remove("feita");
  }

  atualizarResumo();
  salvar();
}

function criarTarefa(texto, cat, nomeColuna, prio) {
  if (!prio) {
    prio = "media";
  }

  var item = document.createElement("li");
  item.draggable = true;
  item.dataset.texto = texto;
  item.dataset.categoria = cat;
  item.dataset.prioridade = prio;

  var marcar = document.createElement("button");
  marcar.className = "marcar";
  marcar.title = "Marcar como concluída";
  marcar.setAttribute("aria-label", "Marcar como concluída");

  marcar.onclick = function (evento) {
    evento.stopPropagation();
    if (item.parentElement == concluidas) {
      moverPara(item, pendentes);
    } else {
      moverPara(item, concluidas);
    }
  };

  item.appendChild(marcar);

  var corpo = document.createElement("div");
  corpo.className = "corpo";

  var etiquetas = document.createElement("div");
  etiquetas.className = "etiquetas";

  var etiqueta = document.createElement("span");
  etiqueta.innerText = nomesCategorias[cat];
  etiqueta.className = "etiqueta " + cat;
  etiquetas.appendChild(etiqueta);

  var nivel = document.createElement("span");
  nivel.innerText = nomesPrioridades[prio];
  nivel.className = "nivel " + prio;
  nivel.title = "Prioridade " + nomesPrioridades[prio].toLowerCase();
  etiquetas.appendChild(nivel);

  corpo.appendChild(etiquetas);

  var textoTarefa = document.createElement("span");
  textoTarefa.innerText = texto;
  textoTarefa.className = "texto";
  corpo.appendChild(textoTarefa);

  item.appendChild(corpo);

  textoTarefa.onclick = function (evento) {
    if (textoTarefa.isContentEditable) {
      evento.stopPropagation();
    }
  };

  textoTarefa.onkeydown = function (evento) {
    if (evento.key == "Enter") {
      evento.preventDefault();
      textoTarefa.blur();
    } else if (evento.key == "Escape") {
      textoTarefa.innerText = item.dataset.texto;
      textoTarefa.blur();
    }
  };

  textoTarefa.onblur = function () {
    textoTarefa.contentEditable = "false";
    item.draggable = true;

    var novoTexto = textoTarefa.innerText.trim();

    if (novoTexto == "") {
      textoTarefa.innerText = item.dataset.texto;
    } else {
      item.dataset.texto = novoTexto;
      textoTarefa.innerText = novoTexto;
      salvar();
    }
  };

  var editar = document.createElement("button");
  editar.innerText = "✎";
  editar.className = "editar";
  editar.title = "Editar tarefa";
  editar.setAttribute("aria-label", "Editar tarefa");

  editar.onclick = function (evento) {
    evento.stopPropagation();
    item.draggable = false;
    textoTarefa.contentEditable = "true";
    textoTarefa.focus();

    var selecao = window.getSelection();
    selecao.selectAllChildren(textoTarefa);
  };

  item.appendChild(editar);

  item.ondragstart = function () {
    arrastando = item;
    item.classList.add("arrastando");
  };

  item.ondragend = function () {
    item.classList.remove("arrastando");
  };

  item.onclick = function () {
    if (item.parentElement == pendentes) {
      moverPara(item, fazendo);
    } else if (item.parentElement == fazendo) {
      moverPara(item, concluidas);
    } else {
      moverPara(item, pendentes);
    }
  };

  item.tabIndex = 0;

  item.onkeydown = function (evento) {
    if (evento.target != item) {
      return;
    }

    if (evento.key == "Enter" || evento.key == " ") {
      evento.preventDefault();
      item.onclick();
      item.focus();
    }
  };

  var excluir = document.createElement("button");
  excluir.innerText = "X";
  excluir.className = "excluir";
  excluir.title = "Excluir tarefa";
  excluir.setAttribute("aria-label", "Excluir tarefa");

  excluir.onclick = function (evento) {
    evento.stopPropagation();
    item.remove();
    atualizarResumo();
    salvar();
  };

  item.appendChild(excluir);

  var coluna = document.getElementById(nomeColuna) || pendentes;
  moverPara(item, coluna);
  aplicarFiltro();
}

for (var i = 0; i < colunas.length; i++) {
  colunas[i].ondragover = function (evento) {
    evento.preventDefault();
    this.classList.add("destaque");
  };

  colunas[i].ondragleave = function () {
    this.classList.remove("destaque");
  };

  colunas[i].ondrop = function (evento) {
    evento.preventDefault();
    this.classList.remove("destaque");
    moverPara(arrastando, this);
  };
}

for (var f = 0; f < filtros.length; f++) {
  filtros[f].onclick = function () {
    for (var k = 0; k < filtros.length; k++) {
      filtros[k].classList.remove("ativo");
      filtros[k].setAttribute("aria-pressed", "false");
    }

    this.classList.add("ativo");
    this.setAttribute("aria-pressed", "true");
    filtroAtual = this.dataset.categoria;
    aplicarFiltro();
  };
}

function adicionar() {
  var texto = campo.value.trim();

  if (texto == "") {
    alert("Digite uma tarefa!");
    return;
  }

  criarTarefa(texto, categoria.value, "pendentes", prioridade.value);

  campo.value = "";
  campo.focus();
}

botao.onclick = adicionar;

campo.onkeydown = function (evento) {
  if (evento.key == "Enter") {
    adicionar();
  }
};

limpar.onclick = function () {
  concluidas.innerHTML = "";
  atualizarResumo();
  salvar();
};

var tema = document.getElementById("tema");

function aplicarTema(nome) {
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

  var corBarra = document.querySelector('meta[name="theme-color"]');
  if (nome == "escuro") {
    corBarra.setAttribute("content", "#171A21");
  } else {
    corBarra.setAttribute("content", "#FFFFFF");
  }

  localStorage.setItem("hextask-tema", nome);
}

tema.onclick = function () {
  if (document.body.classList.contains("escuro")) {
    aplicarTema("claro");
  } else {
    aplicarTema("escuro");
  }
};

aplicarTema(localStorage.getItem("hextask-tema") || "claro");
mostrarSaudacao();

setInterval(mostrarSaudacao, 1000);

var salvas = JSON.parse(localStorage.getItem("hextask")) || [];

for (var j = 0; j < salvas.length; j++) {
  criarTarefa(salvas[j].texto, salvas[j].categoria, salvas[j].coluna, salvas[j].prioridade);
}

atualizarResumo();
