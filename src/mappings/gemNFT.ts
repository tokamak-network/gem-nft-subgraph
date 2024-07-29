import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  Transfer,
  SetAttribute,
  Approval as ApprovalEvent,
  ApprovalForAll
} from '../../generated/GemNFT/GemNFT';
import {
  NFT,
  Approval,
} from '../../generated/schema';

export function handleTransfer(event: Transfer): void {
  let nft = NFT.load(event.params.tokenId.toString());
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString());
    nft.ownerHistory = [];
    nft.timeHistory = [];
  }
  nft.owner = event.params.to;
  nft.tokenID = event.params.tokenId;
  nft.transferTime = event.block.timestamp;
  let ownerHistory = nft.ownerHistory;
  ownerHistory!.push(event.params.to);
  nft.ownerHistory = ownerHistory;
  let timeHistory = nft.timeHistory;
  timeHistory!.push(event.block.timestamp);
  nft.timeHistory = timeHistory;
  nft.save();
}
export function handleSetAttribute(event: SetAttribute): void {
  let nft = NFT.load(event.params.tokenId.toString());
  if (!nft) {
    nft = new NFT(event.params.tokenId.toString());
    nft.ownerHistory = [];
    nft.timeHistory = [];
  }
  nft.attribute = event.params.attribute
  nft.save();
}
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