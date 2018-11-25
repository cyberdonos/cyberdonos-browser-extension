#!/bin/bash
mkdir tmp
mkdir chrome-extension
cp -r assets chrome-extension
cp -r js chrome-extension
cp -r css chrome-extension
cp -r icons chrome-extension
cp index.html chrome-extension
cp LICENSE chrome-extension
cp README.md chrome-extension
cp manifest.json chrome-extension
cp browser-polyfill.js chrome-extension/js/
#wget -q https://raw.githubusercontent.com/mozilla/webextension-polyfill/master/src/browser-polyfill.js -O chrome-extension/js/browser-polyfill.js
sed -i 's#<!-- mozilla polyfill -->#<script type="application/javascript" src="js/browser-polyfill.js"></script>#g' chrome-extension/index.html
sed -i 's#"js/dayjs.js"#"js/browser-polyfill.js", "js/dayjs.js"#g' chrome-extension/manifest.json
cd chrome-extension && zip -r ../tmp/cyberdonos-chrome.zip *
rm -rf *
