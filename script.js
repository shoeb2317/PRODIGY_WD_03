/**
 * ============================================================================
 * NexusToe - Advanced Interactive Tic-Tac-Toe Web Application
 * Core Game Engine, Minimax AI, Audio Synthesizer & State Management
 * Prodigy InfoTech - Task 03
 * Developer: Shoeb Tahsildar
 * ============================================================================
 */

(function () {
    'use strict';

    /* ------------------------------------------------------------------------
       1. Game Constants & Win Patterns
       ------------------------------------------------------------------------ */
    const WINNING_COMBINATIONS = [
        // Rows
        { combo: [0, 1, 2], line: { x1: 20, y1: 60, x2: 340, y2: 60 } },
        { combo: [3, 4, 5], line: { x1: 20, y1: 180, x2: 340, y2: 180 } },
        { combo: [6, 7, 8], line: { x1: 20, y1: 300, x2: 340, y2: 300 } },
        // Columns
        { combo: [0, 3, 6], line: { x1: 60, y1: 20, x2: 60, y2: 340 } },
        { combo: [1, 4, 7], line: { x1: 180, y1: 20, x2: 180, y2: 340 } },
        { combo: [2, 5, 8], line: { x1: 300, y1: 20, x2: 300, y2: 340 } },
        // Diagonals
        { combo: [0, 4, 8], line: { x1: 30, y1: 30, x2: 330, y2: 330 } },
        { combo: [2, 4, 6], line: { x1: 330, y1: 30, x2: 30, y2: 330 } }
    ];

    const STORAGE_KEY_STATS = 'nexustoe_stats_prodigy_v1';
    const STORAGE_KEY_THEME = 'nexustoe_theme_pref';
    const STORAGE_KEY_SOUND = 'nexustoe_sound_pref';
    const STORAGE_KEY_NAMES = 'nexustoe_player_names';

    /* ------------------------------------------------------------------------
       2. Application State
       ------------------------------------------------------------------------ */
    const state = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameMode: 'ai', // 'ai' or 'pvp'
        aiDifficulty: 'hard', // 'easy', 'medium', 'hard' (minimax)
        humanMarker: 'X',
        aiMarker: 'O',
        isGameActive: true,
        isAiThinking: false,
        moveHistory: [], // Array of { step, player, index, row, col }
        winningCombo: null,
        soundEnabled: false,
        theme: 'dark',
        names: {
            X: 'Player 1',
            O: 'AI Minimax'
        },
        stats: {
            xWins: 0,
            oWins: 0,
            ties: 0,
            totalMatches: 0,
            streak: 0,
            maxStreak: 0
        }
    };

    /* ------------------------------------------------------------------------
       3. DOM Elements Cache
       ------------------------------------------------------------------------ */
    const DOM = {
        board: document.getElementById('board'),
        cells: document.querySelectorAll('.board-cell'),
        winLineSvg: document.getElementById('winLineSvg'),
        winLine: document.getElementById('winLine'),
        statusBanner: document.getElementById('statusBanner'),
        statusHeadline: document.getElementById('statusHeadline'),
        statusSubtext: document.getElementById('statusSubtext'),
        aiThinking: document.getElementById('aiThinking'),

        // Player Roster & Turn Cards
        playerCardX: document.getElementById('playerCardX'),
        playerCardO: document.getElementById('playerCardO'),
        turnTagX: document.getElementById('turnTagX'),
        turnTagO: document.getElementById('turnTagO'),
        nameDisplayX: document.getElementById('nameDisplayX'),
        nameDisplayO: document.getElementById('nameDisplayO'),
        avatarIconO: document.getElementById('avatarIconO'),
        scoreX: document.getElementById('scoreX'),
        scoreO: document.getElementById('scoreO'),

        // Stats Box
        tiesCount: document.getElementById('tiesCount'),
        winStreakCount: document.getElementById('winStreakCount'),
        totalMatchesCount: document.getElementById('totalMatchesCount'),
        winRatioPct: document.getElementById('winRatioPct'),
        resetStatsBtn: document.getElementById('resetStatsBtn'),

        // Controls Bar
        undoBtn: document.getElementById('undoBtn'),
        restartBtn: document.getElementById('restartBtn'),
        newGameBtn: document.getElementById('newGameBtn'),

        // Game Setup Bar
        modeAiBtn: document.getElementById('modeAiBtn'),
        modePvpBtn: document.getElementById('modePvpBtn'),
        difficultyGroup: document.getElementById('difficultyGroup'),
        aiDifficultySelect: document.getElementById('aiDifficultySelect'),
        markerChoiceGroup: document.getElementById('markerChoiceGroup'),
        chooseXBtn: document.getElementById('chooseXBtn'),
        chooseOBtn: document.getElementById('chooseOBtn'),

        // History Drawer
        moveList: document.getElementById('moveList'),
        moveCounter: document.getElementById('moveCounter'),
        historyEmpty: document.getElementById('historyEmpty'),
        historyPanel: document.getElementById('historyPanel'),
        historyToggleBtn: document.getElementById('historyToggleBtn'),
        insightDesc: document.getElementById('insightDesc'),

        // Quick Actions & Headers
        soundToggleBtn: document.getElementById('soundToggleBtn'),
        soundIcon: document.getElementById('soundIcon'),
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        themeIcon: document.getElementById('themeIcon'),
        shortcutsModalBtn: document.getElementById('shortcutsModalBtn'),
        howToPlayBtn: document.getElementById('howToPlayBtn'),
        editNamesBtn: document.getElementById('editNamesBtn'),

        // Modals
        shortcutsModal: document.getElementById('shortcutsModal'),
        closeShortcutsModalBtn: document.getElementById('closeShortcutsModalBtn'),
        dismissShortcutsBtn: document.getElementById('dismissShortcutsBtn'),

        rulesModal: document.getElementById('rulesModal'),
        closeRulesModalBtn: document.getElementById('closeRulesModalBtn'),
        dismissRulesBtn: document.getElementById('dismissRulesBtn'),

        namesModal: document.getElementById('namesModal'),
        closeNamesModalBtn: document.getElementById('closeNamesModalBtn'),
        cancelNamesBtn: document.getElementById('cancelNamesBtn'),
        saveNamesBtn: document.getElementById('saveNamesBtn'),
        inputNameX: document.getElementById('inputNameX'),
        inputNameO: document.getElementById('inputNameO'),

        // Confetti Canvas
        confettiCanvas: document.getElementById('confettiCanvas')
    };

    /* ------------------------------------------------------------------------
       4. Web Audio Synthesizer (Zero External Dependencies)
       ------------------------------------------------------------------------ */
    let audioContext = null;

    function getAudioContext() {
        if (!audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioContext = new AudioContextClass();
            }
        }
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        return audioContext;
    }

    const Sound = {
        playTone(freq, type = 'sine', duration = 0.12, gainLevel = 0.15) {
            if (!state.soundEnabled) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + duration);
            } catch (err) {
                console.warn('Audio synthesis warning:', err);
            }
        },

        clickX() {
            // Crisp high-tech tick for X
            this.playTone(520, 'sine', 0.09, 0.18);
            setTimeout(() => this.playTone(780, 'sine', 0.08, 0.12), 40);
        },

        clickO() {
            // Warm resonant chime for O
            this.playTone(380, 'triangle', 0.1, 0.2);
            setTimeout(() => this.playTone(570, 'triangle', 0.09, 0.14), 40);
        },

        win() {
            // Joyful multi-tone arpeggio fanfare
            const notes = [440, 554.37, 659.25, 880];
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    this.playTone(freq, 'sine', 0.28, 0.22);
                }, idx * 90);
            });
        },

        draw() {
            // Descending tie tone
            this.playTone(320, 'sawtooth', 0.14, 0.1);
            setTimeout(() => this.playTone(260, 'sawtooth', 0.22, 0.12), 110);
        },

        undo() {
            this.playTone(350, 'sine', 0.08, 0.1);
            setTimeout(() => this.playTone(240, 'sine', 0.1, 0.08), 50);
        },

        reset() {
            this.playTone(600, 'sine', 0.06, 0.12);
            setTimeout(() => this.playTone(450, 'sine', 0.08, 0.1), 50);
            setTimeout(() => this.playTone(300, 'sine', 0.12, 0.08), 100);
        }
    };

    /* ------------------------------------------------------------------------
       5. Confetti Particles Celebration System
       ------------------------------------------------------------------------ */
    const Confetti = {
        ctx: null,
        particles: [],
        animId: null,

        init() {
            if (!DOM.confettiCanvas) return;
            this.ctx = DOM.confettiCanvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        },

        resize() {
            if (!DOM.confettiCanvas) return;
            DOM.confettiCanvas.width = window.innerWidth;
            DOM.confettiCanvas.height = window.innerHeight;
        },

        burst() {
            this.particles = [];
            const colors = ['#00f2fe', '#4facfe', '#f43f5e', '#fb7185', '#f59e0b', '#10b981', '#ffffff'];
            const count = 75;

            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2 - 40,
                    w: Math.random() * 8 + 4,
                    h: Math.random() * 8 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: (Math.random() - 0.5) * 16,
                    vy: (Math.random() - 0.5) * 16 - 3,
                    gravity: 0.35,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 10,
                    opacity: 1,
                    decay: Math.random() * 0.015 + 0.01
                });
            }

            if (this.animId) cancelAnimationFrame(this.animId);
            this.render();
        },

        render() {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, DOM.confettiCanvas.width, DOM.confettiCanvas.height);

            let activeCount = 0;

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                if (p.opacity <= 0) continue;

                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.rotation += p.rotationSpeed;
                p.opacity -= p.decay;

                if (p.opacity > 0) {
                    activeCount++;
                    this.ctx.save();
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate((p.rotation * Math.PI) / 180);
                    this.ctx.globalAlpha = Math.max(0, p.opacity);
                    this.ctx.fillStyle = p.color;
                    this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    this.ctx.restore();
                }
            }

            if (activeCount > 0) {
                this.animId = requestAnimationFrame(() => this.render());
            } else {
                this.ctx.clearRect(0, 0, DOM.confettiCanvas.width, DOM.confettiCanvas.height);
            }
        }
    };

    /* ------------------------------------------------------------------------
       6. Minimax AI Algorithm Engine
       ------------------------------------------------------------------------ */
    const AI = {
        /**
         * Select best move based on active difficulty
         */
        chooseMove(board, aiSymbol, humanSymbol, difficulty) {
            const emptyIndices = AI.getEmptyIndices(board);
            if (emptyIndices.length === 0) return null;

            // 1. Easy Mode: Casual random choice
            if (difficulty === 'easy') {
                const randomIndex = Math.floor(Math.random() * emptyIndices.length);
                return emptyIndices[randomIndex];
            }

            // 2. Medium Mode: Check winning move -> Check blocking move -> Center -> Corners -> Random
            if (difficulty === 'medium') {
                // A. Can AI win on this turn?
                for (let idx of emptyIndices) {
                    board[idx] = aiSymbol;
                    if (AI.checkWin(board, aiSymbol)) {
                        board[idx] = '';
                        return idx;
                    }
                    board[idx] = '';
                }

                // B. Can Human win on next turn? Block it!
                for (let idx of emptyIndices) {
                    board[idx] = humanSymbol;
                    if (AI.checkWin(board, humanSymbol)) {
                        board[idx] = '';
                        return idx;
                    }
                    board[idx] = '';
                }

                // C. Take Center (Index 4) if available with 70% probability
                if (emptyIndices.includes(4) && Math.random() < 0.7) {
                    return 4;
                }

                // D. Otherwise pick from corners or random
                const corners = [0, 2, 6, 8].filter(c => emptyIndices.includes(c));
                if (corners.length > 0 && Math.random() < 0.6) {
                    return corners[Math.floor(Math.random() * corners.length)];
                }

                return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            }

            // 3. Hard / Impossible Mode: Full Recursive Minimax with Alpha-Beta Pruning
            let bestScore = -Infinity;
            let bestMove = emptyIndices[0];

            for (let idx of emptyIndices) {
                board[idx] = aiSymbol;
                const score = AI.minimax(board, 0, false, -Infinity, Infinity, aiSymbol, humanSymbol);
                board[idx] = '';

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = idx;
                }
            }

            return bestMove;
        },

        /**
         * Recursive Minimax with Alpha-Beta Pruning & Depth Weighting
         */
        minimax(board, depth, isMaximizing, alpha, beta, aiSymbol, humanSymbol) {
            // Check terminal conditions
            if (AI.checkWin(board, aiSymbol)) {
                return 10 - depth; // Favor faster wins
            }
            if (AI.checkWin(board, humanSymbol)) {
                return depth - 10; // Favor delayed losses
            }
            const emptyIndices = AI.getEmptyIndices(board);
            if (emptyIndices.length === 0) {
                return 0; // Draw
            }

            if (isMaximizing) {
                let maxEval = -Infinity;
                for (let idx of emptyIndices) {
                    board[idx] = aiSymbol;
                    const evaluation = AI.minimax(board, depth + 1, false, alpha, beta, aiSymbol, humanSymbol);
                    board[idx] = '';
                    maxEval = Math.max(maxEval, evaluation);
                    alpha = Math.max(alpha, evaluation);
                    if (beta <= alpha) break; // Alpha-beta cutoff
                }
                return maxEval;
            } else {
                let minEval = Infinity;
                for (let idx of emptyIndices) {
                    board[idx] = humanSymbol;
                    const evaluation = AI.minimax(board, depth + 1, true, alpha, beta, aiSymbol, humanSymbol);
                    board[idx] = '';
                    minEval = Math.min(minEval, evaluation);
                    beta = Math.min(beta, evaluation);
                    if (beta <= alpha) break; // Alpha-beta cutoff
                }
                return minEval;
            }
        },

        getEmptyIndices(board) {
            const indices = [];
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') indices.push(i);
            }
            return indices;
        },

        checkWin(board, player) {
            for (let win of WINNING_COMBINATIONS) {
                const [a, b, c] = win.combo;
                if (board[a] === player && board[b] === player && board[c] === player) {
                    return true;
                }
            }
            return false;
        }
    };

    /* ------------------------------------------------------------------------
       7. Game Execution & State Transitions
       ------------------------------------------------------------------------ */

    /**
     * Handle user cell click
     */
    function handleCellClick(index) {
        if (!state.isGameActive || state.isAiThinking) return;
        if (state.board[index] !== '') return;

        // In AI mode, prevent human from clicking when it's AI's turn
        if (state.gameMode === 'ai' && state.currentPlayer !== state.humanMarker) {
            return;
        }

        makeMove(index, state.currentPlayer);

        // Check if game continues
        if (state.isGameActive && state.gameMode === 'ai' && state.currentPlayer === state.aiMarker) {
            triggerAiMove();
        }
    }

    /**
     * Executes a move on the board
     */
    function makeMove(index, player) {
        state.board[index] = player;

        const row = Math.floor(index / 3) + 1;
        const col = (index % 3) + 1;
        state.moveHistory.push({
            step: state.moveHistory.length + 1,
            player: player,
            index: index,
            row: row,
            col: col
        });

        // Play audio
        if (player === 'X') Sound.clickX();
        else Sound.clickO();

        // Update Board UI for this cell
        renderCell(index, player);
        renderHistory();

        // Check for Win or Draw
        const win = checkWinCondition(state.board, player);

        if (win) {
            handleGameWin(player, win);
        } else if (isBoardFull(state.board)) {
            handleGameDraw();
        } else {
            // Switch Turn
            state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
            updateTurnIndicators();
        }

        updateUndoButtonState();
    }

    /**
     * AI Turn handler with simulated thinking delay
     */
    function triggerAiMove() {
        state.isAiThinking = true;
        DOM.aiThinking.classList.remove('hidden');

        // Dynamic realistic thinking time between 350ms to 550ms
        const delay = Math.floor(Math.random() * 200) + 350;

        setTimeout(() => {
            if (!state.isGameActive) {
                state.isAiThinking = false;
                DOM.aiThinking.classList.add('hidden');
                return;
            }

            const aiIndex = AI.chooseMove(
                state.board,
                state.aiMarker,
                state.humanMarker,
                state.aiDifficulty
            );

            state.isAiThinking = false;
            DOM.aiThinking.classList.add('hidden');

            if (aiIndex !== null && state.board[aiIndex] === '') {
                makeMove(aiIndex, state.aiMarker);
            }
        }, delay);
    }

    /**
     * Check if a player has achieved three in a row
     */
    function checkWinCondition(board, player) {
        for (let item of WINNING_COMBINATIONS) {
            const [a, b, c] = item.combo;
            if (board[a] === player && board[b] === player && board[c] === player) {
                return item;
            }
        }
        return null;
    }

    /**
     * Checks if board has no empty spots left
     */
    function isBoardFull(board) {
        return board.every(cell => cell !== '');
    }

    /**
     * Handle Round Win
     */
    function handleGameWin(winner, winData) {
        state.isGameActive = false;
        state.winningCombo = winData.combo;

        // Draw animated strike-through line
        drawWinningLine(winData.line, winner);

        // Highlight cells
        winData.combo.forEach(idx => {
            const cell = DOM.cells[idx];
            if (cell) cell.classList.add('winning-cell');
        });

        // Update score
        if (winner === 'X') {
            state.stats.xWins++;
            if (state.gameMode === 'ai' && state.humanMarker === 'X') {
                state.stats.streak++;
            } else if (state.gameMode === 'ai' && state.humanMarker === 'O') {
                state.stats.streak = 0;
            } else {
                state.stats.streak++;
            }
        } else {
            state.stats.oWins++;
            if (state.gameMode === 'ai' && state.humanMarker === 'O') {
                state.stats.streak++;
            } else if (state.gameMode === 'ai' && state.humanMarker === 'X') {
                state.stats.streak = 0;
            } else {
                state.stats.streak++;
            }
        }

        if (state.stats.streak > state.stats.maxStreak) {
            state.stats.maxStreak = state.stats.streak;
        }

        state.stats.totalMatches++;
        saveStats();
        updateScoreboardDisplay();

        // Audio and Confetti
        Sound.win();
        Confetti.burst();

        // Status Banner
        const winnerName = state.names[winner] || `Player ${winner}`;
        DOM.statusBanner.className = `status-banner winner-${winner.toLowerCase()}`;
        DOM.statusHeadline.textContent = `🎉 ${winnerName} Wins!`;
        DOM.statusSubtext.textContent = `Matched 3 in a row! Press Restart or 'R' to play again.`;
    }

    /**
     * Handle Draw / Tie Game
     */
    function handleGameDraw() {
        state.isGameActive = false;
        state.stats.ties++;
        state.stats.streak = 0;
        state.stats.totalMatches++;
        saveStats();
        updateScoreboardDisplay();

        Sound.draw();

        DOM.statusBanner.className = 'status-banner draw-game';
        DOM.statusHeadline.textContent = `🤝 Match Tied!`;
        DOM.statusSubtext.textContent = `Every cell filled with no winner. Press Restart for next round.`;
    }

    /**
     * Draws the SVG strike-through line across winning cells
     */
    function drawWinningLine(lineCoords, winner) {
        const { x1, y1, x2, y2 } = lineCoords;
        DOM.winLine.setAttribute('x1', x1);
        DOM.winLine.setAttribute('y1', y1);
        DOM.winLine.setAttribute('x2', x2);
        DOM.winLine.setAttribute('y2', y2);

        // Calculate line distance for dasharray animation
        const length = Math.hypot(x2 - x1, y2 - y1);
        DOM.winLine.style.strokeDasharray = length;
        DOM.winLine.style.strokeDashoffset = length;

        DOM.winLine.className = `win-line line-${winner.toLowerCase()} active`;
    }

    /**
     * Clears the winning strike line
     */
    function clearWinningLine() {
        DOM.winLine.setAttribute('x1', 0);
        DOM.winLine.setAttribute('y1', 0);
        DOM.winLine.setAttribute('x2', 0);
        DOM.winLine.setAttribute('y2', 0);
        DOM.winLine.className = 'win-line';
        DOM.winLine.style.strokeDasharray = 'none';
        DOM.winLine.style.strokeDashoffset = 'none';
    }

    /**
     * Undo Move
     */
    function undoMove() {
        if (state.moveHistory.length === 0 || state.isAiThinking) return;

        // If in AI mode, undo human + AI moves so turn remains with human
        const movesToPop = (state.gameMode === 'ai' && state.moveHistory.length >= 2 && state.isGameActive) ? 2 : 1;

        for (let i = 0; i < movesToPop; i++) {
            if (state.moveHistory.length === 0) break;
            const lastMove = state.moveHistory.pop();
            state.board[lastMove.index] = '';
            const cell = DOM.cells[lastMove.index];
            if (cell) {
                cell.className = 'board-cell';
                const sym = cell.querySelector('.cell-symbol');
                if (sym) sym.textContent = '';
            }
        }

        // If game was over, reactivate
        state.isGameActive = true;
        clearWinningLine();
        DOM.cells.forEach(c => c.classList.remove('winning-cell'));

        // Recalculate turn based on remaining moves
        if (state.moveHistory.length === 0) {
            state.currentPlayer = 'X';
        } else {
            const lastMove = state.moveHistory[state.moveHistory.length - 1];
            state.currentPlayer = lastMove.player === 'X' ? 'O' : 'X';
        }

        Sound.undo();
        renderHistory();
        updateTurnIndicators();
        updateUndoButtonState();
    }

    /**
     * Restart current match series round
     */
    function restartMatch(silent = false) {
        state.board.fill('');
        state.moveHistory = [];
        state.winningCombo = null;
        state.isGameActive = true;
        state.isAiThinking = false;
        DOM.aiThinking.classList.add('hidden');

        // Reset turn: X always starts
        state.currentPlayer = 'X';

        // Clear cells
        DOM.cells.forEach(cell => {
            cell.className = 'board-cell';
            const sym = cell.querySelector('.cell-symbol');
            if (sym) sym.textContent = '';
        });

        clearWinningLine();
        renderHistory();
        updateTurnIndicators();
        updateUndoButtonState();

        if (!silent) Sound.reset();

        // If in AI mode and AI is 'X', trigger AI's first move
        if (state.gameMode === 'ai' && state.aiMarker === 'X') {
            triggerAiMove();
        }
    }

    /**
     * Start Fresh New Game (resets match, optionally prompts confirmation)
     */
    function startNewGame() {
        restartMatch();
    }

    /* ------------------------------------------------------------------------
       8. UI Rendering Helpers
       ------------------------------------------------------------------------ */

    function renderCell(index, player) {
        const cell = DOM.cells[index];
        if (!cell) return;

        cell.classList.add('taken', `marker-${player.toLowerCase()}`);
        const sym = cell.querySelector('.cell-symbol');
        if (sym) sym.textContent = player;
    }

    function updateTurnIndicators() {
        // Update board hover data attribute
        DOM.board.setAttribute('data-turn', state.currentPlayer);

        const isX = state.currentPlayer === 'X';
        DOM.playerCardX.classList.toggle('active-turn', isX);
        DOM.playerCardO.classList.toggle('active-turn', !isX);

        DOM.turnTagX.classList.toggle('hidden', !isX);
        DOM.turnTagO.classList.toggle('hidden', isX);

        DOM.statusBanner.className = `status-banner turn-${state.currentPlayer.toLowerCase()}`;

        const playerName = state.names[state.currentPlayer] || `Player ${state.currentPlayer}`;
        DOM.statusHeadline.textContent = `${playerName}'s Turn (${state.currentPlayer})`;

        if (state.gameMode === 'ai' && state.currentPlayer === state.aiMarker) {
            DOM.statusSubtext.textContent = 'AI is evaluating positions...';
        } else {
            DOM.statusSubtext.textContent = 'Click any empty cell to place your marker';
        }
    }

    function renderHistory() {
        DOM.moveCounter.textContent = `${state.moveHistory.length} / 9 Moves`;

        if (state.moveHistory.length === 0) {
            DOM.historyEmpty.classList.remove('hidden');
            DOM.moveList.innerHTML = '';
            DOM.moveList.appendChild(DOM.historyEmpty);
            return;
        }

        DOM.historyEmpty.classList.add('hidden');
        DOM.moveList.innerHTML = '';

        state.moveHistory.forEach(item => {
            const rowEl = document.createElement('div');
            rowEl.className = 'history-item';

            const leftCol = document.createElement('div');
            leftCol.className = 'history-item-left';

            const numSpan = document.createElement('span');
            numSpan.className = 'history-step-num';
            numSpan.textContent = `#${item.step}`;

            const badge = document.createElement('span');
            badge.className = `history-marker-badge marker-${item.player.toLowerCase()}`;
            badge.textContent = item.player;

            leftCol.appendChild(numSpan);
            leftCol.appendChild(badge);

            const coordSpan = document.createElement('span');
            coordSpan.className = 'history-coord';
            coordSpan.textContent = `Row ${item.row}, Col ${item.col} (Cell ${item.index + 1})`;

            rowEl.appendChild(leftCol);
            rowEl.appendChild(coordSpan);

            DOM.moveList.appendChild(rowEl);
        });

        // Scroll to bottom
        DOM.moveList.scrollTop = DOM.moveList.scrollHeight;
    }

    function updateUndoButtonState() {
        DOM.undoBtn.disabled = state.moveHistory.length === 0 || !state.isGameActive;
    }

    function updateScoreboardDisplay() {
        DOM.scoreX.textContent = state.stats.xWins;
        DOM.scoreO.textContent = state.stats.oWins;
        DOM.tiesCount.textContent = state.stats.ties;
        DOM.winStreakCount.textContent = state.stats.streak;
        DOM.totalMatchesCount.textContent = state.stats.totalMatches;

        // Calculate Win Rate for Player 1 / Human
        const total = state.stats.totalMatches;
        if (total === 0) {
            DOM.winRatioPct.textContent = '0%';
        } else {
            const humanWins = (state.gameMode === 'ai' && state.humanMarker === 'O') ? state.stats.oWins : state.stats.xWins;
            const pct = Math.round((humanWins / total) * 100);
            DOM.winRatioPct.textContent = `${pct}%`;
        }
    }

    /* ------------------------------------------------------------------------
       9. Game Mode & Configuration Handlers
       ------------------------------------------------------------------------ */

    function setGameMode(mode) {
        state.gameMode = mode;

        if (mode === 'ai') {
            DOM.modeAiBtn.classList.add('active');
            DOM.modeAiBtn.setAttribute('aria-checked', 'true');
            DOM.modePvpBtn.classList.remove('active');
            DOM.modePvpBtn.setAttribute('aria-checked', 'false');

            DOM.difficultyGroup.classList.remove('hidden');
            DOM.markerChoiceGroup.classList.remove('hidden');

            state.names.O = `AI (${state.aiDifficulty.toUpperCase()})`;
            DOM.nameDisplayO.textContent = state.names.O;
            DOM.avatarIconO.className = 'fa-solid fa-robot';

            updateAiInsightDesc();
        } else {
            DOM.modePvpBtn.classList.add('active');
            DOM.modePvpBtn.setAttribute('aria-checked', 'true');
            DOM.modeAiBtn.classList.remove('active');
            DOM.modeAiBtn.setAttribute('aria-checked', 'false');

            DOM.difficultyGroup.classList.add('hidden');
            DOM.markerChoiceGroup.classList.add('hidden');

            state.names.O = 'Player 2';
            DOM.nameDisplayO.textContent = state.names.O;
            DOM.avatarIconO.className = 'fa-solid fa-user-group';

            DOM.insightDesc.innerHTML = 'In <strong>Player vs Player</strong> mode, two opponents pass and play locally on the same device. Perfect for head-to-head tactical duels!';
        }

        restartMatch();
    }

    function setAiDifficulty(diff) {
        state.aiDifficulty = diff;
        if (state.gameMode === 'ai') {
            state.names.O = `AI (${diff.toUpperCase()})`;
            DOM.nameDisplayO.textContent = state.names.O;
        }
        updateAiInsightDesc();
        restartMatch();
    }

    function updateAiInsightDesc() {
        if (state.aiDifficulty === 'easy') {
            DOM.insightDesc.innerHTML = 'On <strong>Easy</strong> mode, the AI chooses moves completely at random without offensive or defensive checks. Great for warm-ups!';
        } else if (state.aiDifficulty === 'medium') {
            DOM.insightDesc.innerHTML = 'On <strong>Medium</strong> mode, the AI actively claims winning moves and blocks your tri-alignments, falling back to positional choices.';
        } else {
            DOM.insightDesc.innerHTML = 'On <strong>Impossible</strong> mode, the AI executes a recursive <em>Minimax with Alpha-Beta pruning</em> algorithm. It is mathematically unbeatable!';
        }
    }

    function setHumanMarker(marker) {
        state.humanMarker = marker;
        state.aiMarker = marker === 'X' ? 'O' : 'X';

        DOM.chooseXBtn.classList.toggle('active', marker === 'X');
        DOM.chooseOBtn.classList.toggle('active', marker === 'O');

        if (marker === 'X') {
            DOM.nameDisplayX.textContent = state.names.X || 'You';
            DOM.nameDisplayO.textContent = state.names.O;
        } else {
            DOM.nameDisplayX.textContent = state.names.O;
            DOM.nameDisplayO.textContent = state.names.X || 'You';
        }

        restartMatch();
    }

    /* ------------------------------------------------------------------------
       10. Theme, Sound & Storage Persistence
       ------------------------------------------------------------------------ */

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        state.theme = newTheme;

        if (DOM.themeIcon) {
            DOM.themeIcon.className = newTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }

        try {
            localStorage.setItem(STORAGE_KEY_THEME, newTheme);
        } catch (e) {}
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;

        if (DOM.soundIcon) {
            DOM.soundIcon.className = state.soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        }
        DOM.soundToggleBtn.classList.toggle('active-action', state.soundEnabled);

        if (state.soundEnabled) {
            getAudioContext();
            Sound.clickX();
        }

        try {
            localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(state.soundEnabled));
        } catch (e) {}
    }

    function loadSavedPreferences() {
        // Theme
        try {
            const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
            if (savedTheme) {
                state.theme = savedTheme;
                document.documentElement.setAttribute('data-theme', savedTheme);
                if (DOM.themeIcon) {
                    DOM.themeIcon.className = savedTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
                }
            }
        } catch (e) {}

        // Sound
        try {
            const savedSound = localStorage.getItem(STORAGE_KEY_SOUND);
            if (savedSound !== null) {
                state.soundEnabled = JSON.parse(savedSound);
                if (DOM.soundIcon) {
                    DOM.soundIcon.className = state.soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
                }
                DOM.soundToggleBtn.classList.toggle('active-action', state.soundEnabled);
            }
        } catch (e) {}

        // Stats
        try {
            const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
            if (savedStats) {
                state.stats = Object.assign(state.stats, JSON.parse(savedStats));
                updateScoreboardDisplay();
            }
        } catch (e) {}

        // Names
        try {
            const savedNames = localStorage.getItem(STORAGE_KEY_NAMES);
            if (savedNames) {
                const parsed = JSON.parse(savedNames);
                if (parsed.X) state.names.X = parsed.X;
                DOM.nameDisplayX.textContent = state.names.X;
            }
        } catch (e) {}
    }

    function saveStats() {
        try {
            localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(state.stats));
        } catch (e) {}
    }

    function resetStats() {
        if (!confirm('Are you sure you want to reset all game scores and match records?')) {
            return;
        }

        state.stats = {
            xWins: 0,
            oWins: 0,
            ties: 0,
            totalMatches: 0,
            streak: 0,
            maxStreak: 0
        };

        saveStats();
        updateScoreboardDisplay();
        restartMatch(true);
    }

    /* ------------------------------------------------------------------------
       11. Modal Logic (Custom Names, Shortcuts, Rules)
       ------------------------------------------------------------------------ */

    function openModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.remove('hidden');
    }

    function closeModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.add('hidden');
    }

    function savePlayerNames() {
        const valX = DOM.inputNameX.value.trim() || 'Player 1';
        const valO = DOM.inputNameO.value.trim() || (state.gameMode === 'ai' ? 'AI Minimax' : 'Player 2');

        state.names.X = valX;
        state.names.O = valO;

        DOM.nameDisplayX.textContent = valX;
        DOM.nameDisplayO.textContent = valO;

        try {
            localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(state.names));
        } catch (e) {}

        updateTurnIndicators();
        closeModal(DOM.namesModal);
    }

    /* ------------------------------------------------------------------------
       12. Keyboard Navigation & Shortcuts
       ------------------------------------------------------------------------ */
    function handleKeyDown(e) {
        // Prevent key events when typing inside text inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            if (e.key === 'Escape') {
                closeModal(DOM.namesModal);
            }
            return;
        }

        const key = e.key;

        // Number Keys 1 through 9 for grid cells
        if (/^[1-9]$/.test(key)) {
            e.preventDefault();
            const index = parseInt(key, 10) - 1;
            handleCellClick(index);
            return;
        }

        // Action Keys
        switch (key.toLowerCase()) {
            case 'r':
                e.preventDefault();
                restartMatch();
                break;
            case 'u':
                e.preventDefault();
                undoMove();
                break;
            case 'n':
                e.preventDefault();
                startNewGame();
                break;
            case 'm':
                e.preventDefault();
                toggleSound();
                break;
            case 't':
                e.preventDefault();
                toggleTheme();
                break;
            case 's':
                e.preventDefault();
                setGameMode(state.gameMode === 'ai' ? 'pvp' : 'ai');
                break;
            case '?':
                e.preventDefault();
                openModal(DOM.rulesModal);
                break;
            case 'escape':
                closeModal(DOM.shortcutsModal);
                closeModal(DOM.rulesModal);
                closeModal(DOM.namesModal);
                break;
        }
    }

    /* ------------------------------------------------------------------------
       13. Event Listeners Setup
       ------------------------------------------------------------------------ */
    function initEventListeners() {
        // Board Cells Click
        DOM.cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const index = parseInt(cell.getAttribute('data-index'), 10);
                handleCellClick(index);
            });
        });

        // Controls
        DOM.undoBtn.addEventListener('click', undoMove);
        DOM.restartBtn.addEventListener('click', () => restartMatch());
        DOM.newGameBtn.addEventListener('click', startNewGame);
        DOM.resetStatsBtn.addEventListener('click', resetStats);

        // Setup Bar Controls
        DOM.modeAiBtn.addEventListener('click', () => setGameMode('ai'));
        DOM.modePvpBtn.addEventListener('click', () => setGameMode('pvp'));

        DOM.aiDifficultySelect.addEventListener('change', (e) => {
            setAiDifficulty(e.target.value);
        });

        DOM.chooseXBtn.addEventListener('click', () => setHumanMarker('X'));
        DOM.chooseOBtn.addEventListener('click', () => setHumanMarker('O'));

        // Header Actions
        DOM.themeToggleBtn.addEventListener('click', toggleTheme);
        DOM.soundToggleBtn.addEventListener('click', toggleSound);

        // Drawer Toggle for Mobile/History
        DOM.historyToggleBtn.addEventListener('click', () => {
            DOM.historyPanel.classList.toggle('hidden');
        });

        // Modals
        DOM.shortcutsModalBtn.addEventListener('click', () => openModal(DOM.shortcutsModal));
        DOM.closeShortcutsModalBtn.addEventListener('click', () => closeModal(DOM.shortcutsModal));
        DOM.dismissShortcutsBtn.addEventListener('click', () => closeModal(DOM.shortcutsModal));

        DOM.howToPlayBtn.addEventListener('click', () => openModal(DOM.rulesModal));
        DOM.closeRulesModalBtn.addEventListener('click', () => closeModal(DOM.rulesModal));
        DOM.dismissRulesBtn.addEventListener('click', () => closeModal(DOM.rulesModal));

        DOM.editNamesBtn.addEventListener('click', () => {
            DOM.inputNameX.value = state.names.X;
            DOM.inputNameO.value = state.names.O;
            openModal(DOM.namesModal);
        });
        DOM.closeNamesModalBtn.addEventListener('click', () => closeModal(DOM.namesModal));
        DOM.cancelNamesBtn.addEventListener('click', () => closeModal(DOM.namesModal));
        DOM.saveNamesBtn.addEventListener('click', savePlayerNames);

        // Close modal on backdrop click
        [DOM.shortcutsModal, DOM.rulesModal, DOM.namesModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
        });

        // Keyboard
        window.addEventListener('keydown', handleKeyDown);
    }

    /* ------------------------------------------------------------------------
       14. Application Initialization
       ------------------------------------------------------------------------ */
    function init() {
        Confetti.init();
        loadSavedPreferences();
        initEventListeners();
        updateTurnIndicators();
        updateScoreboardDisplay();
        updateAiInsightDesc();
        updateUndoButtonState();

        console.log('%c NexusToe initialized successfully! Developed by Shoeb Tahsildar for Prodigy InfoTech Task 03.', 'color: #00f2fe; font-weight: bold; font-size: 12px;');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
