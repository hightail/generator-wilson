/**
 * <%= componentName %> Component
 *
 * @class <%= className %>
 * @module Hightail
 * @submodule Hightail.Components
 *
 * @example
 *    <ht-<%= componentName %>></ht-<%= componentName %>>
 *
 * @author <%= author %>
 * @since <%= appPkg.version %>
 *
 * @copyright (c) <%= currentYear %> Hightail Inc. All Rights Reserved
 */
'use strict';

angular.wilson.component('<%=componentName%>', {
  <% if (isPage) { print('page: true,'); } %>
  controller: [<%=serviceList1%>, function(<%=serviceList2%>) {

//  controller.setState({
//    initial: '',
//    events: [
//      { name: '',  from: '',  to: '' }
//    ],
//    timeouts: [],
//    callbacks: {}
//  });

  }]<% if (!isPage) { print(','); } %>
  <% if (!isPage) {  %>
  link: function($scope, $element, $attrs, controller) {
  }
  <% } %>
});
