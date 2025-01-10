import { Network } from "@aptos-labs/ts-sdk";
import { NetworkInfo, isAptosNetwork } from "@aptos-labs/wallet-adapter-react";

export const isValidNetworkName = (network: NetworkInfo | null) => {
  if (isAptosNetwork(network)) {
    return Object.values<string | undefined>(Network).includes(network?.name);
  }
  // If the configured network is not an Aptos network, i.e is a custom network
  // we resolve it as a valid network name
  return true;
};

export const convertUrl = (url: string) => {
  if (url.startsWith("ipfs://")) {
    const withoutPrefix = url.replace("ipfs://", "");
    const pathParts = withoutPrefix.split("/");
    return `/cards/${pathParts[1]}`;
  } else {
    url = `/images/card.webp`;
  }
  return url;
};
