import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const TOKEN_MINTS: Record<string, string> = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  BAGS: "GhA2Tm26Toy3ZNL5oVYPwnxPagkt4VLXkqWSropBAGS",
};

type SupportedToken = "SOL" | "USDC" | "USDT" | "BAGS";

/**
 * Builds a transaction that sends the full amount to a single destination (treasury).
 * Works for SOL and all SPL tokens (USDC, USDT, BAGS).
 */
export async function buildTreasuryTransaction({
  connection,
  fromPubkey,
  treasuryWallet,
  amount,
  token,
}: {
  connection: Connection;
  fromPubkey: PublicKey;
  treasuryWallet: string;
  amount: number;
  token: SupportedToken;
}) {
  const treasuryPubkey = new PublicKey(treasuryWallet);
  const transaction = new Transaction();

  if (token === "SOL") {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: treasuryPubkey,
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
      })
    );
  } else {
    const mintAddress = TOKEN_MINTS[token];
    if (!mintAddress) throw new Error(`Unsupported token: ${token}`);
    const mint = new PublicKey(mintAddress);

    // Get decimals
    const mintInfo = await connection.getParsedAccountInfo(mint, "confirmed");
    const parsed = mintInfo.value?.data;
    if (
      !parsed || typeof parsed !== "object" || !("parsed" in parsed) ||
      typeof parsed.parsed !== "object" || parsed.parsed === null ||
      !("info" in parsed.parsed) || typeof parsed.parsed.info !== "object" ||
      parsed.parsed.info === null || !("decimals" in parsed.parsed.info) ||
      typeof parsed.parsed.info.decimals !== "number"
    ) {
      throw new Error("Could not read token mint decimals");
    }
    const decimals = parsed.parsed.info.decimals;

    // Sender ATA — must exist
    const senderAta = await getAssociatedTokenAddress(mint, fromPubkey);
    const senderAtaInfo = await connection.getAccountInfo(senderAta, "confirmed");
    if (!senderAtaInfo) throw new Error(`Your wallet does not hold ${token}`);

    // Treasury ATA — create if needed
    const treasuryAta = await getAssociatedTokenAddress(mint, treasuryPubkey);
    const treasuryAtaInfo = await connection.getAccountInfo(treasuryAta);
    if (!treasuryAtaInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          fromPubkey, treasuryAta, treasuryPubkey, mint,
          TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    const baseUnits = BigInt(Math.round(amount * 10 ** decimals));
    transaction.add(
      createTransferInstruction(senderAta, treasuryAta, fromPubkey, baseUnits)
    );
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromPubkey;

  return { transaction, blockhash, lastValidBlockHeight };
}

/**
 * Builds, signs, sends, and confirms a treasury transfer for any supported token.
 * Returns the transaction signature.
 */
export async function sendTreasuryTransfer({
  connection,
  fromPubkey,
  treasuryWallet,
  amount,
  token,
  signTransaction,
}: {
  connection: Connection;
  fromPubkey: PublicKey;
  treasuryWallet: string;
  amount: number;
  token: SupportedToken;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
}): Promise<string> {
  const { transaction, blockhash, lastValidBlockHeight } = await buildTreasuryTransaction({
    connection, fromPubkey, treasuryWallet, amount, token,
  });

  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });

  const confirmation = await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );
  if (confirmation.value.err) {
    throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
  }

  return signature;
}
