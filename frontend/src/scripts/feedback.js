const Feedback = {
  _ratings: [
    { value: 5, emoji: '😍', label: 'Excellent' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 3, emoji: '😐', label: 'Average' },
    { value: 2, emoji: '😞', label: 'Poor' },
    { value: 1, emoji: '😡', label: 'Very Poor' },
  ],

  _categories: ['Food Quality', 'Packaging', 'Delivery Speed', 'Price', 'Customer Service', 'Product Availability', 'Other'],

  _cancelReasons: ['Delivery taking too long', 'Changed my mind', 'Product unavailable', 'Found another option', 'Price too high', 'Other'],

  showDelivery(orderId) {
    const ratingBtns = this._ratings.map(r => `<button class="feedback-rating-btn" data-value="${r.value}" onclick="Feedback._selectRating(this,${r.value})"><span class="feedback-emoji">${r.emoji}</span><span>${r.label}</span></button>`).join('');
    const catBtns = this._categories.map(c => `<button class="feedback-cat-btn" data-cat="${c}" onclick="Feedback._toggleCat(this)">${c}</button>`).join('');
    openModal(`
      <div style="padding:24px;max-width:480px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div class="h3">How was your experience?</div>
          <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:24px" id="ratingOptions">${ratingBtns}</div>
        <div class="label" style="margin-bottom:12px">What influenced your experience?</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px" id="catOptions">${catBtns}</div>
        <div class="label" style="margin-bottom:8px">Tell us more (optional)</div>
        <textarea class="input" style="width:100%;min-height:80px;resize:vertical;margin-bottom:20px" id="feedbackMessage" placeholder="Share your thoughts..."></textarea>
        <button class="btn btn-primary btn-lg" style="width:100%" onclick="Feedback._submitDelivery('${orderId}')">Submit Feedback</button>
      </div>
    `);
  },

  _selectRating(btn, value) {
    document.querySelectorAll('.feedback-rating-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    btn._rating = value;
  },

  _toggleCat(btn) {
    btn.classList.toggle('selected');
  },

  async _submitDelivery(orderId) {
    const ratingEl = document.querySelector('.feedback-rating-btn.selected');
    if (!ratingEl) { Toast.show('error', 'Please select a rating'); return; }
    const rating = parseInt(ratingEl.dataset.value);
    const cats = [...document.querySelectorAll('.feedback-cat-btn.selected')].map(b => b.dataset.cat);
    const message = document.getElementById('feedbackMessage')?.value?.trim() || '';
    try {
      const resp = await API.submitDeliveryFeedback(orderId, rating, cats.join(', '), message);
      if (resp.ok) {
        Toast.show('success', 'Thank you for your feedback!');
        closeAll();
        Feedback._askRecommend(orderId);
      } else {
        const err = await resp.json().catch(() => ({}));
        Toast.show('error', err.message || 'Failed to submit feedback');
      }
    } catch { Toast.show('error', 'Connection error'); }
  },

  _askRecommend(orderId) {
    openModal(`
      <div style="padding:24px;max-width:400px;text-align:center">
        <div style="font-size:48px;margin-bottom:16px">⭐</div>
        <div class="h3" style="margin-bottom:8px">Would you recommend this product to a friend?</div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px">
          <button class="btn btn-primary" onclick="Feedback._submitRec('${orderId}','YES')">YES</button>
          <button class="btn btn-outline" onclick="Feedback._submitRec('${orderId}','MAYBE')">MAYBE</button>
          <button class="btn btn-ghost" onclick="Feedback._submitRec('${orderId}','NO'); closeAll()">NO</button>
        </div>
      </div>
    `);
  },

  async _submitRec(orderId, recommend) {
    try {
      await API.submitRecommendation(orderId, recommend);
    } catch {}
    closeAll();
    if (recommend === 'YES') {
      Toast.show('success', 'Great! Share with your friends!');
      setTimeout(() => {
        const order = null; // Trigger share flow
        Share.show('', '');
      }, 500);
    }
  },

  showCancellation(orderId) {
    const reasonBtns = this._cancelReasons.map(r => `<button class="feedback-cat-btn" data-reason="${r}" onclick="Feedback._toggleCat(this)">${r}</button>`).join('');
    openModal(`
      <div style="padding:24px;max-width:480px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div class="h3">Why did you cancel?</div>
          <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px" id="cancelReasons">${reasonBtns}</div>
        <div class="label" style="margin-bottom:8px">What can we improve?</div>
        <textarea class="input" style="width:100%;min-height:80px;resize:vertical;margin-bottom:20px" id="cancelMessage" placeholder="Tell us how we can do better..."></textarea>
        <button class="btn btn-primary btn-lg" style="width:100%" onclick="Feedback._submitCancel('${orderId}')">Submit</button>
      </div>
    `);
  },

  async _submitCancel(orderId) {
    const selected = [...document.querySelectorAll('#cancelReasons .feedback-cat-btn.selected')];
    if (!selected.length) { Toast.show('error', 'Please select a reason'); return; }
    const reason = selected.map(b => b.dataset.reason).join(', ');
    const message = document.getElementById('cancelMessage')?.value?.trim() || '';
    try {
      const resp = await API.submitCancellationFeedback(orderId, reason, message);
      if (resp.ok) {
        Toast.show('success', 'Thank you for your feedback!');
        closeAll();
      } else {
        const err = await resp.json().catch(() => ({}));
        Toast.show('error', err.message || 'Failed to submit');
      }
    } catch { Toast.show('error', 'Connection error'); }
  },
};
