# Simple 2D Platformer (Web)

Plain HTML/CSS/JS platformer with 5 short levels and achievements (first jump, first coin, all coins, finish final level). No build tooling; `package.json` only supplies a static server and Prettier.

## Run
```sh
npm install
npm run dev   # serves the folder (opens at http://localhost:3000 or similar)
```
Open `index.html` in the browser if you prefer to skip npm.

## Files
- index.html — canvas + HUD
- style.css — basic styling
- main.js — game loop, physics, achievements, input
- package.json — dev server scripts
- .gitignore — keeps node_modules and OS cruft out

## Gameplay
- Move: A/D or Arrow keys
- Jump: Space/W/Up
- Reset: R
- Collect all coins to open the exit; finish all 5 levels.

## Achievements
- first_jump — first jump performed
- first_coin — first coin collected
- all_coins — all coins collected
- level_complete — finished the final level

## Customizing quickly
- Platforms/coins/exit: edit the `LEVELS` array in `main.js` (five levels by default).
- Physics feel: tweak `GRAVITY`, `MOVE_SPEED`, `JUMP_VELOCITY` in `main.js`.
- HUD look: adjust colors/spacing in `style.css`.
