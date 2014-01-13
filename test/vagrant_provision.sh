#!/usr/bin/env bash

function install_from_apt {
  TOOL=$1
  echo "-----> Install $TOOL if needed"
  command -v $TOOL > /dev/null
  if [[ $? -eq 0 ]]; then
    echo "       $TOOL already installed"
    return
  fi
  echo "       $TOOL not installed, begin installation from apt"
  sudo apt-get install -qqy $TOOL
}

function install_node {
  echo "-----> Install nodejs if needed"
  command -v node > /dev/null
  if [[ $? -eq 0 ]]; then
    echo "       nodejs already installed"
    return
  fi
  echo "       nodejs not installed, begin installation from ppa now"
  sudo apt-get update
  sudo apt-get install -y -qq python-software-properties python g++ make
  sudo add-apt-repository -y ppa:chris-lea/node.js
  sudo apt-get update -y
  sudo apt-get install -qqy nodejs
  command -v node > /dev/null
  if [[ $? -eq 0 ]]; then
    echo "       nodejs installed correctly"
    return
  fi
  echo "nodejs failed to install correctly"
  exit 1
}

function npm_rebuild {
  su -c "cd /vagrant/ && npm rebuild" -s /bin/sh vagrant
}

function enable_indexing_on_riak_buckets {
  echo "-----> Enable search on riak buckets"
  echo "       sleep for 3 seconds so riak has time to start"
  sleep "3s"
  enable_search_on_single_bucket "http_test"
  enable_search_on_single_bucket "protobuf_test"
}

function enable_search_on_single_bucket {
  BUCKET=$1
  URL="http://localhost:8098/riak/$BUCKET"
  DATA='{"props":{"precommit":[{"mod":"riak_search_kv_hook","fun":"precommit"}]}}'
  curl --silent -X PUT -d $DATA -H "Content-Type: application/json" $URL
  echo "       enabled search on bucket: $BUCKET"
}

install_from_apt "curl"
install_from_apt "git"
install_node
enable_indexing_on_riak_buckets
# npm_rebuid
