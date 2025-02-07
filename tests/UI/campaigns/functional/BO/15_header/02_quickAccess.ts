// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import common tests
import loginCommon from '@commonTests/BO/loginBO';

// Import pages
import statsPage from '@pages/BO/stats';
import {moduleManager as moduleManagerPage} from '@pages/BO/modules/moduleManager';
import newCategoryPage from '@pages/BO/catalog/categories/add';
import newVoucherPage from '@pages/BO/catalog/discounts/add';
import productsPage from '@pages/BO/catalog/products/';
import ordersPage from '@pages/BO/orders';
import quickAccessPage from '@pages/BO/quickAccess';
import addNewQuickAccessPage from '@pages/BO/quickAccess/add';
import newCustomerPage from '@pages/BO/customers/add';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';
import {
  boDashboardPage,
  FakerQuickAccess,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_BO_header_quickAccess';

describe('BO - Header : Quick access links', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  const quickAccessLinkData: FakerQuickAccess = new FakerQuickAccess({
    name: 'New customer',
    url: 'index.php/sell/customers/new',
    openNewWindow: true,
  });

  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  describe('Check quick access links', async () => {
    it('should login in BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    [
      {args: {pageName: 'Catalog evaluation', pageTitle: statsPage.pageTitle}},
      {args: {pageName: 'Installed modules', pageTitle: moduleManagerPage.pageTitle}},
      {args: {pageName: 'New category', pageTitle: newCategoryPage.pageTitleCreate}},
      {args: {pageName: 'New product', pageTitle: productsPage.pageTitle}},
      {args: {pageName: 'Orders', pageTitle: ordersPage.pageTitle}},
      {args: {pageName: 'New voucher', pageTitle: newVoucherPage.pageTitle}},
    ].forEach((test, index: number) => {
      it(`should check '${test.args.pageName}' link from Quick access`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `checkLink${index}`, baseContext);

        if (test.args.pageName === 'New product') {
          await boDashboardPage.quickAccessToPageWithFrame(page, test.args.pageName);

          const isModalVisible = await productsPage.isNewProductModalVisibleInFrame(page);
          expect(isModalVisible).to.be.equal(true);

          const isModalNotVisible = await productsPage.closeNewProductModal(page);
          expect(isModalNotVisible).to.be.equal(true);
        } else {
          await boDashboardPage.quickAccessToPage(page, test.args.pageName);

          const pageTitle = await boDashboardPage.getPageTitle(page);
          expect(pageTitle).to.contains(test.args.pageTitle);
        }
      });
    });

    it('should remove the last link \'New voucher\' from Quick access', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'removeLinkFromQuickAccess', baseContext);

      const validationMessage = await newVoucherPage.removeLinkFromQuickAccess(page);
      expect(validationMessage).to.contains(newVoucherPage.successfulUpdateMessage);
    });

    it('should refresh the page and add current page to Quick access', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'addCurrentPageToQuickAccess', baseContext);

      await newVoucherPage.reloadPage(page);

      const validationMessage = await newVoucherPage.addCurrentPageToQuickAccess(page, 'New voucher');
      expect(validationMessage).to.contains(newVoucherPage.successfulUpdateMessage);
    });

    it('should go to \'Manage quick access\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToManageQuickAccessPageToCreateLink', baseContext);

      await newVoucherPage.reloadPage(page);
      await newVoucherPage.goToManageQuickAccessPage(page);

      const pageTitle = await quickAccessPage.getPageTitle(page);
      expect(pageTitle).to.contains(quickAccessPage.pageTitle);
    });

    it('should go to \'Add new quick access\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAddQuickAccessPage', baseContext);

      await quickAccessPage.goToAddNewQuickAccessPage(page);

      const pageTitle = await addNewQuickAccessPage.getPageTitle(page);
      expect(pageTitle).to.contains(addNewQuickAccessPage.pageTitle);
    });

    it('should create new quick access link', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createQuickAccessLink', baseContext);

      const validationMessage = await addNewQuickAccessPage.setQuickAccessLink(page, quickAccessLinkData);
      expect(validationMessage).to.contains(addNewQuickAccessPage.successfulCreationMessage);
    });

    it('should check the new link from Quick access', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkNewLink', baseContext);

      page = await boDashboardPage.quickAccessToPageNewWindow(page, quickAccessLinkData.name);

      const pageTitle = await newCustomerPage.getPageTitle(page);
      expect(pageTitle).to.contains(newCustomerPage.pageTitleCreate);
    });

    it('should go to \'Manage quick access\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToManageQuickAccessPageToDeleteLink', baseContext);

      await newCustomerPage.goToManageQuickAccessPage(page);

      const pageTitle = await quickAccessPage.getPageTitle(page);
      expect(pageTitle).to.contains(quickAccessPage.pageTitle);
    });

    it('should filter quick access table by link name', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'searchByName', baseContext);

      await quickAccessPage.filterTable(page, 'input', 'name', quickAccessLinkData.name);

      const textColumn = await quickAccessPage.getTextColumn(page, 1, 'name');
      expect(textColumn).to.contains(quickAccessLinkData.name);
    });

    it('should delete the created quick access link by bulk actions', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'deleteByBulkActions', baseContext);

      const textColumn = await quickAccessPage.bulkDeleteQuickAccessLink(page);
      expect(textColumn).to.be.contains(quickAccessPage.successfulMultiDeleteMessage);
    });
  });
});
