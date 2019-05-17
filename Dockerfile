# Copyright Tecnalia Research & Innovation (https://www.tecnalia.com)
# Copyright Tecnalia Blockchain LAB
#
# SPDX-License-Identifier: Apache-2.0

FROM node:10.13.0-alpine

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

# install required dependencies by NPM packages:
# current dependencies are: python, make, g++

RUN apk add --virtual npm-deps python make g++ go && \
    python -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip install --upgrade pip setuptools && \
	rm -r /root/.cache

ENV GOPATH $EXPLORER_APP_PATH/tmp

# copy external data to container
COPY . $EXPLORER_APP_PATH

# install NPM dependencies
RUN cd $EXPLORER_APP_PATH && npm install
RUN cd $EXPLORER_APP_PATH/client && npm install && npm run build

# remove installed packages to free space
RUN apk del npm-deps
WORKDIR $EXPLORER_APP_PATH
# run blockchain explorer main app
CMD $EXPLORER_APP_PATH/start.sh && tail -f /dev/null
