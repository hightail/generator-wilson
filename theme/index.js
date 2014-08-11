/***
 * generator-theme
 *
 * Create a new Hightail Web theme.
 *
 * Should be run from the root 'gsd' directory.
 *
 * usage: yo theme my-theme-name
 *
 */

'use strict';
var util    = require('util');
var path    = require('path');
var fs      = require('fs');
var yeoman  = require('yeoman-generator');
var chalk   = require('chalk');
var banner  = require('./banner');

// This gets set inside the module so we can use string functions
var _ ;

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

var ThemeGenerator = module.exports = function ThemeGenerator(args, options, config) {
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
  _self.isThemeNameSet = false;

  // Show Banner
  console.log(banner);

  //verify we are in the right directory
  var themesDir = this.themesDir = path.join('client/appearance/themes/');
  if(!fs.existsSync(themesDir)) {
    this.logf(chalk.red('ERROR') + ': Themes directory not found. Please run this generator from the root project directory.');
    process.exit(1);
  }

  this._setThemeName = function(themeName) {
    _self.baseName  = _.trim(_.dasherize(themeName), '-');

    // Service Name
    _self.themeName = _.classify(_self.baseName);
  };

  this._setConfirmRemove = function(confirm) {
    _self.confirmRemove = confirm;
  };

  //Check if we were given a service name in the command line args
  if(args.length > 0) {
    _self.isThemeNameSet = true;
    this._setThemeName(args[0]);
  }

  _self.removeTheme = (options.remove == true);

  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    //success message
    if (_self.removeTheme) {
      console.log(chalk.green("THEME REMOVED"));
    } else {
      console.log(chalk.green("THEME SUCCESSFULLY CREATED"));
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

util.inherits(ThemeGenerator, yeoman.generators.Base);

ThemeGenerator.prototype.askFor = function askFor() {
  var _self = this;
  var prompts = [];

  if (_self.removeTheme == true) {
    //If we didnt get the service name from the args then prompt the user for one
    if(this.isThemeNameSet == false) {
      prompts.push({
        name: 'themeName',
        message: 'Which theme would you like to remove?'
      });
    }

    prompts.push({
      name: 'confirm',
      message: 'Are you sure you want to remove this theme (yes/no)?',
      default: 'no'
    });

  } else {
    //If we didnt get the service name from the args then prompt the user for one
    if(this.isThemeNameSet == false) {
      prompts.push({
        name: 'themeName',
        message: 'What is the name of the theme (e.g. columbus-day)?'
      });
    }

    prompts.push({
      name: 'author',
      message: 'May I ask who is creating this theme?',
      default: _self.defaults.author
    });
  }

  if(prompts.length > 0) {
    var cb = this.async();

    this.prompt(prompts, function (props) {
      if(props.themeName) {
        this._setThemeName(props.themeName);
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

ThemeGenerator.prototype.app = function app() {
  var gen = this;

  //Construct all necessary paths
  var tn = this.themeName;
  var bn = this.baseName;
  var themesDir = this.themesDir;
  var themePath = path.join(themesDir, bn);

  if (gen.removeTheme == true) {

    if(!fs.existsSync(themePath)) {
      this.logf(chalk.red("Theme " + tn + " does not exist. Removal aborted."));
      process.exit(1);
    }

    if (gen.confirmRemove) {
      if(fs.existsSync(themePath)) {
        // Remove the directory contents
        gen.logf(chalk.green("Removing theme '%s'"), bn);
        deleteFolderRecursive(themePath);
      } else {
        gen.logf("Theme '%s' does not exist. No need to remove.", bn, themesDir);
      }
    } else {
      gen.logf(chalk.red("Remove Cancelled."));
      process.exit(1);
    }
  } else {
    //Check to see if this theme already exists
    if(fs.existsSync(themePath)) {
      gen.logf(chalk.red("ERROR") + ": Theme '%s' already exists in '%s'. Choose a new theme name or remove the existing theme.", bn, themesDir);
      process.exit(1);
    } else {
      //Create all necessary Directory structure and files
      gen.logf("Generating Theme '%s'", tn);

      var stylesPath    = path.join(themePath, 'styles');
      var exportsPath   = path.join(stylesPath, 'exports');
      var assetsPath    = path.join(themePath, 'assets');

      _.each([themePath, stylesPath, exportsPath, assetsPath], function(dirPath) {
        fs.mkdirSync(dirPath);
      });

      gen.template('theme.scss', path.join(stylesPath, '_theme.scss'));

      var baseTypes = fs.readdirSync(path.join('client/appearance/base/'));
      baseTypes = _.without(baseTypes, 'common', '.DS_Store');

      _.each(baseTypes, function(type) {
        // Create Export Files
        gen.baseType = type;
        gen.baseTypeName = _.classify(type);
        gen.template('exports.scss', path.join(exportsPath, (gen.baseName + '.' + gen.baseType + '.scss')));
      });

    }
  }
};
