/**
 * <%= serviceName %> Test Data Service
 *
 * @author <%= author %>
 * @since <%= appPkg.version %>
 *
 * @copyright (c) <%= currentYear %> Hightail Inc. All Rights Reserved
 */

wilson.service('<%= serviceName %>Data', ['MockDataService', function(MockDataService) {

  // <%= serviceName %>Data Test Data
  var testData = {

  };


  MockDataService.setTestData(testData);
  return testData;
}]);