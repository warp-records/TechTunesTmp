const PAYMENT_PATHS = ['/payment', '/parent_permission'];
const onPaymentPage = () => PAYMENT_PATHS.some(p => window.location.pathname.startsWith(p));
const isStripeTracker = url => /r\.stripe\.com|m\.stripe\.network|q\.stripe\.com/.test(String(url));

// Intercept src setter on script/iframe elements before the browser fires the request
const blockSrc = (proto) => {
  const desc = Object.getOwnPropertyDescriptor(proto, 'src');
  if (!desc) return;
  Object.defineProperty(proto, 'src', {
    ...desc,
    set(val) {
      if (!onPaymentPage() && /js\.stripe\.com/.test(val)) return;
      desc.set.call(this, val);
    },
  });
};
blockSrc(HTMLScriptElement.prototype);
blockSrc(HTMLIFrameElement.prototype);

// MutationObserver as belt-and-suspenders for any nodes added with src already set
const isStripeNode = node =>
  (node.nodeName === 'IFRAME' || node.nodeName === 'SCRIPT') &&
  /js\.stripe\.com/.test(node.src || '');

const observer = new MutationObserver(mutations => {
  if (onPaymentPage()) return;
  for (const { addedNodes } of mutations) {
    addedNodes.forEach(node => { if (isStripeNode(node)) node.remove(); });
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });

// Block sendBeacon to tracker domains (used by stripe.js directly in page context)
const _beacon = navigator.sendBeacon.bind(navigator);
navigator.sendBeacon = function (url, ...args) {
  if (!onPaymentPage() && isStripeTracker(url)) return true;
  return _beacon(url, ...args);
};

// Block fetch to tracker domains as backup
const _fetch = window.fetch;
window.fetch = function (url, ...args) {
  if (!onPaymentPage() && isStripeTracker(url)) return Promise.resolve(new Response('', { status: 200 }));
  return _fetch.call(this, url, ...args);
};
