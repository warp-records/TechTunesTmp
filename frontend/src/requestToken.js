function makeUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

// builds a token that may secretly embed a lesson score
// score=0 means regular dummy request, score>0 carries a lesson result
export function buildRequestToken(score = 0) {
  const sid = localStorage.getItem('token') || '';
  // key derived from session token — not present anywhere in the request
  const key = parseInt(sid.replace(/-/g, '').slice(0, 8), 16) || 0;
  // changes every 5 seconds — captured tokens can't be replayed after the window expires
  const timeKey = Math.floor(Date.now() / 5000);
  const parts = makeUUID().split('-');
  parts[0] = ((score ^ key ^ timeKey) >>> 0).toString(16).padStart(8, '0');
  return parts.join('-');
}
