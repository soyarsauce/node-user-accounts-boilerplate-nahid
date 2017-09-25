#!/bin/bash

npm install scrypt --no-save

NODE_PATH=$PWD nodemon -x mocha test/ --recursive
