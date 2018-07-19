# Copyright Tecnalia Research & Innovation (https://www.tecnalia.com)
# Copyright Tecnalia Blockchain LAB
#
# SPDX-License-Identifier: Apache-2.0

FROM node:8.11.3-alpine

# default values pf environment variables
# that are used inside container

ENV DEFAULT_WORKDIR /opt
ENV EXPLORER_APP_PATH $DEFAULT_WORKDIR/explorer

# database configuration
ENV DATABASE_HOST 127.0.0.1
ENV DATABASE_PORT 5432
ENV DATABASE_NAME fabricexplorer
ENV DATABASE_USERNAME hppoc
ENV DATABASE_PASSWD password

ENV STARTUP_SCRIPT /opt

# set default working dir inside container
WORKDIR $DEFAULT_WORKDIR

# copy external data to container
COPY . $EXPLORER_APP_PATH

# install required dependencies by NPM packages:
# current dependencies are: python, make, g++

RUN apk add --no-cache --virtual npm-deps python make g++ && \
    python -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip install --upgrade pip setuptools && \
	rm -r /root/.cache

# install yarn
RUN npm install -g yarn

# install NPM dependencies
RUN cd $EXPLORER_APP_PATH && npm install && npm build

# build explorer app
RUN cd $EXPLORER_APP_PATH && cd client && npm install && yarn build

# remove installed packages to free space
RUN apk del npm-deps

# expose default ports
EXPOSE 8080

# run blockchain explorer main app
CMD node $DEFAULT_WORKDIR/explorer/main.js
