/**
 * <%= baseName %> Guide
 *
 * @class <%= guideClass %>
 * @module Hightail
 * @submodule Hightail.Guides
 *
 * @example
 *    <element <%= baseName %>></element>
 *
 * @author <%= author %>
 * @since <%= appPkg.version %>
 *
 * @copyright (c) <%= currentYear %> Hightail Inc. All Rights Reserved
 */
'use strict';

angular.wilson.guide('<%= baseName %>',

  // Guide Definition
  function() {
    return {
      steps: [
        <% for (var i = 0; i < guideSteps; i++) { %>{
          title: '<%= guideTitle %> Step <%= i + 1 %>',
          content: 'This is the content text for step <%= i + 1 %>',
          target: $('a')[<%= i %>],
          placement: 'left'
        } <% if ((i + 1) < guideSteps) { %>,<% } %>
        <% } %>
      ]
    };
  }

);