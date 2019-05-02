#!/usr/bin/env bash
npm run webpack-dev &&
tsc --build tsconfig.json
cp src/main/typescript/app/index.js src/main/app/js/index.js &&
npm start
