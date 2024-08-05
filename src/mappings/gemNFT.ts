import { BigInt, store } from '@graphprotocol/graph-ts';
import {
  Approval as ApprovalEvent,
  ApprovalForAll,
  
} from '../../generated/GemNFT/GemNFT';

import {
  Created,
  GemMelted,
  TransferGEM,
  GemMiningClaimed,
  GemMiningStarted
} from "../../generated/GemFactory/GemFactory"

import {
  GemBought,
  GemForSale
} from "../../generated/GemMarketplace/GemMarketplace"

import {
  NFT,
  Approval,
  Customer
} from '../../generated/schema';

// export function handleTransfer(event: Transfer): void {
//   let nft = NFT.load(event.params.tokenId.toString());
//   if (!nft) {
//     nft = new NFT(event.params.tokenId.toString());
//     nft.ownerHistory = [];
//     nft.timeHistory = [];
//   }
//   nft.owner = event.params.to;
//   nft.tokenID = event.params.tokenId;
//   nft.transferTime = event.block.timestamp;
//   let ownerHistory = nft.ownerHistory;
//   ownerHistory!.push(event.params.to);
//   nft.ownerHistory = ownerHistory;
//   let timeHistory = nft.timeHistory;
//   timeHistory!.push(event.block.timestamp);
//   nft.timeHistory = timeHistory;
//   nft.save();
// }

export function handleApproval(event: ApprovalEvent): void {
  let approval = Approval.load(event.params.owner.toHexString() + event.params.approved.toHexString());
  if (!approval) {
    approval = new Approval(event.params.owner.toHexString() + event.params.approved.toHexString());
  }
  approval.from = event.params.owner;
  approval.to = event.params.approved;
  approval.tokenID = event.params.tokenId;
  approval.forAll = false;
  approval.save();
}
export function handleApprovalforAll(event: ApprovalForAll): void {
  let approval = Approval.load(event.params.owner.toHexString() + event.params.operator.toHexString());
  if (!approval) {
    approval = new Approval(event.params.owner.toHexString() + event.params.operator.toHexString());
  }
  approval.from = event.params.owner;
  approval.to = event.params.operator;
  approval.tokenID = BigInt.fromI32(-1);
  approval.forAll = true;
  approval.save();
}

export function handleCreated(event: Created): void {
  let nft = NFT.load(event.params.tokenId.toString());
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString());
  }
  
  nft.rarity = event.params.rarity;
  nft.color = event.params.color;
  nft.quadrants = [...event.params.quadrants];
  nft.value = event.params.value;
  nft.gemCooldownPeriod = event.params.cooldownPeriod;
  nft.save();
}

export function handleGemMelted(event: GemMelted): void {
  store.remove("NFT", event.params._tokenId.toString());
}

export function handleTransferGEM(event: TransferGEM): void {
  let nft = NFT.load(event.params.tokenId.toString());
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString());
  }
  nft.owner = event.params.to;
  nft.save();
}

export function handleGemBought(event: GemBought) : void {
  let nft = NFT.load(event.params.tokenId.toString());
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString());
  }
  nft.isForSale = false;
  nft.owner = event.params.payer;
  nft.save();
}

export function handleGemForSale(event: GemForSale): void {
  let nft = NFT.load(event.params.tokenId.toString());
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString());
  }
  nft.isForSale = true;
  nft.value = event.params.price;
  nft.save();
}

export function handleGemMiningStarted(event: GemMiningStarted): void {
  let nft = NFT.load(event.params.tokenId.toString());
  let customer = Customer.load(event.params.miner.toString());
  
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString());
  }
  if (!customer) {
    customer = new Customer(event.params.miner.toString());
    customer.address = event.params.miner;
  }
  customer.isMining = true;
  customer.save();
  nft.save();
}

export function handleGemMiningClaimed(event: GemMiningClaimed): void {
  let nft = NFT.load(event.params.tokenId.toString());
  let customer = Customer.load(event.params.miner.toString());
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString());
  }
  if (!customer) {
    customer = new Customer(event.params.miner.toString());
    customer.address = event.params.miner;
  }
  nft.owner = event.params.miner;
  customer.isMining = false;
  nft.save();
}