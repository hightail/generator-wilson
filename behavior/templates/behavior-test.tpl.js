/**
 * Unit Test Suite for <%= behaviorName %> Behavior
 *
 * @author <%= author %>
 * @since <%= appPkg.version %>
 *
 * @copyright (c) <%= currentYear %> Hightail Inc. All Rights Reserved
 */
describe('Behaviors', function() {
  describe('<%= behaviorName %>', function() {
    beforeEach(module('hightail'));

    var <%= camelName %>Elem;
    var <%= camelName %>Scope;

    beforeEach(inject(function($compile, $rootScope) {
      // Build element and assign its scope
      <%= camelName %>Elem = angular.element('<div ht-<%= behaviorName %>></div>');
      $compile(<%= camelName %>Elem)($rootScope);
      $rootScope.$digest();
      <%= camelName %>Scope = <%= camelName %>Elem.scope();
    }));


    // Tests for <%= behaviorName %> Behavior

    // Replace this with your behavior tests
    it('Should do xyz....', function() {
      expect(true).toBe(true);
    });

  });
});