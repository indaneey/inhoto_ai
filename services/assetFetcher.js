/**
 * Asset Fetcher Service
 * Queries the inHoto API for stickers and components relevant to a design category.
 * Uses tag-based filtering to pick the most relevant assets.
 */

const API_BASE = 'https://api.inhoto.com';

/**
 * Map design categories to relevant search tags for stickers & components.
 * These tags will be matched against the `tags` array on each asset.
 */
const TAG_MAP = {
  'wedding':        ['wedding', 'floral', 'elegant', 'love', 'marriage', 'invitation', 'ring', 'couple'],
  'birthday':       ['birthday', 'party', 'celebration', 'fun', 'colorful', 'cake', 'balloon'],
  'corporate':      ['corporate', 'business', 'professional', 'modern', 'event', 'formal'],
  'baby-shower':    ['baby', 'shower', 'pastel', 'cute', 'infant', 'newborn'],
  'new-born':       ['baby', 'newborn', 'aqiqah', 'naming', 'birth', 'cute', 'infant'],
  'save-the-date':  ['save the date', 'wedding', 'date', 'romantic', 'love', 'engagement'],
  'wedding-dinner': ['wedding', 'dinner', 'elegant', 'evening', 'formal', 'reception'],
  'bridal-shower':  ['bridal', 'shower', 'wedding', 'floral', 'feminine', 'romantic'],
  'walima':         ['walima', 'islamic', 'wedding', 'muslim', 'nikah', 'elegant'],
  'engagement':     ['engagement', 'ring', 'love', 'couple', 'romantic', 'wedding'],
};

/**
 * Map design categories to API sticker category IDs (from the actual API).
 */
const STICKER_CATEGORY_MAP = {
  'wedding':        ['685809b2dc9dd7a0a399de6a'],                                                      // wedding
  'birthday':       ['68c9bdfba9f4f6073b5e62f3', '68c940265d44435490c04d39'],                           // floral, shapes
  'corporate':      ['68c940265d44435490c04d39', '68c9c56ca9f4f6073b5e63d2'],                           // shapes, frames
  'baby-shower':    ['68d39687b0499d7a312f6a54', '68c9bdfba9f4f6073b5e62f3'],                           // babies, floral
  'new-born':       ['68d39687b0499d7a312f6a54', '68c9bdfba9f4f6073b5e62f3'],                           // babies, floral
  'save-the-date':  ['685809b2dc9dd7a0a399de6a', '68c9bdfba9f4f6073b5e62f3'],                           // wedding, floral
  'wedding-dinner': ['685809b2dc9dd7a0a399de6a', '68c9bdfba9f4f6073b5e62f3'],                           // wedding, floral
  'bridal-shower':  ['685809b2dc9dd7a0a399de6a', '68c9bdfba9f4f6073b5e62f3'],                           // wedding, floral
  'walima':         ['6945d1b24874d9618b9756d5', '685809b2dc9dd7a0a399de6a'],                           // islam, wedding
  'engagement':     ['685809b2dc9dd7a0a399de6a', '68c9bdfba9f4f6073b5e62f3'],                           // wedding, floral
};

/**
 * Map design categories to API component category IDs.
 */
const COMPONENT_CATEGORY_MAP = {
  'wedding':        ['6716147e9b9ffa2054e58cb2', '6739eb2546b6fca36e8e9c12', '6851425e0125a253519ce58f'], // wedding, titles, invitations
  'birthday':       ['6739eb2546b6fca36e8e9c12', '6751aec146b6fca36e8ea5dd'],                           // titles, celebration
  'corporate':      ['6739eb2546b6fca36e8e9c12'],                                                       // titles
  'baby-shower':    ['6739eb2546b6fca36e8e9c12', '6751aec146b6fca36e8ea5dd'],                           // titles, celebration
  'new-born':       ['6739eb2546b6fca36e8e9c12', '6751aec146b6fca36e8ea5dd'],                           // titles, celebration
  'save-the-date':  ['672f124b0cd6b9f9adc98354', '6739eb2546b6fca36e8e9c12'],                           // save the date, titles
  'wedding-dinner': ['6716147e9b9ffa2054e58cb2', '6739eb2546b6fca36e8e9c12', '6851425e0125a253519ce58f'], // wedding, titles, invitations
  'bridal-shower':  ['6716147e9b9ffa2054e58cb2', '6739eb2546b6fca36e8e9c12'],                           // wedding, titles
  'walima':         ['6942f6746653c9a506b4c729', '6716147e9b9ffa2054e58cb2', '6739eb2546b6fca36e8e9c12'], // islamic, wedding, titles
  'engagement':     ['69569fa037563a4b152a3be4', '6739eb2546b6fca36e8e9c12'],                           // engagement, titles
};

