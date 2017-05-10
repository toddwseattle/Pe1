'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('my app', function() {


  it('should automatically redirect to /summary when location hash/fragment is empty', function() {
    browser.get('index.html');
    expect(browser.getLocationAbsUrl()).toMatch("/summary");
  });


  describe('summary', function() {

    beforeEach(function() {
      browser.get('index.html#/summary');
    });


    it('should render summary when user navigates to /summary', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 1/);
    });

  });


  describe('review', function() {

    beforeEach(function() {
      browser.get('index.html#/review');
    });


    it('should render review when user navigates to /review', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 2/);
    });

  });
});
