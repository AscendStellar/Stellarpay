# USDC Trustline Setup

Stellar accounts must opt in to non-native assets before they can receive them.
For StellarPay merchants, that means the receiving wallet needs a USDC trustline
for the configured USDC issuer.

## When You Need This

Auto-generated testnet merchant wallets are funded with XLM through Friendbot.
Friendbot only creates and funds the account; custom external wallet addresses
still need a USDC trustline before customers can send USDC payments to them.

## Testnet USDC

Use the StellarPay testnet issuer from your environment:

```text
GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

In a Stellar wallet such as Freighter:

1. Switch the wallet to testnet.
2. Make sure the account is funded with testnet XLM.
3. Add a custom asset with code `USDC`.
4. Use the testnet issuer above.
5. Confirm the trustline transaction.

You can also use Stellar Laboratory by building and submitting a `changeTrust`
operation for asset code `USDC` and the same issuer.

## Mainnet USDC

For mainnet deployments, use Circle's Stellar USDC issuer:

```text
GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
```

The account must hold enough XLM to meet Stellar's minimum reserve and pay the
small transaction fee required to add the trustline.
