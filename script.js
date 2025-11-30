// ⭐⭐⭐ DEFINA A PALAVRA SECRETA AQUI (5 letras, em maiúsculas) ⭐⭐⭐
const WORD = "ANDRE"; // A palavra do seu vídeo de exemplo
// ⭐⭐⭐

const NUMBER_OF_GUESSES = 6;
const WORD_LENGTH = 5;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let gameOver = false;

// Definição do teclado português (sem Q, X, Y, W, K do layout do Termo)
const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

// -------------------------------------------------------------------
// 1. Funções de Inicialização (Adiciona data-letter)
// -------------------------------------------------------------------

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            box.setAttribute('data-letter', ''); // Necessário para o CSS
            row.appendChild(box);
        }

        board.appendChild(row);
    }
}

function initKeyboard() {
    // ... (A função initKeyboard é igual à anterior e não precisa de grandes alterações) ...
    let keyboardContainer = document.getElementById("keyboard-container");
    keyboardLayout.forEach(rowKeys => {
        let row = document.createElement("div");
        row.className = "keyboard-row";
        rowKeys.forEach(key => {
            let button = document.createElement("button");
            button.className = "keyboard-button";
            button.textContent = key === 'BACKSPACE' ? '⌫' : key; // Usa o símbolo de backspace
            button.id = `key-${key}`;
            button.setAttribute('data-key', key);
            
            if (key === 'ENTER' || key === 'BACKSPACE') {
                button.classList.add('large-key');
            }

            button.addEventListener('click', () => {
                handleKeyInput(key);
            });
            row.appendChild(button);
        });
        keyboardContainer.appendChild(row);
    });
}


// -------------------------------------------------------------------
// 2. Lógica de Input e Processamento
// -------------------------------------------------------------------

function handleKeyInput(key) {
    if (gameOver) return;

    if (key === "BACKSPACE" || key === '⌫') {
        deleteLetter();
        return;
    }

    if (key === "ENTER") {
        checkGuess();
        return;
    }

    let letter = key.toUpperCase();
    // Filtra apenas letras do alfabeto (pode incluir Ç e Acentos se for avançar)
    if (letter.length === 1 && letter >= 'A' && letter <= 'Z') {
        insertLetter(letter);
    }
}

function insertLetter(letter) {
    if (nextLetter < WORD_LENGTH) {
        let row = document.getElementById(`game-board`).children[NUMBER_OF_GUESSES - guessesRemaining];
        let box = row.children[nextLetter];
        box.setAttribute('data-letter', letter); // Define o atributo para o CSS::before
        box.classList.add("filled-box");
        currentGuess.push(letter);
        nextLetter += 1;
    }
}

function deleteLetter() {
    if (nextLetter > 0) {
        nextLetter -= 1;
        let row = document.getElementById(`game-board`).children[NUMBER_OF_GUESSES - guessesRemaining];
        let box = row.children[nextLetter];
        box.setAttribute('data-letter', ''); // Limpa o atributo
        box.classList.remove("filled-box");
        currentGuess.pop();
    }
}

function checkGuess() {
    let guessString = currentGuess.join("");
    let currentRowIndex = NUMBER_OF_GUESSES - guessesRemaining;
    let currentRow = document.getElementById(`game-board`).children[currentRowIndex];

    if (guessString.length !== WORD_LENGTH) {
        showMessage("Palavra incompleta!");
        currentRow.classList.add('shake');
        setTimeout(() => currentRow.classList.remove('shake'), 600);
        return;
    }
    
    // Simulação da verificação de dicionário
    // Se não tiver dicionário, aceite a palavra, senão use:
    /* if (!DICTIONARY.includes(guessString.toLowerCase())) {
        showMessage("Palavra não reconhecida!");
        currentRow.classList.add('shake');
        setTimeout(() => currentRow.classList.remove('shake'), 600);
        return;
    } */

    
    // Inicia a sequência de animação e coloração
    animateAndColorBoxes(currentRowIndex, guessString);
}


function animateAndColorBoxes(rowIndex, guessString) {
    let wordMap = {}; 
    for(let i = 0; i < WORD_LENGTH; i++) {
        wordMap[WORD[i]] = (wordMap[WORD[i]] || 0) + 1;
    }
    
    let correctGuess = true;
    let currentRow = document.getElementById(`game-board`).children[rowIndex];
    let results = [];

    // Passagem 1: Identificar Verdes e reduzir o mapa
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessString[i] === WORD[i]) {
            results[i] = "correct";
            wordMap[guessString[i]]--;
        } else {
            correctGuess = false;
        }
    }

    // Passagem 2: Identificar Amarelos e Cinzas
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (results[i] === "correct") continue; // Já é verde

        if (WORD.includes(guessString[i]) && wordMap[guessString[i]] > 0) {
            results[i] = "present";
            wordMap[guessString[i]]--;
        } else {
            results[i] = "absent";
        }
    }
    
    // Aplica Animação e Cores Sequencialmente
    for (let i = 0; i < WORD_LENGTH; i++) {
        let box = currentRow.children[i];
        let result = results[i];
        let letter = guessString[i];
        
        // Define um atraso sequencial (0ms, 100ms, 200ms, etc.)
        setTimeout(() => {
            // Aplica a classe de cor antes do 50% do flip
            box.classList.add(result, "flip-tile"); 
            updateKeyboard(letter, `key-${result}`);
            
            // Remove a classe de animação após o flip
            setTimeout(() => {
                box.classList.remove("flip-tile");
            }, 500); 

            // Se for a última peça a virar, verifica o fim do jogo
            if (i === WORD_LENGTH - 1) {
                finalizeTurn(correctGuess);
            }
        }, i * 300); // Atraso de 300ms entre cada peça
    }
}

function finalizeTurn(correctGuess) {
    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (correctGuess) {
        showMessage("Genial", 3000); // ⭐ Alterado para "Genial"
        gameOver = true;
    } else if (guessesRemaining === 0) {
        showMessage(`Fim do Jogo. A palavra era: ${WORD}`, 5000);
        gameOver = true;
    }
}


// -------------------------------------------------------------------
// 3. Funções de Efeito e UI
// -------------------------------------------------------------------

function updateKeyboard(letter, className) {
    let key = document.getElementById(`key-${letter}`);
    
    if (!key) return;

    // Lógica de prioridade de cores: Verde > Amarelo > Cinza
    if (key.classList.contains("key-correct")) {
        return; 
    }
    if (className === "key-present" && key.classList.contains("key-present")) {
        return; 
    }

    // Remove classes anteriores e adiciona a nova
    key.classList.remove("key-present", "key-absent");
    key.classList.add(className);
}

function showMessage(message, duration = 1500) {
    let messageContainer = document.getElementById('message-container');
    messageContainer.textContent = message;
    messageContainer.classList.add('show-message');

    setTimeout(() => {
        messageContainer.classList.remove('show-message');
    }, duration);
}

// Lógica para input do teclado físico
document.addEventListener('keyup', (e) => {
    if (gameOver) return;

    let key = e.key.toUpperCase();

    if (key === 'BACKSPACE') {
        handleKeyInput('BACKSPACE');
    } else if (key === 'ENTER') {
        handleKeyInput('ENTER');
    } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        handleKeyInput(key);
    }
});

// Inicia o jogo
document.addEventListener('DOMContentLoaded', () => {
    initBoard();
    initKeyboard();
});