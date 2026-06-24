import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { OnChainProfile, Post as OnChainPost } from '@/types';

export const MODULE_ADDRESS =
  process.env.NEXT_PUBLIC_MODULE_ADDRESS ||
  '0xd850d1d662ba4e95145188094ce9a56ad7486259b4f249b6d89eed075780383c';
export const MODULE_NAME = 'profile';

export const aptosConfig = new AptosConfig({ network: Network.DEVNET });
export const aptos = new Aptos(aptosConfig);

// ── View Functions ────────────────────────────────────────────────────────────

export async function hasProfile(address: string): Promise<boolean> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::has_profile`,
        typeArguments: [],
        functionArguments: [address],
      },
    });
    return result[0] as boolean;
  } catch {
    return false;
  }
}

export async function getOnChainProfile(address: string): Promise<OnChainProfile | null> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_profile`,
        typeArguments: [],
        functionArguments: [address],
      },
    });
    const [name, bio, skills, reputation, createdAt, ipfsHash] = result as [
      string, string, string[], number, number, string
    ];
    return { name, bio, skills, reputation: Number(reputation), createdAt: Number(createdAt), ipfsHash };
  } catch {
    return null;
  }
}

export async function getReputation(address: string): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_reputation`,
        typeArguments: [],
        functionArguments: [address],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}

export async function getPostCount(address: string): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_post_count`,
        typeArguments: [],
        functionArguments: [address],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}

// ── Transaction Builders ──────────────────────────────────────────────────────

export function buildCreateProfileTx(
  name: string,
  bio: string,
  skills: string[],
  ipfsHash: string
) {
  return {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_profile`,
    type_arguments: [],
    arguments: [name, bio, skills, ipfsHash],
  };
}

export function buildUpdateProfileTx(
  name: string,
  bio: string,
  skills: string[],
  ipfsHash: string
) {
  return {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::update_profile`,
    type_arguments: [],
    arguments: [name, bio, skills, ipfsHash],
  };
}

export function buildStorePostTx(content: string) {
  return {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::store_post`,
    type_arguments: [],
    arguments: [content],
  };
}

export function buildUpdateReputationTx(points: number) {
  return {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::update_reputation`,
    type_arguments: [],
    arguments: [points],
  };
}

// ── Wait for transaction ──────────────────────────────────────────────────────

export async function waitForTx(hash: string): Promise<void> {
  await aptos.waitForTransaction({ transactionHash: hash });
}
