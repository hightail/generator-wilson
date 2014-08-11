/***
 * generator-parser
 *
 * Create a new Hightail Web parser class.
 *
 * Should be run from the root 'gsd' directory.
 *
 * usage: yo parser MyParser
 *
 *        Will create: ~/client/src/services/parsers/MyParser.js
 */

'use strict';
var util    = require('util');
var path    = require('path');
var fs      = require('fs');
var yeoman  = require('yeoman-generator');
var chalk   = require('chalk');
var banner  = require('./banner');

//This gets set inside the module so we can use string functions
var _;

var ParserGenerator = module.exports = function ParserGenerator(args, options, config) {
    var _self = this;

    // Since we use _ a lot create a short var
    _ = _self._;

    // Create logf() convenience function
    /**
     * Like sprintf() but logs to console
     */
    this.logf = function() {
        console.log(_.sprintf.apply(_self, arguments));
    };

    //set flag to indicate if a service name was set
    _self.isParserNameSet = false;

    // Show Banner
    console.log(banner);

    //verify we are in the right directory
    var parsersDir = this.parsersDir = path.join('client/src/services/parsers');
    if(!fs.existsSync(parsersDir)) {
        this.logf(chalk.red('ERROR') + ': Parsers directory not found. Please run this generator from the root project directory.');
        process.exit(1);
    }

    this._setParserName = function(parserName) {
        _self.baseName    = parserName.replace(/[Pp]arser/g, '');
        _self.parserName  = _self.baseName + 'Parser';
        _self.parserFile  = _self.parserName + '.js';
        _self.objectName  = _self.baseName.toLowerCase();

      //Check to see if this parser already exists
      if(fs.existsSync(path.join(_self.parsersDir, _self.parserFile)) && !_self.removeParser) {
        _self.logf(chalk.red("ERROR") + ": Parser '%s' already exists in '%s'. Choose a new parser name or remove the existing parser.", _self.parserName, _self.parsersDir);
        process.exit(1);
      }
    }

    this._setConfirmRemove = function(confirm) {
      _self.confirmRemove = confirm;
    };

    _self.removeParser = (options.remove == true);

    //Check if we were given a service name in the command line args
    if(args.length > 0) {
        _self.isParserNameSet = true;

        this._setParserName(args[0]);
    }

    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        //success message
        if (_self.removeParser) {
          console.log(chalk.green("PARSER REMOVED"));
        } else {
          console.log(chalk.green("PARSER SUCCESSFULLY CREATED"));
        }
    });

    this.appPkg = JSON.parse(this.readFileAsString(path.join('package.json')));

    this.currentYear = (new Date()).getFullYear();

    this._setAuthor = function(author) {
      _self.author = author;
      if (author !== 'hightail.devloper') {
        _self.defaults['author'] = author;
        fs.writeFile(_self.defaultsFile, JSON.stringify(_self.defaults));
      }
    };

    // Read Cache
    var cacheDir = path.join(__dirname, '.cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    this.defaultsFile = cacheDir + '/defaults.json';
    this.defaults = {
      author: 'hightail.developer'
    };

    if (fs.existsSync(this.defaultsFile)) {
      try {
        this.defaults = JSON.parse(this.readFileAsString(this.defaultsFile));
      } catch (e) {
        // Something is wrong with the defaults file, lets just delete it
        fs.unlink(this.defaultsFile);
      }
    }

};

util.inherits(ParserGenerator, yeoman.generators.Base);

ParserGenerator.prototype.askFor = function askFor() {
    var _self = this;
    var prompts = [];

    if (_self.removeParser == true) {
      //If we didnt get the parser name from the args then prompt the user for one
      if(this.isParserNameSet == false) {
        prompts.push({
          name: 'parserName',
          message: 'Which parser would you like to remove?'
        });
      }

      //Additional parser prompts
      prompts.push({
        name: 'confirm',
        message: 'Are you sure you want to remove this parser (yes/no)',
        default: 'no'
      });
    } else {
      //If we didnt get the parser name from the args then prompt the user for one
      if(this.isParserNameSet == false) {
        prompts.push({
          name: 'parserName',
          message: 'What is the name of the parser (e.g. AccountParser)?'
        });
      }

      prompts.push({
        name: 'author',
        message: 'May I ask who is creating this parser?',
        default: _self.defaults.author
      });
    }


    if(prompts.length > 0) {
        var cb = this.async();

        this.prompt(prompts, function (props) {
            if(props.parserName) {
                this._setParserName(props.parserName);
            }
            if (props.author) {
              this._setAuthor(props.author);
            }
            if (props.confirm) {
              var confirm = props.confirm.toLowerCase() === 'yes';
              this._setConfirmRemove(confirm);
            }
            cb();
        }.bind(this));
    }
};

ParserGenerator.prototype.app = function app() {
    //Construct all necessary paths
    var pn = this.parserName;
    var parsersDir = this.parsersDir;
    var parserPath = path.join(parsersDir, this.parserFile);


    if (this.removeParser == true) {

      if(!fs.existsSync(parserPath)) {
        this.logf(chalk.red("Parser " + pn + " does not exist. Removal aborted."));
        process.exit(1);
      }

      if (this.confirmRemove) {
        this.logf("Removing parser '%s'", pn);
        fs.unlinkSync(parserPath);
      } else {
        this.logf(chalk.red("Remove Cancelled."));
        process.exit(1);
      }
    } else {
      //Check to see if this parser already exists
      if(fs.existsSync(parserPath)) {
        this.logf(chalk.red("ERROR") + ": Parser '%s' already exists in '%s'. Choose a new parser name or remove the existing parser.", pn, parsersDir);
        process.exit(1);
      } else {
        // Create all necessary files
        this.logf("Generating Parser '%s'", pn);

        // Create Parser
        this.template('parser.tpl.js', parserPath);
      }
    }

};
