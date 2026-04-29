// builds a token that may secretly embed a lesson score
// score=0 means regular request, score>0 carries a lesson result
export function buildRequestToken(score = 0) {
  const sid = localStorage.getItem('token') || '';
  // key derived from session token — not present anywhere in the request
  const key = parseInt(sid.replace(/-/g, '').slice(0, 8), 16) || 0;
  // changes every 5 seconds — captured tokens can't be replayed after the window expires
  const timeKey = Math.floor(Date.now() / 5000);
  const parts = crypto.randomUUID().split('-');
  parts[0] = ((score ^ key ^ timeKey) >>> 0).toString(16).padStart(8, '0');
  return parts.join('-');
}
