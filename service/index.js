/***
 * generator-service
 *
 * Create a new Hightail Web service class.
 *
 * Should be run from the root 'gsd' directory.
 *
 * usage: yo service MyService
 *
 *        Will create: ~/client/src/services/MyServices.js
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

var ServiceGenerator = module.exports = function ServiceGenerator(args, options, config) {
    var _self = this;

    //Since we use _ a lot create a short var
    _ = _self._;


    //Create logf() convenience function
    /**
     * Like sprintf() but logs to console
     */
    logf = function() {
        console.log(_.sprintf.apply(_self, arguments));
    };

    //set flag to indicate if a service name was set
    _self.isServiceNameSet = false;

    //These are services that are REQUIRED in our service
    _self.requiredServiceArray = [];

    //This is ALL services that will be used in this service
    _self.serviceArray = [];

    // Show Banner
    console.log(banner);

    //verify we are in the right directory
    var servicesDir = this.servicesDir = path.join('client/src/services/');
    if(!fs.existsSync(servicesDir)) {
        logf(chalk.red('ERROR') + ': Services directory not found. Please run this generator from the root project directory.');
        process.exit(1);
    }

    this._setServiceName = function(serviceName) {
        _self.baseName = serviceName;

        // Service Name
        _self.serviceName = _self.baseName;

        _self.serviceFile = _self.serviceName + '.js';

      //Check to see if this service already exists
      if(fs.existsSync(path.join(_self.servicesDir, _self.serviceFile)) && !_self.removeService) {
        logf(chalk.red("ERROR") + ": Service '%s' already exists in '%s'. Choose a new service name or remove the existing service.", _self.serviceName, _self.servicesDir);
        process.exit(1);
      }
    }

    this._setServiceType = function(serviceType) {
      var stype = serviceType.toLowerCase();

      if (!_.contains(['service', 'class', 'resource', 'utility', 'factory'], serviceType)) { stype = 'service'; }

      _self.serviceType = stype;
    };

    this._setServiceDir = function(dir) {
      _self.servicesDir = path.join(servicesDir, dir);
    }

    this._setConfirmRemove = function(confirm) {
      _self.confirmRemove = confirm;
    };

    _self.removeService = (options.remove == true);

    //Check if we were given a service name in the command line args
    if(args.length > 0) {
        _self.isServiceNameSet = true;

        this._setServiceName(args[0]);
    }

    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        //success message
        if (_self.removeService) {
          console.log(chalk.green("SERVICE REMOVED"));
        } else {
          console.log(chalk.green("SERVICE SUCCESSFULLY CREATED"));
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

util.inherits(ServiceGenerator, yeoman.generators.Base);

ServiceGenerator.prototype.askFor = function askFor() {
    var _self = this;
    var prompts = [];

    if (_self.removeService == true) {
      //If we didnt get the service name from the args then prompt the user for one
      if(this.isServiceNameSet == false) {
        prompts.push({
          name: 'serviceName',
          message: 'Which service would you like to remove?'
        });
      }

      //Additional services prompt
      prompts.push({
        name: 'confirm',
        message: 'Are you sure you want to remove this service (yes/no)',
        default: 'no'
      });
    } else {
      //If we didnt get the service name from the args then prompt the user for one
      if(this.isServiceNameSet == false) {
        prompts.push({
          name: 'serviceName',
          message: 'What is the name of the service (e.g. CacheService)?'
        });
      }

      prompts.push({
        name: 'serviceType',
        message: 'What type of service is this? (service, class, resource, utility, factory)',
        default: 'service'
      })

      prompts.push({
        name: 'serviceDir',
        message: 'Should I put this in a special service folder? (e.g. resources, utilities)',
        default: 'no'
      });

      //Additional services prompt
      prompts.push({
        name: 'serviceList',
        message: 'Additional services (e.g. $http, $location)?',
        default: 'no'
      });

      prompts.push({
        name: 'author',
        message: 'May I ask who is creating this service?',
        default: _self.defaults.author
      });
    }


    if(prompts.length > 0) {
        var cb = this.async();

        this.prompt(prompts, function (props) {
            if(props.serviceName) {
                this._setServiceName(props.serviceName);
            }
            if(props.serviceType) {
              this._setServiceType(props.serviceType);
            }
            if(props.serviceDir && props.serviceDir !== 'no') {
              this._setServiceDir(props.serviceDir);
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
            cb();
        }.bind(this));
    }
};

ServiceGenerator.prototype.app = function app() {
    //Construct all necessary paths
    var sn = this.serviceName;
    var servicesDir = this.servicesDir;
    var servicePath = path.join(servicesDir, this.serviceFile);

    if (this.removeService == true) {

      if(!fs.existsSync(servicePath)) {
        logf(chalk.red("Service " + sn + " does not exist. Removal aborted."));
        process.exit(1);
      }

      if (this.confirmRemove) {
        logf("Removing service '%s'", sn);
        fs.unlinkSync(servicePath);
      } else {
        logf(chalk.red("Remove Cancelled."));
        process.exit(1);
      }
    } else {
      //Make the services array unique
      this.serviceArray = _.union(this.requiredServiceArray, this.serviceArray);

      this.noServices = this.serviceArray.length > 0 ? false : true;

      //Create a list of unquoted services (e.g. SDKService)
      this.serviceList = this.serviceArray.join(', ');

      //Create a list of quoted services (e.g. '$scope', '$attrs', '$http')
      this.serviceList1 = _.map(this.serviceArray, function(serviceName) {
        return _.sprintf("'%s'", serviceName);
      }).join(', ');

      //Create a list of unquoted services (e.g. $scope, $attrs, $http)
      this.serviceList2 = this.serviceArray.join(', ');

      //Check to see if this service already exists
      if(fs.existsSync(servicePath)) {
        logf(chalk.red("ERROR") + ": Service '%s' already exists in '%s'. Choose a new service name or remove the existing service.", sn, servicesDir);
        process.exit(1);
      } else {

        // Make the services sub directory if it doesn't already exist
        if (!fs.existsSync(servicesDir)) { fs.mkdirSync(servicesDir); }

        //Create all necessary files
        logf("Generating GSD Service '%s'", sn);

        //Create Angular directive
        var templateName = this.noServices ? 'serviceNoInject.tpl.js' : 'service.tpl.js';
        this.template(templateName, servicePath);
      }
    }

};
