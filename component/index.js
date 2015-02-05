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
var util    = require('util');
var path    = require('path');
var fs      = require('fs');
var yeoman  = require('yeoman-generator');
var chalk   = require('chalk');
var banner  = require('./banner');

// This gets set inside the module so we can use string functions
var _;
var logf;

// Components directory path
var componentsDir = path.join('client/src/components/');
var sassFilesDir = path.join('client/src/components/');
var pageCompDir = path.join(componentsDir, 'pages');
var buildingCompDir = path.join(componentsDir, 'building-blocks');
var buildingTestDir = path.join('test/client/components/building-blocks');
var pageTestDir = path.join('test/client/components/pages');

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
 * Convert a @componentName (e.g. my-component) to a directiveName (e.g. htMyComponent)
 *
 * @param componentName
 * @returns {string}
 */
function getDirectiveName(componentName) {
  return 'componentHt' + _.classify(componentName);
};

function isExistingComponent(componentName) {
  return (fs.existsSync(path.join(pageCompDir, componentName)) || fs.existsSync(path.join(buildingCompDir, componentName)));
};

function checkIsPage(componentName) {
  return fs.existsSync(path.join(pageCompDir, componentName));
};

/**
 * Returns an object containing info for @componentName
 *
 * @param componentName
 * @returns {{componentName: *,
 *            componentDir: *,
 *            templateDir: *,
 *            htmlTemplatePath: *,
 *            mobileHtmlTemplatePath: *,
 *            tabletHtmlTemplatePath: *,
 *            directivePath: *, scssPath: *}}
 */
function getComponentInfo(componentName, isPage) {
  var cn = componentName;
  var compPath = isPage ? pageCompDir : buildingCompDir;
  var testDir  = isPage ? pageTestDir : buildingTestDir;

  //Construct all necessary paths
  var info = {
    componentName: cn,
    className: _.classify(componentName) + 'Component',
    camelName: _.camelize(componentName),
    directiveName: getDirectiveName(componentName),
    componentDir: path.join(compPath, cn),
    scssPath: path.join(compPath, cn, 'styles', cn + '.scss'),
    testDir: path.join(testDir, cn)
  }

  info.templateDir  = path.join(info.componentDir, 'templates');
  info.stylesDir    = path.join(info.componentDir, 'styles');
  info.htmlTemplatePath = path.join(info.templateDir, cn + '.html');
  info.mobileHtmlTemplatePath = path.join(info.templateDir, cn + '.mobile.html');
  info.tabletHtmlTemplatePath = path.join(info.templateDir, cn + '.tablet.html');
  info.directivePath = path.join(info.componentDir, cn + '.js');
  info.testPath = path.join(info.testDir, 'test-' + cn + '.js');

  return info;
};

