/***
 * generator-behavior
 *
 * Create a new directory containing scaffolding for a new behavior
 *
 * Should be run from the root 'gsd' directory.
 *
 * usage: yo wilson:behavior my-behavior-name
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

// This gets set inside the module so we can use string functions
var _;
var logf;

// Behavior directory paths
var behaviorsDir  = path.join('client/src/behaviors/');

function deleteFolderRecursive(path) {
  var files = [];
  if( fs.existsSync(path) ) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

/**
 * Convert a behaviorName (e.g. my-behavior) to a directiveName (e.g. htMyBehavior)
 *
 * @param behaviorName
 * @returns {string}
 */
function getDirectiveName(behaviorName) {
  return 'ht' + _.classify(behaviorName);
};

/**
 * Returns an object containing info for behaviorName
 *
 * @param behaviorName
 * @returns {{behaviorName: *,
 *            behaviorDir: *,
 *            templateDir: *,
 *            htmlTemplatePath: *,
 *            mobileHtmlTemplatePath: *,
 *            tabletHtmlTemplatePath: *,
 *            directivePath: *, scssPath: *}}
 */
function getBehaviorInfo(behaviorName) {
  var bn = behaviorName;
  //Construct all necessary paths
  var info = {
    behaviorName: bn,
    camelName: _.camelize(bn),
    className: _.classify(behaviorName) + 'Behavior',
    directiveName: getDirectiveName(behaviorName),
    behaviorDir: path.join(behaviorsDir, bn)
  }

  info.directivePath = path.join(info.behaviorDir, bn + '.js');

  return info;
};

var BehaviorGenerator = module.exports = function BehaviorGenerator(args, options, config) {
    // Show Banner
    console.log(banner);

    var _self = this;
    _self.behaviorsDir = behaviorsDir;

    //Since we use _ a lot create a short var
    //This _ has underscore.stringutils included on it
    _ = _self._;

    //Create logf() convenience function
    /**
     * Like sprintf() but logs to console
     */
    logf = function() {
        console.log(_.sprintf.apply(_self, arguments));
    };

    /**
     * Sets behaviorName, className and directiveName given behaviorName
     *
     * @param behaviorName
     * @private
     */
    this._setBehaviorName = function(behaviorName) {
      var info = getBehaviorInfo(behaviorName);

      //Behavior name (e.g. my-behavior)
      _self.behaviorName = behaviorName;

      // Class Name -- Formalized for documentation
      _self.className = info.className;

      //Directive name (e.g. htMyBehavior)
      _self.directiveName = info.directiveName;

      //Camel Name (e.g. myBehavior)
      _self.camelName = info.camelName;

      //Check to see if this behavior already exists
      if(fs.existsSync(info.behaviorDir) && !_self.removeBehavior) {
        logf(chalk.red("ERROR") + ": Behavior '%s' already exists in '%s'. Choose a new behavior name or remove the existing behavior directory.", componentName, info.componentDir);
        process.exit(1);
      }
    }

    /**
     * Save the author name to the defaultsFile
     *
     * @param author
     * @private
     */
    this._setAuthor = function(author) {
      _self.author = author;
      if (author !== 'hightail.devloper') {
        _self.defaults['author'] = author;
        fs.writeFile(_self.defaultsFile, JSON.stringify(_self.defaults));
      }
    };

    this._setConfirmRemove = function(confirm) {
      _self.confirmRemove = confirm;
    };

    this._setIncludeTests = function(includeTests) {
      _self.includeTests = includeTests;
    };

    //verify we are in the right directory by checking for the components folder
    if(!fs.existsSync(behaviorsDir)) {
      logf(chalk.red('ERROR') + ': Behaviors directory not found. Please run this generator from the root project directory.');
      process.exit(1);
    }

    //Check if we were given a component name in the command line args
    var behaviorName = (args.length > 0)?args[0]:false;

    _self.removeBehavior = (options.remove == true);

    //set flag to indicate if a component name was set
    _self.isBehaviorNameSet = false;

    //These are services that are REQUIRED in our components
    _self.requireBehaviorServiceArray = [];

    //This is ALL services that will be used in this component
    _self.serviceArray = [];

    if(behaviorName) {
      _self.isBehaviorNameSet = true;

      this._setBehaviorName(behaviorName);
    }

    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
      //success message
      if (_self.removeBehavior == true) {
        console.log(chalk.green("BEHAVIOR REMOVED"));
      } else {
        console.log(chalk.green("BEHAVIOR SUCCESSFULLY CREATED"));
      }
    });

    this.appPkg = JSON.parse(this.readFileAsString(path.join('package.json')));

    this.currentYear = (new Date()).getFullYear();

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

