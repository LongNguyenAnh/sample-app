import { samplePage } from '../../../../shared/pages';

export default () => {
  describe('Test Breadcrumbs', () => {
    it('Validate content and URLs for breadcrumbs', () => {
      let homeLink = cy.get(Page.Sample.Breadcrumb.FirstLink);
      homeLink.should(($a) => {
        expect($a).to.have.attr('href', '/');
        expect($a).to.contain('Home');
      });

      let makeLink = cy.get(SamplePage.Sample.Breadcrumb.SecondLink);
      makeLink.should(($a) => {
        expect($a).to.have.attr('href', '/category/');
        expect($a).to.contain('Category');
      });

      let modelLink = cy.get(SamplePage.Sample.Breadcrumb.ThirdLink);
      modelLink.should(($a) => {
        expect($a).to.have.attr('href', '/category/products/1');
        expect($a).to.contain('Sample Product');
      });

      let yearText = cy.get(samplePage.sample.Breadcrumb.year);
      yearText.should(($a) => {
        expect($a).to.contain('2015');
      });
    });
  });
};