var ComponentGenerator = module.exports = function ComponentGenerator(args, options, config) {
    // Show Banner
    console.log(banner);

    var _self = this;
    _self.componentsDir = componentsDir;

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
     * Sets componentName, className and directiveName given @componentName
     *
     * @param componentName
     * @private
     */
    this._setComponentName = function(componentName) {
      if (isExistingComponent(componentName) && !_self.removeComponent) {
        logf(chalk.red("ERROR") + ": Component '%s' already exists. Choose a new component name or remove the existing component directory.", componentName);
        process.exit(1);
      } else {
        //Component name (e.g. my-component)
        _self.componentName = _.slugify(componentName);

        // Class Name -- Formalized for documentation
        _self.className = _.classify(componentName) + 'Component';

        // Camel Name
        _self.camelName = _.camelize(componentName);

        //Directive name (e.g. htMyComponent)
        _self.directiveName = getDirectiveName(componentName);
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

    this._setIsPage = function(isPage) {
      _self.isPage = isPage;
    };

    this._setRoutePath = function(routePath) {
      _self.routePath = routePath;
    };

    this._setConfirmRemove = function(confirm) {
      _self.confirmRemove = confirm;
    };

    this._setIncludeTests = function(includeTests) {
      _self.includeTests = includeTests;
    };

    //verify we are in the right directory by checking for the components folder
    if(!fs.existsSync(componentsDir)) {
      logf(chalk.red('ERROR') + ': Components directory not found. Please run this generator from the root project directory.');
      process.exit(1);
    }

    //Check if we were given a component name in the command line args
    var componentName = (args.length > 0)?args[0]:false;

    _self.removeComponent = (options.remove == true);

    //set flag to indicate if a component name was set
    _self.isComponentNameSet = false;

    //These are services that are REQUIRED in our components
    _self.requiredComponentServiceArray = ['$scope'];

    //This is ALL services that will be used in this component
    _self.serviceArray = [];

    if(componentName) {
      _self.isComponentNameSet = true;

      this._setComponentName(componentName);
    }

    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
      //success message
      if (_self.removeComponent == true) {
        console.log(chalk.green("COMPONENT REMOVED"));
      } else {
        console.log(chalk.green("COMPONENT SUCCESSFULLY CREATED"));
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

util.inherits(ComponentGenerator, yeoman.generators.Base);

ComponentGenerator.prototype.askFor = function askFor() {
  var _self       = this;
  var cb          = this.async();

  var mainPrompts = [];
  var pagePrompts = [];
  var metaPrompts = [];

  function handleMainPrompts(props) {
    var isPage = false;
    if (props.componentName) { _self._setComponentName(props.componentName); }
    if (props.isPage) {
      isPage = props.isPage.toLowerCase() === 'yes';
      _self._setIsPage(isPage);
    }

    if (isPage) {
      _self.prompt(pagePrompts, handlePagePrompts);
    } else {
      _self.prompt(metaPrompts, handleMetaPrompts);
    }
  }

  function handlePagePrompts(props) {
    if (props.routePath)  { _self._setRoutePath(props.routePath); }
    if (props.routeTitle) { _self._setRouteTitle(props.routeTitle); }

    _self.prompt(metaPrompts, handleMetaPrompts);
  }

  function handleMetaPrompts(props) {
    if (props.serviceList) {
      var services = props.serviceList;
      if(services != "no") {
        _self.serviceArray = _.map(props.serviceList.split(','), function(part) {
          return _.trim(part);
        });
      }
    }
    if (props.author) {
      _self._setAuthor(props.author);
    }
    if (props.includeTests) {
      var includeTests = props.includeTests.toLowerCase() === 'yes';
      _self._setIncludeTests(includeTests);
    }

    cb();
  }


  if (_self.removeComponent == true) {
    var removePrompts = [];

    //If we didnt get the component name from the args then prompt the user for one
    if(this.isComponentNameSet == false) {
      removePrompts.push({
        name: 'componentName',
        message: 'Which component would you like to remove?'
      });
    }

    removePrompts.push({
      name: 'confirm',
      message: 'Are you sure you want to remove this component (yes/no)?',
      default: 'no'
    });

    this.prompt(removePrompts, function(props) {
      if (props.componentName) { _self._setComponentName(props.componentName); }
      if (props.confirm) {
        var confirm = props.confirm.toLowerCase() === 'yes';
        _self._setConfirmRemove(confirm);
      }

      cb();
    });

  } else {

    //If we didn't get the component name from the args then prompt the user for one
    if(this.isComponentNameSet == false) {
        mainPrompts.push({
            name: 'componentName',
            message: 'What is the name of the component (e.g. my-component-name)?'
        });
    }

    // Type of Component
    mainPrompts.push({
      name: 'isPage',
      message: 'Will this component be used to represent a top-level page (yes/no)?',
      default: 'no'
    });

    pagePrompts.push({
      name: 'routePath',
      message: 'Add a route for this page (blank for no route): ',
      default: false
    });

    //Additional services prompt
    metaPrompts.push({
        name: 'serviceList',
        message: 'Additional services (e.g. $http, $location)?',
        default: 'no'
    });

    metaPrompts.push({
      name: 'includeTests',
      message: 'Should I provision test files for this component?',
      default: 'no'
    });

    metaPrompts.push({
      name: 'author',
      message: 'May I ask who is creating this component?',
      default: _self.defaults.author
    });

    this.prompt(mainPrompts, handleMainPrompts);
  }
};

ComponentGenerator.prototype.app = function app() {
  var cn = this.componentName;
  var componentInfo = null;

  if (this.removeComponent == true) {
    if (!isExistingComponent(cn)) {
      logf(chalk.red("Component " + cn + " does not exist. Removal aborted."));
      process.exit(1);
    }

    componentInfo = getComponentInfo(cn, checkIsPage(cn));

    if (this.confirmRemove) {
      logf("Removing component '%s'", cn);

      //Remove component directory
      logf("Removing: %s", componentInfo.componentDir);
      deleteFolderRecursive(componentInfo.componentDir);

      //Removing any possible routes for this component
      var routeFile   = path.join('client/routing.json');
      var routeConfig = null;
      if (fs.existsSync(routeFile)) {
        routeConfig = JSON.parse(fs.readFileSync(routeFile, { encoding: 'UTF-8' }));
        var componentIndex = _.findIndex(routeConfig.routes, { component: this.componentName });
        routeConfig.routes.splice(componentIndex, 1);
        fs.writeFileSync(routeFile, JSON.stringify(routeConfig, undefined, 2), { encoding: 'UTF-8'} );
      }

      //Remove test directory
      logf("Removing: %s", componentInfo.testDir);
      deleteFolderRecursive(componentInfo.testDir);
    } else {
      logf(chalk.red("Remove Cancelled."));
      process.exit(1);
    }
  } else {
    componentInfo = getComponentInfo(cn, this.isPage)

    //Make the services array unique
    var pageServices = _.without(this.requiredComponentServiceArray, '$attrs');
    this.serviceArray = _.union((this.isPage ? pageServices : this.requiredComponentServiceArray), this.serviceArray);

    //Create a list of quoted services (e.g. '$scope', '$attrs', '$http')
    this.serviceList1 = _.map(this.serviceArray, function(serviceName) {
      return _.sprintf("'%s'", serviceName);
    }).join(', ');

    //Create a list of unquoted services (e.g. $scope, $attrs, $http)
    this.serviceList2 = this.serviceArray.join(', ');

    //Create all necessary files
    logf("Generating Component '%s'", cn);

    //Make a new directory for this component
    this.mkdir(componentInfo.componentDir);

    //Create a templates directory
    this.mkdir(componentInfo.templateDir);

    //Create styles directory
    this.mkdir(componentInfo.stylesDir);

    if(this.isPage) {
      this.defaultBehaviors = ' ht-track-page';

      if (this.routePath) {
        var routeFile   = path.join('client/routing.json');
        var routeConfig = null;
        if (fs.existsSync(routeFile)) {
          routeConfig = JSON.parse(fs.readFileSync(routeFile, { encoding: 'UTF-8' }));

          var title = this.componentName;

          if (routeConfig.routes.length) { title = routeConfig.routes[0].title; }

          routeConfig.routes.unshift({
            "path": this.routePath,
            "component": this.componentName,
            "title": title,
            "options": {}
          });

          fs.writeFileSync(routeFile, JSON.stringify(routeConfig, undefined, 2), { encoding: 'UTF-8'} );
        }
      }

    } else {
      this.defaultBehaviors = '';
    }

    //create JS, HTML and CSS templates
    this.platform = 'desktop';
    this.template('component.tpl.js', componentInfo.directivePath);
    this.template('component.tpl.html', componentInfo.htmlTemplatePath);
    this.template('component.tpl.scss', componentInfo.scssPath);

    // Create the Test directory
    if (this.includeTests) {
      this.mkdir(componentInfo.testDir);

      //Create Unit Tests
      this.template('component-test.tpl.js', componentInfo.testPath);
    }
  }
};
