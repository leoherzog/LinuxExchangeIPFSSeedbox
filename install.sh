#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

npm install ipfs-http-client
echo "Installed Node Libs and Modified urlSource"

cp ./ipfs.service /lib/systemd/system/ipfs.service
systemctl daemon-reload
systemctl enable ipfs.service
systemctl start ipfs.service
echo "Systemd service copied and started! Install IPFS and install this crontab:"
echo "0/4 * * * * /usr/bin/node /home/pi/LinuxExchangeIPFSSeedbox/index.js"
