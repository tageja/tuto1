#!/usr/bin/env node
const path = require('path');

// Change to dashboard directory
process.chdir(__dirname);

// Add the root node_modules to module paths so Next.js can find dependencies
const rootNodeModules = path.join(__dirname, '../../node_modules');
process.env.NODE_PATH = rootNodeModules;
require('module').Module._initPaths();

// Run Next.js
require('../../node_modules/next/dist/bin/next');
