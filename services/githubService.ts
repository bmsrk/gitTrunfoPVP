import { CardData, GithubUser, DeckType, DeckConfig } from '../types';

// Deck configurations with curated users per programming language/stack
export const DECK_CONFIGS: Record<DeckType, DeckConfig> = {
  Standard: {
    id: 'Standard',
    name: 'Standard',
    description: 'Popular developers across all languages',
    icon: '⭐',
    users: [
      'torvalds', 'gaearon', 'yyx990803', 'sindresorhus', 'tj', 'addyosmani',
      'paulirish', 'kentcdodds', 'dan_abramov', 'sophiebits', 'sebmarkbage',
      'mjackson', 'ryanflorence', 'jamiebuilds', 'getify', 'ry'
    ]
  },
  Web: {
    id: 'Web',
    name: 'Web Technologies',
    description: 'JavaScript, TypeScript, HTML, CSS experts',
    icon: '🌐',
    users: [
      'gaearon', 'yyx990803', 'sindresorhus', 'tj', 'addyosmani', 'paulirish',
      'kentcdodds', 'wesbos', 'sarah_edo', 'getify', 'benawad', 'cassidoo',
      'tannerlinsley', 'jaredpalmer', 'chibicode', 'stolinski'
    ]
  },
  LegacyLanguages: {
    id: 'LegacyLanguages',
    name: 'Legacy Languages',
    description: 'C, C++, Java, and system programming legends',
    icon: '🏛️',
    users: [
      'torvalds', 'antirez', 'fabpot', 'mattn', 'fatih', 'clarkgrubb',
      'jashkenas', 'fogleman', 'penberg', 'visionmedia', 'substack',
      'creationix', 'rauchg', 'defunkt', 'mojombo', 'technoweenie'
    ]
  },
  Esoteric: {
    id: 'Esoteric',
    name: 'Esoteric & Niche',
    description: 'Rust, Go, functional programming, and emerging tech',
    icon: '🔮',
    users: [
      'ry', 'jessehattabaugh', 'fitzgen', 'dtolnay', 'BurntSushi', 'alexcrichton',
      'mitsuhiko', 'brson', 'huonw', 'erickt', 'cmr', 'pcwalton',
      'nikomatsakis', 'nrc', 'steveklabnik', 'carols10cents'
    ]
  }
};

const FALLBACK_USERS = [
  'torvalds', 'gaearon', 'yyx990803', 'sindresorhus', 'tj', 'addyosmani', 
  'paulirish', 'mattn', 'mojombo', 'defunkt', 'pjhyett', 'wycats', 
  'ezmobius', 'ivey', 'evanphx', 'vanpelt', 'wayneeseguin', 'brynary', 
  'kevinclark', 'technoweenie', 'macournoyer', 'takeo', 'caged', 'topfunky', 
  'anotherjesse', 'roland', 'lukas', 'fanvsfan', 'tomtt', 'railsjitsu'
];

export const fetchUser = async (username: string): Promise<CardData | null> => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error('Failed to fetch');
    const data: GithubUser = await response.json();
    
    const created = new Date(data.created_at);
    const now = new Date();
    const seniority = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365));

    return {
      ...data,
      seniority,
    };
  } catch (error) {
    console.warn(`Error fetching ${username}, utilizing mock if available.`);
    return null;
  }
};

export const generateDeck = async (count: number = 10, deckType?: DeckType): Promise<CardData[]> => {
  // Use deck-specific users if provided, otherwise use fallback
  const userList = deckType ? DECK_CONFIGS[deckType].users : FALLBACK_USERS;
  
  // Shuffle selected users
  const shuffled = [...userList].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count * 2, userList.length));
  
  const promises = selected.map(u => fetchUser(u));
  const results = await Promise.all(promises);
  
  // Filter nulls and ensure we have enough
  const validCards = results.filter((c): c is CardData => c !== null);
  
  // If we hit rate limits, fill with mock data
  while (validCards.length < count * 2) {
     validCards.push(createMockCard(validCards.length));
  }

  return validCards;
};

const createMockCard = (index: number): CardData => ({
  login: `dev_bot_${index}`,
  avatar_url: `https://picsum.photos/seed/${index}/200`,
  name: `Bot Developer ${index}`,
  public_repos: Math.floor(Math.random() * 200),
  followers: Math.floor(Math.random() * 5000),
  following: Math.floor(Math.random() * 100),
  public_gists: Math.floor(Math.random() * 50),
  created_at: new Date().toISOString(),
  bio: "A simulated developer for when API limits are hit.",
  seniority: Math.floor(Math.random() * 15)
});
