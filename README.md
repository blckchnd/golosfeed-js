Golos Feed JS
============

This is a GOLOS Price Feed for witnesses on the [Golos Network](https://golos.io). It's
written in Node.JS and uses Someguy123's (fork of SVK's) [GolosJS-Lib](https://github.com/someguy123/golosjs-lib).

Installation
========

For the script node.js v7 or above required


First, download the git repository, then edit `config.json` as needed. The interval is in minutes.

```
git clone https://github.com/gropox/golosfeed-js.git
cd golosfeed-js
cp config.example.json config.json
nano config.json
npm install
```

**Starting Via NodeJS (assuming you have >= v7 installed)**
```
node app.js
```

Docker
========

```
docker build -t golosfeed-js .
docker run -it --rm --name golosfeed golosfeed-js
```