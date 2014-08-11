/**
 * <%= baseName %> Service
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

angular.wilson.service('<%=baseName%>Service',
  [<%=serviceList1%>, function(<%=serviceList2%>) {
    // Service Object
    var service = { };

    return service;
  }]
);
