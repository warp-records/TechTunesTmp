/** @type {Record<string, RegionRecord[]>} */
export const CITY_REGIONS = {
  Philadelphia: [
    { regionId: 'center-city', regionName: 'Center City' },
    { regionId: 'north-philly', regionName: 'North Philly' },
    { regionId: 'south-philly', regionName: 'South Philly' },
  ],
}

/** @type {Record<string, ProgramRecord>} */
export const PROGRAMS_BY_ID = {
  musicopia: {
    id: 'musicopia',
    title: 'Musicopia',
    desc: "We partner with the Musicopia Foundation to help 51 schools in Philadelphia that don't have access to music education, to provide them with the tools and resources they need to succeed. Let's change that!",
    city: 'Philadelphia',
    regionIds: ['center-city'],
    actions: [
      {
        label: 'Donate Instruments',
        href: 'https://www.musicopia.net/instrument-donation-form',
      },
      { label: 'Volunteer', href: 'https://www.musicopia.net/volunteer' },
      {
        label: 'Donate Money',
        href: 'https://secure.givelively.org/donate/musicopia-inc',
      },
      { label: 'How much we raised so far', href: null },
    ],
  },
  generationMusic: {
    id: 'generationMusic',
    title: 'Generation Music',
    desc: 'A fun program in Philly where kids and teens can learn, play, and share their music with others.',
    city: 'Philadelphia',
    regionIds: ['center-city'],
    actions: [
      { label: 'Support Us', href: 'https://www.generationmusic.art/support-us' },
      {
        label: 'Get Involved',
        href: 'https://www.generationmusic.art/get-involved-1',
      },
      { label: 'Learn More', href: 'https://www.generationmusic.art' },
      { label: 'How much we raised so far', href: null },
    ],
  },
  pcms: {
    id: 'pcms',
    title: 'Philadelphia Chamber Music Society',
    desc: 'PCMS brings world-class chamber music to Philadelphia, fostering appreciation for classical music through concerts, education, and community engagement.',
    city: 'Philadelphia',
    regionIds: ['center-city'],
    actions: [
      { label: 'Learn More', href: 'https://www.pcmsconcerts.org/about/' },
      {
        label: 'Donate',
        href: 'https://www.pcmsconcerts.org/support/secure-donation/',
      },
      { label: 'Fund', href: 'https://www.pcmsconcerts.org/support/fund/' },
      { label: 'How much we raised so far', href: null },
    ],
  },
  playOnPhilly: {
    id: 'playOnPhilly',
    title: 'Play On Philly',
    desc: 'A free program that helps kids learn instruments every day and grow through music.',
    city: 'Philadelphia',
    regionIds: CITY_REGIONS.Philadelphia.map((region) => region.regionId),
    actions: [
      { label: 'Learn More', href: 'https://playonphilly.org/' },
      {
        label: 'Donate',
        href: 'https://playonphilly.org/get-involved/donate/',
      },
      {
        label: 'Donate Instruments',
        href: 'https://playonphilly.org/get-involved/instrument-donations/',
      },
      { label: 'How much we raised so far', href: null },
    ],
  },
}
