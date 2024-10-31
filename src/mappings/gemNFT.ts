import { BigInt, store } from '@graphprotocol/graph-ts';
import {
  Created,
  GemMelted,
  TransferGEM,
  GemMiningClaimed,
  GemMiningStarted,
  GemForged,
  GemsCoolDownPeriodModified,
  GemsMiningPeriodModified,
  GemsMiningTryModified,
  MiningCancelled,
  RandomGemRequested
} from "../../generated/GemFactory/GemFactory"

import {
  GemBought,
  GemForSale,
  GemRemovedFromSale
} from "../../generated/GemMarketplace/GemMarketplace"

import {
  NFT,
  Customer,
  TradeHistory,
  GemCooldown,
  GemMiningPeriod,
  GemMiningTry,
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
  nft.miningTry = event.params.miningTry;
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
  history.tradeType = "purchased";
  history.gemIds = [event.params.tokenId];
  history.trader = event.params.seller;
  history.payer = event.params.payer;
  history.value = event.params.amount;
  history.date = event.block.timestamp;
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
  history.date = event.block.timestamp;
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
  history.date = event.block.timestamp;
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
  nft.miningTry--;
  nft.miningStartTime = event.params.startMiningTime;
  customer.save();
  nft.save(); 
}

export function handleMiningCancelled(event: MiningCancelled): void {
  let nft = NFT.load(event.params._tokenId.toString());
  if (!nft) {
    nft = new NFT(event.params._tokenId.toString());
  }
  nft.isMining = false;
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
  nft.cooldownDueDate = event.params.minedGemCooldownDueDate;
  nft.save();

  let history = new TradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
  history.tradeType = "mined";
  history.gemIds = [event.params.tokenId];
  history.trader = event.params.miner;
  history.date = event.block.timestamp;
  history.save();
}

export function handleGemForged(event: GemForged): void {
  let gemIds = event.params.gemsTokenIds;
  for (let i = 0 ; i < gemIds.length; i ++) {
    store.remove("NFT", gemIds[i].toString());
  }

  let history = new TradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
  history.tradeType = "forged";
  history.gemIds = event.params.gemsTokenIds;
  history.trader = event.params.gemOwner;
  history.newId = event.params.newGemCreatedId;
  history.date = event.block.timestamp;
  history.save();
}

export function handleGemCooldownPeriod(event: GemsCoolDownPeriodModified): void {
  let gemCooldown = GemCooldown.load("cooldown");
  if (!gemCooldown) {
    gemCooldown = new GemCooldown("cooldown");
  }

  gemCooldown.RareGemsCooldownPeriod = event.params.RareGemsCooldownPeriod
  gemCooldown.EpicGemsCooldownPeriod = event.params.EpicGemsCooldownPeriod
  gemCooldown.UniqueGemsCooldownPeriod = event.params.UniqueGemsCooldownPeriod
  gemCooldown.LegendaryGemsCooldownPeriod = event.params.LegendaryGemsCooldownPeriod
  gemCooldown.MythicGemsCooldownPeriod = event.params.MythicGemsCooldownPeriod
  gemCooldown.save();
}

export function handleGemMiningPeriod(event: GemsMiningPeriodModified): void {
  let gemMiningPeriod = GemMiningPeriod.load("miningPeriod");
  if (!gemMiningPeriod) {
    gemMiningPeriod = new GemMiningPeriod("miningPeriod");
  }

  gemMiningPeriod.RareGemsMiningPeriod = event.params.RareGemsMiningPeriod
  gemMiningPeriod.EpicGemsMiningPeriod = event.params.EpicGemsMiningPeriod
  gemMiningPeriod.UniqueGemsMiningPeriod = event.params.UniqueGemsMiningPeriod
  gemMiningPeriod.LegendaryGemsMiningPeriod = event.params.LegendaryGemsMiningPeriod
  gemMiningPeriod.MythicGemsMiningPeriod = event.params.MythicGemsMiningPeriod
  gemMiningPeriod.save();
}
export function handleGemMiningTry(event: GemsMiningTryModified): void {
  let gemMiningTry = GemMiningTry.load("miningTry");
  if (!gemMiningTry) {
    gemMiningTry = new GemMiningTry("miningTry");
  }

  gemMiningTry.RareminingTry = event.params.RareGemsMiningTry
  gemMiningTry.EpicminingTry = event.params.EpicGemsMiningTry
  gemMiningTry.UniqueminingTry = event.params.UniqueGemsMiningTry
  gemMiningTry.LegendaryminingTry = event.params.LegendaryGemsMiningTry
  gemMiningTry.MythicminingTr = event.params.MythicGemsMiningTry
  gemMiningTry.save();
}