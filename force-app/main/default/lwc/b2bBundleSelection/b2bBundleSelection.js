import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getBundles from "@salesforce/apex/TestCommerceCart.getBundleProducts";
import COMMUNITY_ID from '@salesforce/community/Id';
import BASE_PATH from "@salesforce/community/basePath";

const productColumns = [
  { label: "Name", fieldName: "Name" },
  { label: "Family", fieldName: "Family", initialWidth: 200 },
  { label: "Description", fieldName: "Description" },
  {
    type: "button",
    typeAttributes: {
      label: "Build",
      name: "Build",
      variant: "base",
      title: "Build",
      disabled: false,
      value: "build"
    },
    initialWidth: 150,
    cellAttributes: { alignment: "right" }
  }
];

export default class B2bBundleSelection extends LightningElement {
  productColumns = productColumns;
  @track products = [];
  loading = true;
  bundleImageMap;

  get communityName() {
		let path = BASE_PATH;
		let pos = BASE_PATH.lastIndexOf("/s");
		if (pos >= 0) {
			path = BASE_PATH.substring(0, pos);
		}

		return path;
	}

  get bundlesExist() { return this.products.length > 0; }
  get bundleList() { return this.products; }
  get messageNoBundles() { return "Hmmm... we weren't able to find any bundles. If you were expecting to see bundles, please contact your system administrator." }

  connectedCallback() {
    this.loadingHandler();
    getBundles({communityId: COMMUNITY_ID}).then(result => { 
      console.log('TestCommerce.getBundleProducts() :>> ', JSON.parse(result));
      this.handleDataLoad(result);
    })
    .catch(error => {
      this.loadedHandler();
      console.error(error);
      this.dispatchEvent(new ShowToastEvent({ title: 'This can\'t be right...', message: 'There\'s no data!', variant: 'error' }))
    })
  }

  handleDataLoad(result) {
    const thisResult = JSON.parse(result);
    const theseBundles = thisResult.Bundles;
    this.bundleImageMap = thisResult.ProductImageMap;

    if (theseBundles.length > 0) { 
      this.products = theseBundles.map(bundle => { bundle.ProductImage = this.formatImageUrl(this.bundleImageMap[bundle.Id]); return bundle});
    } 
    else if (theseBundles.length == 0) {
      this.products = [];
    }
    this.loadedHandler();
  }
 
  sendBundleConfigTile(event) {
    const Id = event.detail.recordId || '';
    const bundleImage = this.formatImageUrl(this.bundleImageMap[Id]);
    console.log('bundleImage :>> ', bundleImage);
    const view = event.detail.view || 'selection';
    this.dispatchEvent(new CustomEvent('updatebundleselection', {detail: { recordId: Id, view: view, bundleImage: bundleImage} }));
  }

  loadingHandler() { this.loading = true; }
  loadedHandler() { this.loading = false; }

  proxyToObj(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  formatImageUrl(imageUrl) {
    // format image url
    let url = imageUrl;

    if (url.indexOf("/cms/delivery/media") == 0) {
        const searchRegExp = /\/cms\/delivery\/media/g;

        url = url.replace(searchRegExp, this.communityName + "/cms/delivery/media");
    }

    if (url.indexOf("/cms/media") == 0) {
        const searchRegExp = /\/cms\/media/g;

        url = url.replace(searchRegExp, this.communityName + "/cms/delivery/media");
    }

    return url;
  }
}