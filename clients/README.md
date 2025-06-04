# Messenger App

A modern React application bootstrapped with TypeScript, Redux Toolkit, Tailwind CSS, and webpack.

## Features
- React 18 with TypeScript
- State management with Redux Toolkit
- Tailwind CSS for styling
- Webpack for bundling

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd messanger-app
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

### Running the App

Start the development server:
```sh
npm start
# or
yarn start
```
The app will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production
```sh
npm run build
# or
yarn build
```
The production-ready files will be in the `dist/` directory.

## Project Structure
```
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Counter.tsx
│   │   └── Layout.tsx
│   ├── store/
│   │   ├── counterSlice.ts
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── index.tsx
├── package.json
├── webpack.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── ...
```

## Scripts
- `npm start` — Start development server
- `npm run build` — Build for production
- `npm run lint` — Lint the codebase (if configured)

## Customization
- **Styling:** Edit `src/styles/globals.css` and Tailwind config.
- **State:** Add new slices in `src/store/`.
- **Components:** Add new components in `src/components/`.

## License
MIT 