/**
 * <%= baseName %>
 *
 * @class <%= serviceName %>
 * @module Hightail
 * @submodule Hightail.Services
 *
 * @author <%= author %>
 * @since <%= appPkg.version %>
 *
 * @copyright (c) <%= currentYear %> Hightail Inc. All Rights Reserved
 */
'use strict';

angular.wilson.service('<%=baseName%>', <% if (noServices) { %> function() { <% } %> <% if (!noServices) { %> [<%=serviceList1%>, <% } %>
  <% if (!noServices) { %> function(<%=serviceList2%>) {  <% } %>

    //
    //                       o                        |    |             |
    //  ,---.,---.,---..    ,.,---.,---.    ,-.-.,---.|--- |---.,---.,---|,---.
    //  `---.|---'|     \  / ||    |---'    | | ||---'|    |   ||   ||   |`---.
    //  `---'`---'`      `'  ``---'`---'    ` ' '`---'`---'`   '`---'`---'`---'
    //:



    /************************************/
    /******** SERVICE INTERFACE *********/
    /************************************/
    var service = { };

    return service;
  }<% if (!noServices) { print(']'); } %>
);