util.inherits(BehaviorGenerator, yeoman.generators.Base);

BehaviorGenerator.prototype.askFor = function askFor() {
    var _self = this;
    var prompts = [];


  if (_self.removeBehavior == true) {
    //If we didnt get the behavior name from the args then prompt the user for one
    if(this.isBehaviorNameSet == false) {
      prompts.push({
        name: 'behaviorName',
        message: 'Which behavior would you like to remove?'
      });
    }

    prompts.push({
      name: 'confirm',
      message: 'Are you sure you want to remove this behavior (yes/no)?',
      default: 'no'
    });

  } else {
    //If we didn't get the behavior name from the args then prompt the user for one
    if(this.isBehaviorNameSet == false) {
        prompts.push({
            name: 'behaviorName',
            message: 'What is the name of the behavior (e.g. my-behavior-name)?'
        });
    }

    //Additional services prompt
    prompts.push({
        name: 'serviceList',
        message: 'Additional services (e.g. $http, $location)?',
        default: 'no'
    });

    prompts.push({
      name: 'author',
      message: 'May I ask who is creating this behavior?',
      default: _self.defaults.author
    });
  }

  if(prompts.length > 0) {
      var cb = this.async();

      this.prompt(prompts, function (props) {
          if(props.behaviorName) {
              this._setBehaviorName(props.behaviorName);
          }
          if(props.serviceList) {
              var services = props.serviceList;
              if(services != "no") {
                  this.serviceArray = _.map(props.serviceList.split(','), function(part) {
                      return _.trim(part);
                  });
              }
          }
          if (props.author) {
            this._setAuthor(props.author);
          }
          if (props.confirm) {
            var confirm = props.confirm.toLowerCase() === 'yes';
            this._setConfirmRemove(confirm);
          }
          if (props.includeTests) {
            var includeTests = props.includeTests.toLowerCase() === 'yes';
            this._setIncludeTests(includeTests);
          }
          cb();
      }.bind(this));
  }
};

BehaviorGenerator.prototype.app = function app() {
  var bn = this.behaviorName;

  //Construct all necessary paths
  var behaviorInfo = getBehaviorInfo(bn);

  if (this.removeBehavior == true) {
    if(!fs.existsSync(behaviorInfo.behaviorDir)) {
      logf(chalk.red("Behavior " + bn + " does not exist. Removal aborted."));
      process.exit(1);
    }

    if (this.confirmRemove) {
      logf("Removing behavior '%s'", bn);

      //Remove behavior directory
      logf("Removing: %s", behaviorInfo.behaviorDir);
      deleteFolderRecursive(behaviorInfo.behaviorDir);

    } else {
      logf(chalk.red("Remove Cancelled."));
      process.exit(1);
    }
  } else {
    // Make the services array unique
    this.serviceArray = _.union(this.requiredComponentServiceArray, this.serviceArray);

    // Create a list of quoted services (e.g. '$scope', '$attrs', '$http')
    this.serviceList1 = _.toSentenceSerial(_.map(this.serviceArray, function(serviceName) {
      return _.sprintf("'%s'", serviceName);
    }), ', ', ' ');

    // Create a list of unquoted services (e.g. $scope, $attrs, $http)
    this.serviceList2 = _.toSentenceSerial(this.serviceArray, ', ', ' ');

    // Create all necessary files
    logf("Generating Behavior '%s'", bn);

    // Make a new directory for this behavior
    this.mkdir(behaviorInfo.behaviorDir);

    //Create Behavior
    this.template('behavior.tpl.js', behaviorInfo.directivePath);

  }
};
