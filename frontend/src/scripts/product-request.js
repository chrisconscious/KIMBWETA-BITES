const ProductRequest = {
  show() {
    openModal(`
      <div style="padding:24px;max-width:420px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div class="h3">Request a Product</div>
          <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
        </div>
        <div style="margin-bottom:16px">
          <div class="label" style="margin-bottom:8px">Product Name *</div>
          <input class="input" id="reqProductName" placeholder="e.g. Chicken Pizza" style="width:100%">
        </div>
        <div style="margin-bottom:20px">
          <div class="label" style="margin-bottom:8px">Additional Info (optional)</div>
          <textarea class="input" id="reqMessage" placeholder="Tell us more about what you're looking for..." style="width:100%;min-height:80px;resize:vertical"></textarea>
        </div>
        <button class="btn btn-primary btn-lg" style="width:100%" onclick="ProductRequest._submit()">Submit Request</button>
      </div>
    `);
  },

  async _submit() {
    const name = document.getElementById('reqProductName')?.value?.trim();
    if (!name) { Toast.show('error', 'Please enter a product name'); return; }
    const message = document.getElementById('reqMessage')?.value?.trim() || '';
    try {
      const resp = await API.requestProduct(name, message);
      if (resp.ok) {
        Toast.show('success', 'Product request submitted!');
        closeAll();
      } else {
        const err = await resp.json().catch(() => ({}));
        Toast.show('error', err.message || 'Failed to submit request');
      }
    } catch { Toast.show('error', 'Connection error'); }
  },
};
