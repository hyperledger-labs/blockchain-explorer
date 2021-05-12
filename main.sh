#!/bin/bash

#    SPDX-License-Identifier: Apache-2.0

set -e

# Print usage
function print_help() {
	echo "Usage: "
	echo "    main.sh <mode> [-v]"
	echo "        <mode> - one of 'install', 'test' or 'clean'"
	echo "            - 'install' - install all dependencies of the project"
	echo "            - 'test' - run unit tests of the application and client code"
	echo "            - 'clean' - clean the project directory of installed dependencies"
	echo "        -v - enable verbose output"
	echo "        -h - print this message"
}

function do_install() {
	VERBOSE=${VERBOSE:+-ddd}
	(npm install $VERBOSE && npm run build)
	(cd client && npm install $VERBOSE && npm run build)
}

function do_test() {
	(npm run test)
	(cd client && npm run test:ci -- -u --coverage)
}

function do_clean() {
	rm -rf node_modules
	rm -rf client/node_modules client/build client/coverage
}

# Get subcommand
SUBCOMMAND=$1
shift

case $SUBCOMMAND in
	install | test | clean)
		;;
	*)
		print_help
		exit 1
		;;
esac

OPTIONS="hv"
VERBOSE=
while getopts "$OPTIONS" opt; do
	case "$opt" in
		v) VERBOSE=true ;;
		h)
			print_help
			exit 1
			;;
		*)
			echo "Unrecognized option: $opt"
			exit 2
			;;
	esac
done

case $SUBCOMMAND in
	install)
		do_install
		;;
	test)
		do_test
		;;
	clean)
		do_clean
		;;
	*)
		echo "Logic Error"
		exit 3
		;;
esac
