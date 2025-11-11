# Quiz App Frontend# React + TypeScript + Vite



React + TypeScript + Tailwind CSS frontend for the multiplayer quiz game.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## FeaturesCurrently, two official plugins are available:



- **Start Page**: Choose between Game Master or Player role- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- **Game Master View**: - [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

  - Create lobby and get QR code

  - See connected players in real-time## React Compiler

  - Start and control the game

  - Display questions and resultsThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- **Player View**:

  - Scan QR code to join## Expanding the ESLint configuration

  - Enter player name

  - Wait in lobbyIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

  - Submit answers during game

  - See final scores```js

export default defineConfig([

## Tech Stack  globalIgnores(['dist']),

  {

- React 19    files: ['**/*.{ts,tsx}'],

- TypeScript    extends: [

- Tailwind CSS      // Other configs...

- React Router v7

- Socket.IO Client      // Remove tseslint.configs.recommended and replace with this

- QRCode.react      tseslint.configs.recommendedTypeChecked,

      // Alternatively, use this for stricter rules

## Getting Started      tseslint.configs.strictTypeChecked,

      // Optionally, add this for stylistic rules

1. Install dependencies:      tseslint.configs.stylisticTypeChecked,

```bash

pnpm install      // Other configs...

```    ],

    languageOptions: {

2. Copy environment variables:      parserOptions: {

```bash        project: ['./tsconfig.node.json', './tsconfig.app.json'],

cp .env.example .env        tsconfigRootDir: import.meta.dirname,

```      },

      // other options...

3. Update `.env` with your backend URL (default is `http://localhost:3000`)    },

  },

4. Start development server:])

```bash```

pnpm dev

```You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:



## Routes```js

// eslint.config.js

- `/` - Start page (choose role)import reactX from 'eslint-plugin-react-x'

- `/game-master` - Create new lobby (auto-redirects to lobby page)import reactDom from 'eslint-plugin-react-dom'

- `/game-master/:lobbyId` - Game master lobby and game view

- `/player` - Player instructions (scan QR code)export default defineConfig([

- `/player/:lobbyId` - Player join and game view  globalIgnores(['dist']),

  {

## Project Structure    files: ['**/*.{ts,tsx}'],

    extends: [

```      // Other configs...

src/      // Enable lint rules for React

├── pages/              # Page components      reactX.configs['recommended-typescript'],

│   ├── StartPage.tsx      // Enable lint rules for React DOM

│   ├── GameMasterPage.tsx      reactDom.configs.recommended,

│   └── PlayerPage.tsx    ],

├── services/           # Services    languageOptions: {

│   └── socket.ts       # Socket.IO client      parserOptions: {

├── App.tsx             # Main app with routing        project: ['./tsconfig.node.json', './tsconfig.app.json'],

└── main.tsx            # Entry point        tsconfigRootDir: import.meta.dirname,

```      },

      // other options...

## Shared Types    },

  },

The application uses shared TypeScript types from `/shared/types.ts` for type safety across frontend and backend.])

```

## Development

The app connects to the backend via Socket.IO for real-time communication. Make sure the backend is running before testing the full functionality.
