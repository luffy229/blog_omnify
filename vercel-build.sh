#!/bin/bash

# Install root dependencies
npm install

# Navigate to client directory
cd client

# Install client dependencies and build
npm install
npm run build

# Move build folder to the expected location
mkdir -p ../public
cp -r build/* ../public/ 