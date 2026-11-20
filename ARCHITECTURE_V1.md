# Architecture V1 (current-state snapshot)

**Status:** This is the first updated snapshot of the skeleton application. It documents the current implementation, including the API-key configuration change; it is not a target design.

## Purpose and scope

The app is a browser-based React interface for looking up ERC-20 token balances for an Ethereum address or ENS name. It uses Alchemy's Enhanced APIs through the Alchemy SDK. The README intentionally presents it as a minimal starter project and lists possible improvements; wallet connection and the other suggested features are not implemented.

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

- **HTML shell — `index.html`:** Provides the `root` mount element, loads `/src/main.jsx`, and sets the document title to “ERC-20 Token Indexer”.
- **React entrypoint — `src/main.jsx`:** Creates the React root, renders `App` inside `React.StrictMode` and `ChakraProvider`, and supplies the shared dark theme.
- **Application — `src/App.jsx`:** Contains the responsive dashboard, address input, query action, Alchemy request logic, local state, and token-balance results grid.
- **Global styles — `src/index.css`:** Provides minimal browser defaults; Chakra UI supplies the component reset and most visual styling.
- **Build and development — `vite.config.js`, `package.json`:** Vite with the React plugin provides the development server and production build. Available scripts are `dev`, `build`, and `preview`.

## Query and rendering flow

1. The input's change handler stores the entered address in `userAddress`.
2. Clicking the button calls `getTokenBalance()`.
3. The app confirms that `VITE_ALCHEMY_API_KEY` is configured. If the input is not already an Ethereum address, it resolves the input with `alchemy.core.resolveName()`. An unresolved name is shown as a query error.
4. The app calls `alchemy.core.getTokensForOwner()` with the resulting Ethereum address. This API returns owned ERC-20 balances with their metadata together, avoiding a separate metadata request for every token.
5. The app follows response page keys until all pages are retrieved, then stores the complete token list in one query-state update. Token balances are formatted with `Utils.formatUnits()` when raw balance and decimals are available.

## State and data

Application state is local to the `App` component:

| State | Role |
| --- | --- |
| `userAddress` | Current input value |
| `queryState.status` | Tracks idle, loading, success, or error state |
| `queryState.tokens` | Complete list of token balances and metadata for a successful query |
| `queryState.error` | User-visible validation or request error |
| `queryState.resolvedName` / `queryState.resolvedAddress` | Resolved ENS name and address, when the input was an ENS name |

No query or address is persisted, and there is no shared state layer or caching outside the SDK.

## Dependencies and configuration

- **React 18** provides the UI and component state.
- **Chakra UI 2** supplies the components used for layout and controls.
- **Alchemy SDK 2** provides token balance and token metadata API calls.
- **Vite 4** and `@vitejs/plugin-react` power local development and bundling.
- **ethers 5** provides address validation; `Utils` from `alchemy-sdk` formats token balances.

The Alchemy API key is read from the `VITE_ALCHEMY_API_KEY` environment variable via Vite's `import.meta.env` in `src/App.jsx`. For local development, define that variable in the project-root `.env` file and restart the Vite dev server after changing it. The `.gitignore` excludes `.env` and other `.env.*` files while allowing a checked-in `.env.example`.

Because Vite substitutes `VITE_` variables into client-side code, the configured key is available to users in the browser bundle and network requests. This approach avoids hard-coding the key in application source, but it does not make the key secret. Restrict the key in Alchemy's dashboard; use a server-side proxy if the key must remain confidential.

## Operational behavior and known gaps

- The only configured network is Ethereum Mainnet.
- Inputs may be Ethereum addresses or ENS names; resolved ENS names display their address alongside the results.
- The responsive Chakra UI presents address lookup, query status, and token cards in a dark dashboard layout.
- The UI validates non-empty input, resolves ENS names, shows loading and request-error states, and renders an empty state when no tokens are returned.
- Per-token SDK errors or missing decimals are shown as unavailable balance data rather than being formatted or dereferenced blindly.
- The app has no wallet integration, persistence, backend, or test script in `package.json`.
- The Alchemy key remains client-visible because Vite exposes `VITE_` variables in the browser bundle.
- A browser test confirmed the 'vitalik.eth' ENS resolved and reached the token lookup, but Alchemy rate-limited the subsequent paginated balance request (HTTP 429), so we couldn’t verify the completed results. The live preview rendered without React errors after reload.

These are observations about the current implementation, not a roadmap or commitment to a specific solution.

## Local development

Install dependencies with `npm install`, define `VITE_ALCHEMY_API_KEY` in `.env`, then start the Vite development server with `npm run dev`. Run `npm run build` to produce the static production bundle; `npm run preview` serves that bundle locally for inspection. Live token lookups require a valid Alchemy API key configuration.
