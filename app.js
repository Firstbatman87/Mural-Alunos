// ================= CONFIG =================
const URL = "https://script.google.com/macros/s/AKfycbz67gWcN6pohsKnmq2boyY891DZq3BMLF3R_Zgtf1LDET_cu60HKXg9HbLrVha75YvMdg/exec";

let dados = [];
let abaAtual = "";
let professorAtual = "";

// ================= THEME =================
function toggleTheme() {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
}

(function () {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
})();

// ================= MODAL =================
function abrirImagem(src) {
    const modal = document.getElementById("modal");
    const img = document.getElementById("imgModal");

    img.src = src;
    modal.style.display = "flex";
}

document.getElementById("modal").onclick = function () {
    this.style.display = "none";
};

// ================= UTIL =================
function converterLinkDrive(url) {
    if (!url) return "";

    const match = url.match(/\/d\/(.*?)\//);
    if (match) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    return url;
}

// ================= FILTRO PROFESSOR =================
function selecionarProfessor(prof) {
    professorAtual = prof;

    document.querySelectorAll("#filtroProf .aba").forEach(el => {
        el.classList.remove("ativa");
        if (el.textContent === (prof || "Todos")) {
            el.classList.add("ativa");
        }
    });

    filtrar();
}

function criarFiltroProfessor(data) {
    const professores = [...new Set(data.map(item => item.professor).filter(Boolean))];
    const container = document.getElementById("filtroProf");

    container.innerHTML = "";

    const todos = document.createElement("div");
    todos.textContent = "Todos";
    todos.className = "aba ativa";
    todos.onclick = () => selecionarProfessor("");
    container.appendChild(todos);

    professores.forEach(prof => {
        const el = document.createElement("div");
        el.textContent = prof;
        el.className = "aba";
        el.onclick = () => selecionarProfessor(prof);
        container.appendChild(el);
    });
}

// ================= ABAS =================
function selecionarAba(turma) {
    abaAtual = turma;

    document.querySelectorAll("#abas .aba").forEach(el => {
        el.classList.remove("ativa");
        if (el.textContent === (turma || "Todas")) {
            el.classList.add("ativa");
        }
    });

    filtrar();
}

function criarAbas(data) {
    const turmas = [...new Set(data.map(item => item.turma).filter(Boolean))];
    const container = document.getElementById("abas");

    container.innerHTML = "";

    const todas = document.createElement("div");
    todas.textContent = "Todas";
    todas.className = "aba ativa";
    todas.onclick = () => selecionarAba("");
    container.appendChild(todas);

    turmas.forEach(turma => {
        const el = document.createElement("div");
        el.textContent = turma;
        el.className = "aba";
        el.onclick = () => selecionarAba(turma);
        container.appendChild(el);
    });
}

// ================= FILTRAR =================
function filtrar() {
    const busca = document.getElementById("busca").value.toLowerCase();

    const filtrados = dados.filter(item => {
        const texto = (
            (item.titulo || "") +
            (item.descricao || "") +
            (item.categoria || "") +
            (item.turma || "") +
            (item.professor || "")
        ).toLowerCase();

        return (!abaAtual || item.turma === abaAtual) &&
            (!professorAtual || item.professor === professorAtual) &&
            (!busca || texto.includes(busca));
    });

    mostrarDados(filtrados);
}

// ================= DATA FORMAT =================
function formatarData(data) {
    if (!data) return "N/A";

    try {
        const d = new Date(data);
        return d.toLocaleDateString("pt-BR");
    } catch {
        return data;
    }
}

// ================= MOSTRAR =================
function mostrarDados(data) {
    const mural = document.getElementById("mural");
    const loading = document.getElementById("loading");

    loading.style.display = "none";
    mural.innerHTML = "";

    if (data.length === 0) {
        mural.innerHTML = "<div class='vazio'>Nenhuma atividade encontrada</div>";
        return;
    }

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        const imgSrc = converterLinkDrive(item.foto);

        card.innerHTML = `
            ${imgSrc ? `<img src="${imgSrc}" onclick="abrirImagem(this.src)">` : ""}

            <div class="card-content">
                <h2>${item.titulo || "Sem título"}</h2>
                <p>${item.descricao || ""}</p>

                <small>
                    👨‍🏫 ${item.professor || "Não informado"} <br>
                    📘 ${item.disciplina || "Não informado"} <br>

                    📅 Publicado: ${formatarData(item.data)} <br>

                    ${item.dataEntrega
                ? `⏰ Entrega: <b style="color:#ef4444">${item.dataEntrega}</b>`
                : `<span style="color:gray">Sem data de entrega</span>`
            }
                </small>

                <br><br>

                <div class="tag">
                    ${item.categoria || "Sem categoria"} • ${item.turma || "Sem turma"}
                </div>
            </div>
        `;

        mural.appendChild(card);
    });
}

// ================= BUSCA =================
document.getElementById("busca").addEventListener("input", filtrar);

// ================= FETCH =================
async function carregar() {
    try {
        const res = await fetch(URL);
        if (!res.ok) throw new Error("Erro HTTP");

        const j = await res.json();
        if (j.status !== "success") throw new Error(j.message);

        dados = j.data.reverse();

        criarAbas(dados);
        criarFiltroProfessor(dados);
        mostrarDados(dados);

    } catch (e) {
        console.error(e);
        document.getElementById("loading").innerText = "Erro ao carregar";
    }
}

// INIT
carregar();