#!/bin/bash

function commit {
  sudo -u cyberdonos git add .
  sudo -u cyberdonos git commit -m "$1"
  sudo -u cyberdonos git push origin master
}

cd /opt/projects/cyberdonos-browser-extension
[[ "$PWD" =~ /opt/projects/cyberdonos-browser-extension ]] && sudo chown -R cyberdonos:git-users * 
[ ! -z "$1" ] && [[ "$PWD" =~ /opt/projects/cyberdonos-browser-extension ]] && commit $1 
