import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Creates and sends a SOL transfer transaction via the user's wallet.
 * Returns the transaction signature on success, or throws on failure/rejection.
 */
export async function sendSolTransaction({
  connection,
  fromPubkey,
  toPubkey,
  amount,
  signTransaction,
}: {
  connection: Connection;
  fromPubkey: PublicKey;
  toPubkey: PublicKey;
  amount: number; // in SOL
  signTransaction: (tx: Transaction) => Promise<Transaction>;
}): Promise<string> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: Math.round(amount * LAMPORTS_PER_SOL),
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromPubkey;

  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}

/**
 * Requests a wallet message signature (gasless) to verify intent.
 * Returns true if signed, throws if rejected.
 */
export async function requestWalletSignature({
  signMessage,
  message,
}: {
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  message: string;
}): Promise<boolean> {
  await signMessage(new TextEncoder().encode(message));
  return true;
}
