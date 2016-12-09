# Dockerfile for Hyperledger blockchain-explorer image
# Workdir is set to /blockchain-explorer/explorer_1
# Environment variables:
#  HTTP_PORT=<web server port. Default is 9090 if not set>
#  HYP_REST_ENDPOINT=<REST endpoint. Default is http://127.0.0.1:7050 if not set>

FROM node:6-wheezy
MAINTAINER Baohua Yang <baohyang@cn.ibm.com>

# install maintain tools
RUN npm install bower grunt-cli graceful-fs@4.1.5 minimatch@3.0.2 -g

# copy code to /blockchain-explorer
COPY . /blockchain-explorer/explorer_1

WORKDIR /blockchain-explorer/explorer_1

# bowser uses 'sudo' in the cmd, which will throw warning and break building
RUN echo '{ "allow_root": true }' > .bowerrc

RUN npm install grunt grunt-auto-install grunt-contrib-uglify grunt-contrib-copy && \
    grunt

CMD ["node", "exp-server.js"]
