/***
 * generator-component
 *
 * Create a new directory containing scaffolding for a new GSD component
 *
 * Should be run from the root 'gsd' directory.
 *
 * usage: yo component my-component-name
 *
 *        Will create: ~/client/src/components/my-component-name
 */

'use strict';
var util      = require('util');
var path      = require('path');
var fs        = require('fs');
var yeoman    = require('yeoman-generator');
var chalk     = require('chalk');
var banner    = require('./banner');

var Generator = module.exports = function (args, options, config) {
    // Log Usage for Wilson Options
    console.log(banner);
};