// Fixed dividers & schedule sticker category IDs
const DIVIDER_CATEGORY_ID = '68b1b6a15d44435490c00ed4';
const SCHEDULE_CATEGORY_ID = '68d3ba03b0499d7a312f6e03';

/**
 * Fetch stickers from a category
 */
async function fetchStickers(categoryId, limit = 15) {
  try {
    const response = await fetch(
      `${API_BASE}/api/stickers?category=${categoryId}&page=1&limit=${limit}`
    );
    const data = await response.json();
    return data.success ? (data.stickers || []) : [];
  } catch (error) {
    console.error('Failed to fetch stickers:', error.message);
    return [];
  }
}

/**
 * Fetch components from a category
 */
async function fetchComponents(categoryId, limit = 10) {
  try {
    const response = await fetch(
      `${API_BASE}/api/elements?category=${categoryId}&page=1&limit=${limit}`
    );
    const data = await response.json();
    return data.success ? (data.groupElements || []) : [];
  } catch (error) {
    console.error('Failed to fetch components:', error.message);
    return [];
  }
}

/**
 * Score an asset based on how many of its tags match the desired tags.
 * Higher score = more relevant.
 */
function scoreByTags(assetTags, desiredTags) {
  if (!assetTags || !Array.isArray(assetTags)) return 0;
  const normalizedAssetTags = assetTags.map(t => t.toLowerCase().trim());
  let score = 0;
  for (const desired of desiredTags) {
    if (normalizedAssetTags.some(t => t.includes(desired) || desired.includes(t))) {
      score++;
    }
  }
  return score;
}

/**
 * Fetch relevant decorative assets for a design, ranked by tag relevance.
 */
export async function fetchRelevantAssets(designCategory) {
  const results = { stickers: [], components: [], dividers: [] };
  const desiredTags = TAG_MAP[designCategory] || ['wedding', 'elegant', 'floral'];

  try {
    // 1. Fetch stickers from mapped categories
    const stickerCatIds = STICKER_CATEGORY_MAP[designCategory] || [];
    let allStickers = [];
    
    for (const catId of stickerCatIds.slice(0, 2)) {
      const stickers = await fetchStickers(catId, 10);
      allStickers.push(...stickers);
    }

    // Score and sort by tag relevance, filter to free only
    allStickers = allStickers
      .filter(s => s.license !== 'premium')
      .map(s => ({ ...s, _score: scoreByTags(s.tags, desiredTags) }))
      .sort((a, b) => b._score - a._score);

    results.stickers = allStickers.slice(0, 6).map(s => ({
      id: s.id,
      title: s.title,
      tags: s.tags,
      url: `${API_BASE}/s/${s.shortURLCode}.svg`,
      license: s.license,
      score: s._score
    }));

    // 2. Fetch dividers
    const dividers = await fetchStickers(DIVIDER_CATEGORY_ID, 8);
    const freeDividers = dividers
      .filter(s => s.license !== 'premium')
      .map(s => ({ ...s, _score: scoreByTags(s.tags, desiredTags) }))
      .sort((a, b) => b._score - a._score);

    results.dividers = freeDividers.slice(0, 4).map(s => ({
      id: s.id,
      title: s.title,
      tags: s.tags,
      url: `${API_BASE}/s/${s.shortURLCode}.svg`,
      license: s.license
    }));

    // 3. Fetch components from mapped categories
    const compCatIds = COMPONENT_CATEGORY_MAP[designCategory] || [];
    let allComponents = [];

    for (const catId of compCatIds.slice(0, 2)) {
      const elements = await fetchComponents(catId, 8);
      allComponents.push(...elements);
    }

    // Score and sort by tag relevance
    allComponents = allComponents
      .filter(e => e.license !== 'premium')
      .map(e => ({ ...e, _score: scoreByTags(e.tags, desiredTags) }))
      .sort((a, b) => b._score - a._score);

    results.components = allComponents.slice(0, 4).map(e => ({
      id: e.id,
      title: e.title,
      tags: e.tags,
      url: `${API_BASE}/e/${e.shortURLCode}.json`,
      license: e.license,
      score: e._score
    }));

  } catch (error) {
    console.error('Error fetching relevant assets:', error.message);
  }

  console.log(`Asset fetch for "${designCategory}": ${results.stickers.length} stickers (tag-ranked), ${results.dividers.length} dividers, ${results.components.length} components (tag-ranked)`);
  return results;
}
