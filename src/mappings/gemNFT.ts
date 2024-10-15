import { BigInt, store } from '@graphprotocol/graph-ts';
import {
  Created,
  GemMelted,
  TransferGEM,
  GemMiningClaimed,
  GemMiningStarted,
  GemForged
} from "../../generated/GemFactory/GemFactory"

import {
  GemBought,
  GemForSale,
  GemRemovedFromSale
} from "../../generated/GemMarketplace/GemMarketplace"

import {
  NFT,
  Approval,
  Customer,
  TradeHistory
} from '../../generated/schema';

export function handleCreated(event: Created): void {
  let nft = new NFT(event.params.tokenId.toString());
  nft.tokenID = event.params.tokenId;
  nft.rarity = event.params.rarity;
  nft.color = event.params.color;
  nft.quadrants = event.params.quadrants;
  nft.value = event.params.value;
  nft.cooldownDueDate = event.params.cooldownDueDate;
  nft.miningPeriod = event.params.miningPeriod;
  nft.owner = event.params.owner;
  nft.isMining = false;
  nft.isForSale = false;
  nft.gemCooldownInitTime = event.block.timestamp;
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
  nft.price = null;
  nft.save();

  let history = new TradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
  history.tradeType = "buying";
  history.gemIds = [event.params.tokenId];
  history.trader = event.params.seller;
  history.payer = event.params.payer;
  history.value = event.params.amount;
  history.save();
}

export function handleGemForSale(event: GemForSale): void {
  let nft = NFT.load(event.params.tokenId.toString());
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString());
  }
  nft.isForSale = true;
  nft.price = event.params.price;
  nft.save();

  let history = new TradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
  history.tradeType = "listed";
  history.gemIds = [event.params.tokenId];
  history.value = event.params.price;
  history.trader = event.params.seller;
  history.save();
}

export function handleGemRemoved(event: GemRemovedFromSale): void {
  let nft = NFT.load(event.params.tokenId.toString());
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString());
  }
  nft.isForSale = false;
  nft.price = null;
  nft.save();

  let history = new TradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
  history.tradeType = "unlisted";
  history.gemIds = [event.params.tokenId];
  history.save();
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
  nft.isMining = true;
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
  nft.gemCooldownInitTime = event.block.timestamp;
  nft.save();

  let history = new TradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
  history.tradeType = "mining";
  history.gemIds = [event.params.tokenId];
  history.trader = event.params.miner;
  history.save();
}

export function handleGemForged(event: GemForged): void {
  let gemIds = event.params.gemsTokenIds;
  for (let i = 0 ; i < gemIds.length; i ++) {
    store.remove("NFT", gemIds[i].toString());
  }

  let nft = new NFT(event.params.newGemCreatedId.toString());
  nft.rarity = event.params.newRarity;
  nft.color = event.params.color;
  nft.quadrants = event.params.forgedQuadrants;
  nft.value = event.params.newValue;
  nft.tokenID = event.params.newGemCreatedId;
  nft.owner = event.params.gemOwner;
  nft.isForSale = false;
  nft.isMining = false;
  nft.gemCooldownInitTime = event.block.timestamp;
  nft.save();

  let history = new TradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
  history.tradeType = "forging";
  history.gemIds = event.params.gemsTokenIds;
  history.trader = event.params.gemOwner;
  history.newId = event.params.newGemCreatedId;
  history.save();
}