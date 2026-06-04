# Vendored `@metamask/stellar-wallet-snap`

This directory contains a built copy of [@metamask/stellar-wallet-snap](https://github.com/MetaMask/snap-stellar-wallet) used until the package is published to npm.

To refresh:

```bash
git clone https://github.com/MetaMask/snap-stellar-wallet.git /tmp/snap-stellar-wallet
cd /tmp/snap-stellar-wallet/packages/snap
cp .env.example .env
ENVIRONMENT=test yarn build
cp -r dist images locales snap.manifest.json package.json /path/to/metamask-extension/vendor/metamask-stellar-wallet-snap/
```

Then run `yarn install`, `yarn allow-scripts auto`, and `yarn lavamoat:auto` from the extension root.
