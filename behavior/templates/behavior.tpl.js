/**
 * <%= behaviorName %> Behavior
 *
 * @class <%= className %>
 * @module Hightail
 * @submodule Hightail.Behaviors
 *
 * @example
 *    <element ht-<%= behaviorName %>> </element>
 *
 *    Note: MUST be used as an attribute.
 *
 * @author <%= author %>
 * @since <%= appPkg.version %>
 *
 * @copyright (c) <%= currentYear %> Hightail Inc. All Rights Reserved
 */
'use strict';

wilson.behavior('<%=behaviorName%>', <% if (serviceList1 && serviceList1.length) { %>[<%= serviceList1.replace(' ', ', ') %>, function(<%= serviceList2.replace(' ', ', ') %>) {
  <% } else { %>function() {
  <% } %>
    return {
      restrict: 'A',

      link: function($scope, $element, $attrs, controller) {

        /*** Behavior Logic Goes Here ***/

      }
    };

  }<% if (serviceList1 && serviceList1.length) { %>]<% } %>
);

