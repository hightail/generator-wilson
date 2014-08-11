/***
 * generator-guide
 *
 * Create a new Hightail Web guide class.
 *
 * Should be run from the root 'gsd' directory.
 *
 * usage: yo guide my-guide
 *
 *        Will create: ~/client/src/guides/my-guide.js
 */

'use strict';
var util    = require('util');
var path    = require('path');
var fs      = require('fs');
var yeoman  = require('yeoman-generator');
var chalk   = require('chalk');
var banner  = require('./banner');

// This gets set inside the module so we can use string functions
var _;

var GuideGenerator = module.exports = function GuideGenerator(args, options, config) {
  var _self = this;

  //Since we use _ a lot create a short var
  _ = _self._;

  //Create logf() convenience function
  /**
   * Like sprintf() but logs to console
   */
  this.logf = function() {
    console.log(_.sprintf.apply(_self, arguments));
  };

  //set flag to indicate if a service name was set
  _self.isGuideNameSet = false;

  // Show Banner
  console.log(banner);

  //verify we are in the right directory
  var guidesDir = this.guidesDir = path.join('client/src/guides');
  if(!fs.existsSync(guidesDir)) {
    this.logf(chalk.red('ERROR') + ': Guides directory not found. Please run this generator from the root project directory.');
    process.exit(1);
  }

  this._setGuideName = function(guideName) {
    _self.baseName    = _.slugify(guideName);

    var guideNameRegex = /guide-.*/;
    if (!guideNameRegex.test(_self.baseName)) {
      _self.baseName = 'guide-' + _self.baseName;
    }

    _self.guideClass  = _.classify(_self.baseName);
    _self.guideTitle  = _.humanize(_self.baseName.replace('guide-', ''));
    _self.guideName   = _self.baseName;
    _self.guideFile   = _self.guideName + '.js';

    //Check to see if this service already exists
    if(fs.existsSync(path.join(_self.guidesDir, _self.guideFile)) && !_self.removeGuide) {
      _self.logf(chalk.red("ERROR") + ": Guide '%s' already exists in '%s'. Choose a new guide name or remove the existing guide.", _self.guideName, _self.guidesDir);
      process.exit(1);
    }
  }

  this._setGuideSteps = function(guideStepCount) {
    _self.guideSteps = guideStepCount;
  };

  this._setConfirmRemove = function(confirm) {
    _self.confirmRemove = confirm;
  };

  _self.removeGuide = (options.remove == true);

  //Check if we were given a service name in the command line args
  if(args.length > 0) {
    _self.isGuideNameSet = true;

    this._setGuideName(args[0]);
  }

  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    //success message
    if (_self.removeGuide) {
      console.log(chalk.green("GUIDE REMOVED"));
    } else {
      console.log(chalk.green("GUIDE SUCCESSFULLY CREATED"));
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

util.inherits(GuideGenerator, yeoman.generators.Base);

GuideGenerator.prototype.askFor = function askFor() {
  var _self = this;
  var prompts = [];

  if (_self.removeGuide == true) {
    //If we didnt get the guide name from the args then prompt the user for one
    if(this.isGuideNameSet == false) {
      prompts.push({
        name: 'guideName',
        message: 'Which guide would you like to remove?'
      });
    }

    //Additional guide prompt
    prompts.push({
      name: 'confirm',
      message: 'Are you sure you want to remove this guide (yes/no)',
      default: 'no'
    });
  } else {
    //If we didnt get the service name from the args then prompt the user for one
    if(this.isGuideNameSet == false) {
      prompts.push({
        name: 'guideName',
        message: 'What is the name of the guide (e.g. guide-send-file)?'
      });
    }

    prompts.push({
      name: 'guideSteps',
      message: 'How many steps will this guide contain?',
      default: 3
    });

    prompts.push({
      name: 'author',
      message: 'May I ask who is creating this guide?',
      default: _self.defaults.author
    });
  }


  if(prompts.length > 0) {
    var cb = this.async();

    this.prompt(prompts, function (props) {
      if(props.guideName) {
        this._setGuideName(props.guideName);
      }
      if (props.author) {
        this._setAuthor(props.author);
      }
      if (props.confirm) {
        var confirm = props.confirm.toLowerCase() === 'yes';
        this._setConfirmRemove(confirm);
      }
      if (props.guideSteps) {
        this._setGuideSteps(props.guideSteps);
      }
      cb();
    }.bind(this));
  }
};

GuideGenerator.prototype.app = function app() {
  //Construct all necessary paths
  var gn = this.guideName;
  var guidesDir = this.guidesDir;
  var guidePath = path.join(guidesDir, this.guideFile);


  if (this.removeGuide == true) {

    if(!fs.existsSync(guidePath)) {
      this.logf(chalk.red("Guide " + gn + " does not exist. Removal aborted."));
      process.exit(1);
    }

    if (this.confirmRemove) {
      this.logf("Removing guide '%s'", gn);
      fs.unlinkSync(guidePath);
    } else {
      this.logf(chalk.red("Remove Cancelled."));
      process.exit(1);
    }
  } else {
    //Check to see if this guide already exists
    if(fs.existsSync(guidePath)) {
      this.logf(chalk.red("ERROR") + ": Guide '%s' already exists in '%s'. Choose a new guide name or remove the existing guide.", gn, guidesDir);
      process.exit(1);
    } else {
      //Create all necessary files
      this.logf("Generating Guide '%s'", gn);

      //Create Guide
      this.template('guide.tpl.js', guidePath);
    }
  }

};
