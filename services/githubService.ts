import { CardData, GithubUser } from '../types';

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

export const generateDeck = async (count: number = 10): Promise<CardData[]> => {
  // Shuffle fallback users
  const shuffled = [...FALLBACK_USERS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count * 2); // Fetch enough for 2 players
  
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
