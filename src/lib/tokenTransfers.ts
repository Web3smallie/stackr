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

const TOKEN_MINTS = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  BAGS: "GhA2Tm26Toy3ZNL5oVYPwnxPagkt4VLXkqWSropBAGS",
} as const;

type SupportedToken = "SOL" | "USDC" | "USDT" | "BAGS";

function toTokenBaseUnits(amount: number, decimals: number) {
  return BigInt(Math.round(amount * 10 ** decimals));
}

async function ensureAssociatedTokenAccount({
  transaction,
  connection,
  mint,
  owner,
  payer,
}: {
  transaction: Transaction;
  connection: Connection;
  mint: PublicKey;
  owner: PublicKey;
  payer: PublicKey;
}) {
  const ata = await getAssociatedTokenAddress(mint, owner);
  const accountInfo = await connection.getAccountInfo(ata);

  if (!accountInfo) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        ata,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  return ata;
}

async function getTokenDecimals(connection: Connection, mint: PublicKey) {
  const mintInfo = await connection.getParsedAccountInfo(mint, "confirmed");
  const parsed = mintInfo.value?.data;

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("parsed" in parsed) ||
    typeof parsed.parsed !== "object" ||
    parsed.parsed === null ||
    !("info" in parsed.parsed) ||
    typeof parsed.parsed.info !== "object" ||
    parsed.parsed.info === null ||
    !("decimals" in parsed.parsed.info) ||
    typeof parsed.parsed.info.decimals !== "number"
  ) {
    throw new Error("Could not read token mint decimals");
  }

  return parsed.parsed.info.decimals;
}

export async function buildDirectPaymentTransaction({
  connection,
  fromPubkey,
  creatorWallet,
  treasuryWallet,
  amount,
  token,
}: {
  connection: Connection;
  fromPubkey: PublicKey;
  creatorWallet: string;
  treasuryWallet: string;
  amount: number;
  token: SupportedToken;
}) {
  const platformFee = amount * 0.01;
  const treasuryFee = amount * 0.005;
  const creatorAmount = amount - platformFee;

  const creatorPubkey = new PublicKey(creatorWallet);
  const treasuryPubkey = new PublicKey(treasuryWallet);
  const transaction = new Transaction();

  if (token === "SOL") {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: creatorPubkey,
        lamports: Math.round(creatorAmount * LAMPORTS_PER_SOL),
      }),
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: treasuryPubkey,
        lamports: Math.round(treasuryFee * LAMPORTS_PER_SOL),
      })
    );
  } else {
    const mint = new PublicKey(TOKEN_MINTS[token]);
    const decimals = await getTokenDecimals(connection, mint);
    const senderAta = await getAssociatedTokenAddress(mint, fromPubkey);
    const senderAtaInfo = await connection.getAccountInfo(senderAta, "confirmed");

    if (!senderAtaInfo) {
      throw new Error(`Connected wallet does not hold ${token}`);
    }

    const creatorAta = await ensureAssociatedTokenAccount({
      transaction,
      connection,
      mint,
      owner: creatorPubkey,
      payer: fromPubkey,
    });
    const treasuryAta = await ensureAssociatedTokenAccount({
      transaction,
      connection,
      mint,
      owner: treasuryPubkey,
      payer: fromPubkey,
    });

    transaction.add(
      createTransferInstruction(
        senderAta,
        creatorAta,
        fromPubkey,
        toTokenBaseUnits(creatorAmount, decimals)
      ),
      createTransferInstruction(
        senderAta,
        treasuryAta,
        fromPubkey,
        toTokenBaseUnits(treasuryFee, decimals)
      )
    );
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromPubkey;

  return {
    transaction,
    blockhash,
    lastValidBlockHeight,
  };
}