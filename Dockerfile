# Copyright Tecnalia Research & Innovation (https://www.tecnalia.com)
# Copyright Tecnalia Blockchain LAB
#
# SPDX-License-Identifier: Apache-2.0

FROM node:13-alpine AS BUILD_IMAGE

# default values pf environment variables
# that are used inside container

ENV DEFAULT_WORKDIR /opt
ENV EXPLORER_APP_PATH $DEFAULT_WORKDIR/explorer

# set default working dir inside container
WORKDIR $EXPLORER_APP_PATH

COPY . .

# install required dependencies by NPM packages:
# current dependencies are: python, make, g++
RUN apk add --no-cache --virtual npm-deps python3 make g++ curl bash && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools && \
    rm -r /root/.cache

# install node-prune (https://github.com/tj/node-prune)
RUN curl -sf https://gobinaries.com/tj/node-prune | sh
# install NPM dependencies
RUN npm install && npm run build && npm prune --production

# build explorer app
RUN cd client && npm install && npm prune --production && yarn build

# remove installed packages to free space
RUN apk del npm-deps
RUN /usr/local/bin/node-prune

RUN rm -rf node_modules/rxjs/src/
RUN rm -rf node_modules/rxjs/bundles/
RUN rm -rf node_modules/rxjs/_esm5/
RUN rm -rf node_modules/rxjs/_esm2015/
RUN rm -rf node_modules/grpc/deps/grpc/third_party/

FROM node:13-alpine

# database configuration
ENV DATABASE_HOST 127.0.0.1
ENV DATABASE_PORT 5432
ENV DATABASE_NAME fabricexplorer
ENV DATABASE_USERNAME hppoc
ENV DATABASE_PASSWD password
ENV EXPLORER_APP_ROOT app

ENV DEFAULT_WORKDIR /opt
ENV EXPLORER_APP_PATH $DEFAULT_WORKDIR/explorer

WORKDIR $EXPLORER_APP_PATH

COPY . .
COPY --from=BUILD_IMAGE $EXPLORER_APP_PATH/dist ./app/
COPY --from=BUILD_IMAGE $EXPLORER_APP_PATH/client/build ./client/build/
COPY --from=BUILD_IMAGE $EXPLORER_APP_PATH/node_modules ./node_modules/

# run blockchain explorer main app
CMD npm run app-start && tail -f /dev/null
