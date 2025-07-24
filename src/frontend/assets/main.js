document.addEventListener("DOMContentLoaded", () => {
    const { BACKEND_URL, BUCKET_NAME } = window.APP_CONFIG;
    const statusBox = document.getElementById("status-box");
    const codeElements = { middle: document.getElementById("code-middle"), right: document.getElementById("code-right") };
    const gameFrames = { middle: document.getElementById("game-frame-middle"), right: document.getElementById("game-frame-right") };
    const specElement = document.getElementById("spec-view-middle");
    let codeEventSource = null;
    let triviaEventSource = null;

    const PREBUILT_GAMES_INFO = {
        tetris: { html: "tetris.html", spec: "tetris-req.md" },
        "bubble-shooter": { html: "bubble-shooter.html", spec: "bubble-shooter-req.md" },
        snake: { html: "snake.html", spec: "snake-req.md" },
        sudoku: { html: "sudoku.html", spec: "sudoku-req.md" },
        "galaxy-game": { html: "galaxy-game.html", spec: "galaxy-game-req.md" }
    };

    function addStatusItem(content, className) {
        const item = document.createElement("div");
        item.className = "status-item " + className;
        item.innerHTML = content.replace(/\n/g, '<br>');
        statusBox.appendChild(item);
        statusBox.scrollTop = statusBox.scrollHeight;
        return item;
    }

    function setInitialGuide() {
        statusBox.innerHTML = '';
        addStatusItem('좌측의 게임 아이콘을 눌러 미리 만들어진 게임을 확인하거나, 프롬프트로 새로운 게임을 만들어보세요.', 'placeholder');
    }

    async function loadPrebuiltGame(specName) {
        addStatusItem(`<b>${specName.toUpperCase()}</b> 게임을 불러옵니다...`, 'meta');
        const gameInfo = PREBUILT_GAMES_INFO[specName];
        if (!gameInfo) return;

        specElement.innerHTML = "요구서를 불러오는 중...";
        const specUrl = `https://storage.googleapis.com/${BUCKET_NAME}/game-docs/${gameInfo.spec}`;
        try {
            const response = await fetch(specUrl, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const specText = await response.text();
            specElement.innerHTML = marked.parse(specText);
        } catch (e) {
            specElement.textContent = `오류: ${e.message}`;
        }

        const gameUrl = `https://storage.googleapis.com/${BUCKET_NAME}/game-htmls/${gameInfo.html}`;
        try {
            const response = await fetch(gameUrl, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const gameHtml = await response.text();
            codeElements.middle.textContent = gameHtml;
            gameFrames.middle.srcdoc = gameHtml;
            hljs.highlightElement(codeElements.middle);
            document.querySelector('.tab-btn[data-panel="middle"][data-tab="preview"]').click();
        } catch (e) {
            addStatusItem(`오류: '${specName}' 게임 로딩 실패: ${e.message}`, "error");
        }
    }

    function generateGameFromPrompt(prompt, rawPrompt) {
        if (!BACKEND_URL || BACKEND_URL.includes("<")) {
             return addStatusItem("오류: 백엔드 서비스가 설정되지 않았습니다. 스크립트의 URL을 확인해주세요.", "error");
        }
        if (codeEventSource) codeEventSource.close();
        if (triviaEventSource) triviaEventSource.close();

        codeElements.right.textContent = "";
        gameFrames.right.srcdoc = "";
        statusBox.innerHTML = '';

        addStatusItem(`<b>'${rawPrompt}'</b> 게임 생성을 시작합니다...`, "meta");
        const triviaItem = addStatusItem("게임 정보 로딩 중...", "trivia");

        const triviaQuery = new URLSearchParams({ prompt: rawPrompt }).toString();
        triviaEventSource = new EventSource(`${BACKEND_URL}/generate-trivia-stream?${triviaQuery}`);
        let fullTrivia = "";
        triviaEventSource.onmessage = e => {
            const data = JSON.parse(e.data);
            if (data.trivia_chunk) {
                fullTrivia += data.trivia_chunk;
                triviaItem.innerHTML = fullTrivia.replace(/\n/g, '<br>');
            }
            if (data.event === "done") triviaEventSource.close();
        };

        const codeQuery = new URLSearchParams({ prompt: prompt }).toString();
        codeEventSource = new EventSource(`${BACKEND_URL}/generate-stream?${codeQuery}`);
        let fullCode = "";
        codeEventSource.onmessage = e => {
            const data = JSON.parse(e.data);
            if (data.code_chunk) {
                fullCode += data.code_chunk;
                codeElements.right.textContent = fullCode;
            }
            if (data.error) {
                addStatusItem(`코드 생성 오류: ${data.error}`, "error");
                codeEventSource.close();
            }
            if (data.event === "done") {
                codeEventSource.close();
                codeElements.right.innerHTML = hljs.highlight(fullCode, { language: 'html' }).value;
                gameFrames.right.srcdoc = fullCode;
                document.querySelector('.tab-btn[data-panel="right"][data-tab="preview"]').click();
            }
        };
    }

    setInitialGuide();
    document.querySelectorAll(".spec-btn").forEach(btn => btn.addEventListener("click", e => {
        statusBox.innerHTML = '';
        loadPrebuiltGame(e.currentTarget.dataset.spec)
    }));
    document.getElementById("generate-prompt-btn").addEventListener("click", () => {
        const promptText = document.getElementById("prompt-input").value.trim();
        if (promptText) generateGameFromPrompt(encodeURIComponent(promptText), promptText);
        else alert("프롬프트를 입력해주세요.");
    });
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const panel = e.currentTarget.dataset.panel, tab = e.currentTarget.dataset.tab;
            document.querySelectorAll(`.tab-btn[data-panel="${panel}"]`).forEach(b => b.classList.remove("active"));
            document.querySelectorAll(`.tab-content[id$="-${panel}"]`).forEach(c => c.classList.remove("active"));
            e.currentTarget.classList.add("active");
            document.getElementById(`${tab}-view-${panel}`).classList.add("active");
        });
    });
});
