import { LightningElement, api } from "lwc";
import BASE_PATH from "@salesforce/community/basePath";

export default class B2bConfigurator extends LightningElement {
  @api effectiveAccountId;
  @api cartBaseURL;
  view = "selection";
  bundleId;
  bundleImage;
  
  get communityName() {
		let path = BASE_PATH;
		let pos = BASE_PATH.lastIndexOf("/s");
		if (pos >= 0) {
			path = BASE_PATH.substring(0, pos);
		}

		return path;
	}

  get resolvedEffectiveAccountId() {
    const effectiveAccountId = this.effectiveAccountId || '';
    let resolved = null;

    if (
      effectiveAccountId.length > 0 &&
      effectiveAccountId !== '000000000000000'
    ) {
      resolved = effectiveAccountId;
    }

    return resolved;
  }

  get viewSelection() {
    return this.view === "selection";
  }
  get viewConfiguration() {
    return this.view === "configuration";
  }

  connectedCallback() {
    console.log('this.resolvedEffectiveAccountId', this.resolvedEffectiveAccountId);
    console.log('this.cartBaseURL', this.cartBaseURL);
  }

  handleConfigureBundleTile(event) {
    this.updateView(event);
    this.bundleId = event.detail.recordId;
    this.bundleImage = this.formatImageUrl(event.detail.bundleImage);
    console.log("this.bundleImage :>> ", this.bundleImage);
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

  updateView(event) {
    this.view = event.detail.view;
  }

}