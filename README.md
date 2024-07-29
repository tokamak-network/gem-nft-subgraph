Run Graph Node locally

```
git clone https://github.com/tokamak-network/tokamak-graph-node.git
cd tokamak-graph-node
cd docker
docker-compose up
```

build, create, deploy locally

```
graph codegen
graph build
graph create --node http://localhost:8020/ usgeeus/titan-nft-subgraph
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 usgeeus/titan-nft-subgraph
```
