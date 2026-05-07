function makeUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

const INSTRUMENTS = ['guitar', 'piano', 'drums']
const LEVELS = ['beginner', 'medium', 'hard', 'expert']

// builds a token that may secretly embed a lesson score, stars, tile, instrument, and level
// score=0 means regular dummy request, score>0 carries a lesson result
export function buildRequestToken(score = 0, stars = 0, tileNumber = 0, instrument = '', level = '') {
  const sid = localStorage.getItem('token') || '';
  // key derived from session token — not present anywhere in the request
  const key = parseInt(sid.replace(/-/g, '').slice(0, 8), 16) || 0;
  // changes every 5 seconds — captured tokens can't be replayed after the window expires
  const timeKey = Math.floor(Date.now() / 5000);
  const parts = makeUUID().split('-');
  const key1 = parseInt(sid.replace(/-/g, '').slice(8,  12), 16) || 0;
  const key2 = parseInt(sid.replace(/-/g, '').slice(12, 16), 16) || 0;
  const key3 = parseInt(sid.replace(/-/g, '').slice(16, 20), 16) || 0;
  const instrumentIdx = Math.max(0, INSTRUMENTS.indexOf(instrument))
  const levelIdx = Math.max(0, LEVELS.indexOf(level))
  parts[0] = ((score ^ key ^ timeKey) >>> 0).toString(16).padStart(8, '0');
  parts[1] = (((stars ^ key1 ^ timeKey) >>> 0) & 0xFFFF).toString(16).padStart(4, '0');
  parts[2] = (((tileNumber ^ key2 ^ timeKey) >>> 0) & 0xFFFF).toString(16).padStart(4, '0');
  parts[3] = ((((levelIdx * 4 + instrumentIdx) ^ key3 ^ timeKey) >>> 0) & 0xFFFF).toString(16).padStart(4, '0');
  return parts.join('-');
}
