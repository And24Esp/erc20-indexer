# Simple ERC-20 Indexer

A browser-based React app for looking up ERC-20 token balances on Ethereum Mainnet. Enter a wallet address or ENS name to view its tokens and balances. The app uses Alchemy's Enhanced APIs through the Alchemy SDK.

## Set up

1. Install dependencies:

   ```sh
   npm install
   ```

2. Set your Alchemy key in the project-root `.env` file:

   ```env
   VITE_ALCHEMY_API_KEY=your_alchemy_api_key
   ```

   `.env` files are ignored by Git. Vite exposes `VITE_` variables in browser code, so this key is visible to users; restrict it in Alchemy's dashboard. Use a server-side proxy if the key must remain confidential.

3. Start the development server:

   ```sh
   npm run dev
   ```

To create a production build, run `npm run build`. To serve that build locally, run `npm run preview`.

## Architecture snapshots

- [ARCHITECTURE_V0.md](./ARCHITECTURE_V0.md) records the original skeleton implementation before the environment-variable and follow-up application changes.
- [ARCHITECTURE_V1.md](./ARCHITECTURE_V1.md) describes the updated implementation, including Alchemy key configuration, the paginated token query, Chakra UI, and ENS resolution.

## Challenge progress

The original challenge prompts are kept here as context, with a brief summary of the current implementation after each one.

1. Add Wallet integration so that any user that connects their wallet can check their ERC-20 token balance.

   **Current state:** Not implemented. Lookups still require a manually entered address or ENS name; no wallet connection or signing is used, which seems faster than having to connect the whole wallet.

2. There is no indication of a request in progress... that's bad UX! Do you think you can add some sort of indication of loading?

   **Current state:** Implemented. The query button shows a loading state and the results area displays skeleton cards while the request is in progress.

3. Add some styling! 🎨

   **Current state:** Implemented. The app now uses a shared Chakra UI dark theme and a responsive dashboard layout.

4. The token balances can sometimes be a little long and break the outline of the page... can you fix that? 🔧

   **Current state:** Improved. Responsive token cards wrap long values and contract addresses instead of allowing them to overflow.

5. There is no error-checking for wrongly formed requests, or really any error checking of any kind... can you add some in?

   **Current state:** Improved. Empty input, ENS resolution failures, missing API configuration, request errors, and incomplete token data are handled visibly. Provider errors redact the configured API key before being displayed.

6. The images and grid display could look better... anything you can do about that?

   **Current state:** Improved. Token cards use available logos (or a symbol fallback) in a responsive grid.

7. There are ways to make this app faster... can you implement some of them? How can the query be made _even_ quicker?

   **Current state:** Improved. The app uses `getTokensForOwner()` to retrieve token balances and metadata together, avoiding a separate metadata request for every token, and follows pagination. Large scans can still be rate-limited by the provider.

8. Can you add ENS support for inputs?

   **Current state:** Implemented. ENS names are resolved to Ethereum addresses before the token lookup, and the resolved address is shown with successful results.
