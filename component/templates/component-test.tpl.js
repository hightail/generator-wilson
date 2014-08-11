/**
 * Unit Test Suite for <%= componentName %> Component
 *
 * @author <%= author %>
 * @since <%= appPkg.version %>
 *
 * @copyright (c) <%= currentYear %> Hightail Inc. All Rights Reserved
 */
describe('Components', function() {
  describe('<%= componentName %>', function() {
    beforeEach(module('hightail'));

    var <%= camelName %>Elem;
    var <%= camelName %>Ctrl;
    var <%= camelName %>Scope;

    beforeEach(inject(function($templateCache, $compile, $rootScope) {
      $templateCache.put('<%= componentName %>', '<div></div>');

      // Build element and assign its scope
      <%= camelName %>Elem = angular.element('<ht-<%= componentName %> expose="testComponent"></ht-<%= componentName %>>');
      $compile(<%= camelName %>Elem)($rootScope);

      // Digest and assign our testable scope
      $rootScope.$digest();
      <%= camelName %>Scope = $rootScope.testComponent;
      <%= camelName %>Ctrl  = <%= camelName %>Elem.controller('<%= directiveName %>');
    }));


    // Tests for <%= componentName %> Component

    // Replace this with your component tests
    it('Should do xyz....', function() {
      expect(true).toBe(true);
    });

  });
});