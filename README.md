# 🎮 PRODIGY_WD_03: NexusToe — Advanced Interactive Tic-Tac-Toe Web Application

[![Internship](https://img.shields.io/badge/Internship-Prodigy%20InfoTech-blue?style=for-the-badge)](https://prodigyinfotech.dev/)
[![Task](https://img.shields.io/badge/Task-03%20Web%20Development-purple?style=for-the-badge)](https://github.com/shoeb2317/PRODIGY_WD_03)
[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-success?style=for-the-badge&logo=github)](https://shoeb2317.github.io/PRODIGY_WD_03/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> **Task 03 Submission for Prodigy InfoTech Internship**  
> **Developer:** Shoeb Tahsildar ([@shoeb2317](https://github.com/shoeb2317))  
> **Live Site:** [https://shoeb2317.github.io/PRODIGY_WD_03/](https://shoeb2317.github.io/PRODIGY_WD_03/)  
> **Repository:** [https://github.com/shoeb2317/PRODIGY_WD_03](https://github.com/shoeb2317/PRODIGY_WD_03)  
> **Task Objective:** Build an interactive and engaging Tic-Tac-Toe web application using HTML, CSS, and JavaScript. Implement functions to handle user clicks, track game state, check for winning/tie conditions, and support both local multiplayer and an intelligent AI opponent aiming to align three markers in a row.


## ✨ Features Implemented

1. **Unbeatable AI Opponent Engine (Minimax Algorithm)**
   - Implements a recursive **Minimax algorithm with alpha-beta pruning and depth weighting**.
   - Evaluates all potential board combinations ($9!$ states) to guarantee mathematically optimal moves. The AI is impossible to beat on Hard mode!
   - Realistic simulated thinking delay ($350\text{ms} - 550\text{ms}$) with an animated thinking indicator for an authentic gameplay feel.

2. **3 Selectable Intelligence Levels**
   - **Easy (Casual):** Completely randomized free cell selections for relaxed play.
   - **Medium (Tactical):** Prioritizes immediate winning strikes, blocks human alignments, and claims high-value center/corner positions.
   - **Impossible (Minimax):** Mathematically flawless decision-making.

3. **Multiplayer Pass & Play (Local 2-Player)**
   - Pass-and-play mode for two players on the same device.
   - Live turn tags, pulsing status dot, and turn-based ghost hover previews.
   - Customizable player names modal with `localStorage` persistence.

4. **Dynamic SVG Strike-Through & Particle Confetti**
   - Automatically detects all 8 winning configurations (3 rows, 3 columns, 2 diagonals).
   - Draws a real-time animated **SVG stroke line** connecting the winning cells via `stroke-dasharray` and `stroke-dashoffset` transitions.
   - Triggers an instant **HTML5 Canvas confetti particle explosion** upon victory.

5. **Move History Timeline & Step Undo**
   - Real-time chronological timeline tracking every placed marker with grid coordinates (`Row X, Col Y`).
   - One-click **Undo Move** capability that seamlessly reverts the last turn (or both player and AI turns in single-player mode).

6. **Web Audio Synthesizer Engine**
   - Pure client-side audio feedback powered by the browser's native **Web Audio API** (zero external MP3/WAV dependencies).
   - High-tech clicks for X, resonant chimes for O, multi-note victory fanfare arpeggios, descending tie tones, and reset sweeps.
   - Sound toggle button with persistent state.

7. **Comprehensive Scoreboard & Analytics**
   - Tracks Player X Wins, Player O / AI Wins, Draws / Ties, Win Streaks, and Total Matches Played.
   - Real-time Win Rate percentage metric.
   - Stored in `localStorage` so match series scores persist across browser refreshes.

8. **Keyboard Accessibility & Shortcuts**
   - `1` through `9` / `Numpad 1-9`: Direct board cell selection.
   - `R`: Restart current match.
   - `U`: Undo move.
   - `N`: Start new series.
   - `M`: Toggle audio feedback.
   - `T`: Switch dark / light theme.
   - `S`: Toggle game mode (AI / PvP).
   - `?`: Open Rules & How to Play modal.

9. **Dark & Light Glassmorphism Design System**
   - Modern cosmic obsidian dark theme accented with electric cyan (`#00f2fe`) for X and neon rose (`#f43f5e`) for O.
   - Clean, frosted porcelain light theme toggle.
   - Responsive layouts optimized for desktops, tablets, and smartphones.

---

## 🧠 Minimax Algorithm Breakdown

The AI engine uses the Minimax decision rule:
$$\text{Score} = \begin{cases} +10 - \text{depth} & \text{if AI wins} \\ \text{depth} - 10 & \text{if Human wins} \\ 0 & \text{if Draw} \end{cases}$$

At every step:
- The **Maximizer (AI)** seeks the highest score.
- The **Minimizer (Human)** seeks the lowest score.
- Subtracting/adding depth ensures the AI prefers swift victories over prolonged matches and defends stubbornly against inevitable defeats.

---

## 🛠️ Tech Stack
- **HTML5:** Semantic architecture, accessible ARIA attributes, SVG graphics, and HTML5 Canvas.
- **CSS3:** Custom variables, glassmorphism, flexbox, CSS grid, keyframe animations, responsive media queries.
- **JavaScript (ES6+):** Minimax game tree recursion, Web Audio API, event delegation, and `localStorage` persistence.

---

## 🚀 How to Run
1. Clone the repository:
   ```bash
   git clone https://github.com/shoeb2317/PRODIGY_WD_03.git
   ```
2. Open `index.html` in any modern web browser or launch using a Live Server.

