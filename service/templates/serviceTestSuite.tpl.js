/**
 * <%= serviceName %>Test
 *
 * Test Suite for <%= serviceName %>.
 *
 * @author <%= author %>
 * @since <%= appPkg.version %>
 *
 * @copyright (c) <%= currentYear %> Hightail Inc. All Rights Reserved
 */

describe('<%= serviceCategory %>', function() {

  describe('<%= serviceName %>', function() {
    var context = {};

    var <%= serviceName %>;
    var testData;

    // Establish Test Setup
    beforeEach(module('hightail'));
    beforeEach(inject(function($injector) { context.injector = $injector; }));


    beforeEach(inject(function($injector) {
      testData = $injector.get('<%= serviceName %>Data');
      <%= serviceName %> = $injector.get('<%= serviceName %>');
    }));


    /******** TESTS *********/

    runTest('<%= serviceName %>-1000-01', 'Should have service instance', context, function() {
      expect(<%= serviceName %>).toBeDefined();
    });

  });
});