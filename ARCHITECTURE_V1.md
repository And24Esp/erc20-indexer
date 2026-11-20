# Architecture V1 (current-state snapshot)

**Status:** This is the first updated snapshot of the skeleton application. It documents the current implementation, including the API-key configuration change; it is not a target design.

## Purpose and scope

The app is a browser-based React interface for looking up ERC-20 token balances for an Ethereum address. It uses Alchemy's Enhanced APIs through the Alchemy SDK. The README intentionally presents it as a minimal starter project and lists possible improvements; wallet connection, ENS resolution, and the other suggested features are not implemented.

## System context

```text
User
  │ enters address and clicks the query button
  ▼
React app in browser (Vite-built static assets)
  │ Alchemy SDK requests over the network
  ▼
Alchemy Enhanced APIs (Ethereum Mainnet)
```

There is no application server or database in the current project. The browser communicates directly with Alchemy; token query results are kept in React component state for the lifetime of the page.

## Runtime structure

- **HTML shell — `index.html`:** Provides the `root` mount element and loads `/src/main.jsx`. Its document title is still the Vite starter title.
- **React entrypoint — `src/main.jsx`:** Creates the React root, renders `App` inside `React.StrictMode`, and imports the global stylesheet.
- **Application — `src/App.jsx`:** Contains the complete page, address input, query action, Alchemy request logic, local state, and token-balance results grid.
- **Global styles — `src/index.css`:** Defines starter CSS for the page and browser defaults. Most layout and component styling is supplied through Chakra UI props in `App.jsx`.
- **Build and development — `vite.config.js`, `package.json`:** Vite with the React plugin provides the development server and production build. Available scripts are `dev`, `build`, and `preview`.

## Query and rendering flow

1. The input's change handler stores the entered address in `userAddress`.
2. Clicking the button calls `getTokenBalance()`.
3. That function creates an Alchemy client configured with `Network.ETH_MAINNET` and `import.meta.env.VITE_ALCHEMY_API_KEY`, calls `alchemy.core.getTokenBalances(userAddress)`, and stores the response in `results`.
4. It requests metadata for each returned token contract using `getTokenMetadata()` and `Promise.all`, then stores the metadata array in `tokenDataObjects`.
5. Once both requests complete, `hasQueried` is set. The component maps `results.tokenBalances` to cards, pairs each balance with metadata by array index, and formats the raw balance using `Utils.formatUnits()` and the token's decimals.

The metadata requests are issued concurrently. The code does not currently filter zero balances, paginate results, or perform additional sorting.

## State and data

All application state is local to the `App` component:

| State | Role |
| --- | --- |
| `userAddress` | Current input value |
| `results` | Response from the token-balance query |
| `tokenDataObjects` | Metadata responses corresponding by index to the returned balances |
| `hasQueried` | Controls whether the results grid or initial prompt is displayed |

No query or address is persisted, and there is no shared state layer or caching outside the SDK.

## Dependencies and configuration

- **React 18** provides the UI and component state.
- **Chakra UI 2** supplies the components used for layout and controls.
- **Alchemy SDK 2** provides token balance and token metadata API calls.
- **Vite 4** and `@vitejs/plugin-react` power local development and bundling.
- **ethers 5** is declared as a dependency; the visible app uses `Utils` from `alchemy-sdk` for unit formatting.

The Alchemy API key is read from the `VITE_ALCHEMY_API_KEY` environment variable via Vite's `import.meta.env` in `src/App.jsx`. For local development, define that variable in the project-root `.env` file and restart the Vite dev server after changing it. The `.gitignore` excludes `.env` and other `.env.*` files while allowing a checked-in `.env.example`.

Because Vite substitutes `VITE_` variables into client-side code, the configured key is available to users in the browser bundle and network requests. This approach avoids hard-coding the key in application source, but it does not make the key secret. Restrict the key in Alchemy's dashboard; use a server-side proxy if the key must remain confidential.

## Operational behavior and known gaps

- The only configured network is Ethereum Mainnet.
- Requests have no visible loading state, validation, or explicit error handling.
- The UI assumes that the balance query and every metadata request succeed, and that metadata ordering and token-balance ordering correspond.
- The app has no wallet integration, ENS support, persistence, backend, or test script in `package.json`.
- Responsive layout, empty/error states, and accessibility behavior have not been established as explicit requirements in this skeleton.

These are observations about the current implementation, not a roadmap or commitment to a specific solution.

## Local development

Install dependencies with `npm install`, define `VITE_ALCHEMY_API_KEY` in `.env`, then start the Vite development server with `npm run dev`. Run `npm run build` to produce the static production bundle; `npm run preview` serves that bundle locally for inspection. Live token lookups require a valid Alchemy API key configuration.
