# Discovery Swarm Test

## What is this?
This is an example project to implement something with `discovery-swarm`. It's basically a p2p chat application which uses a DNS server for discovery of peers.


## How to use it?
```
git clone https://github.com/Strernd/discovery-swarm-test.git
npm install
```

On a server that is used for DNS discovery:
```
npm run server
```
Remember to open port 5300

On the clients:
```
DNS=mydnsserver.com:5300 npm start
```
The clients are using a random port between 6666 and 6766, so make sure those are open as well to eastablish a connection. You can set the `CHANNEL` environment optionally.

