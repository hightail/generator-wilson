var chalk = require('chalk');

module.exports =
chalk.red.bold('\n**********************************************************') +
chalk.red('\n         _    _   _   _      ____   _____   _    _  ' +
'\n        | |  | | | | | |    |  __| |  _  | | \\  | |  ' +
'\n        | |  | | | | | |    | |__  | | | | |  \\ | |  ' +
'\n        | |  | | | | | |    |__  | | | | | |   \\| |  ' +
'\n        |  /\\  | | | | |__   __| | | |_| | | |\\   |  ' +
'\n        |_/  \\_| |_| |____| |____| |_____| |_| \\__|  ' +
'\n                                                          ') +
chalk.red.bold('\n                    Yeoman Generators                    ') +
'\n                                                          ' +
'\n  Usage:                                                          ' +
'\n      yo wilson:<generator>                                                        ' +
'\n                                                          ' +
'\n  Generators:                                                             ' +
'\n      component, behavior, service           ' +
chalk.red.bold('\n**********************************************************');
