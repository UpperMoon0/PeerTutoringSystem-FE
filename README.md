# Peer Tutoring System - Front-End

This is the front-end for the Peer Tutoring System, built with React, Vite, and TypeScript.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Build for production:**
    ```bash
    npm run build
    ```

4.  **Clean build for production:**
    ```bash
    npm run build:clean
    ```

## SVG Handling

This project uses `vite-plugin-svgr` to handle SVG files as React components. You can import SVG files directly into your components like this:

```jsx
import { ReactComponent as Logo } from './logo.svg';

function App() {
  return (
    <div>
      <Logo />
    </div>
  );
}