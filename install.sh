#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

npm install ipfs
sed -i -e 's/http.get(url)/http.get(url, options)/g' node_modules/ipfs-utils/src/files/url-source.js
echo "Installed Node Libs and Modified urlSource"

cp ./seedbox.service /lib/systemd/system/seedbox.service
systemctl daemon-reload
systemctl enable seedbox.service
systemctl start seedbox.service
echo "Systemd service copied and started!"