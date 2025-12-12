import { CardData, GithubUser, DeckType, DeckConfig, GitHubRepoStats, GitHubLanguageStats } from '../types';

// Normalization reference ranges (based on typical GitHub user distribution)
const NORMALIZATION_RANGES = {
  followers: { min: 0, max: 10000 },
  repos: { min: 0, max: 500 },
  stars: { min: 0, max: 50000 },
  languages: { min: 0, max: 20 },
  activity: { min: 0, max: 50 }
};

// API success rate threshold for using real vs mock data
const API_SUCCESS_THRESHOLD = 0.5; // 50% success rate required

// Cache management
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const memoryCache = new Map<string, CacheEntry<any>>();

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
  },
  Corporate: {
    id: 'Corporate',
    name: 'Corporate',
    description: 'DevRel, community leaders, and influencers',
    icon: '🏢',
    users: [
      'github', 'microsoft', 'google', 'facebook', 'vercel', 'netlify',
      'kelseyhightower', 'jessfraz', 'cassidoo', 'sarah_edo', 'kentcdodds',
      'wesbos', 'addyosmani', 'paulirish', 'chriscoyier', 'una'
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

// Cache helpers
const getCacheKey = (type: string, identifier: string) => `github_${type}_${identifier}`;

const getFromCache = <T>(key: string): T | null => {
  // Check memory cache first
  const memEntry = memoryCache.get(key);
  if (memEntry && Date.now() - memEntry.timestamp < CACHE_TTL) {
    return memEntry.data as T;
  }
  
  // Check localStorage
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const entry: CacheEntry<T> = JSON.parse(stored);
      if (Date.now() - entry.timestamp < CACHE_TTL) {
        memoryCache.set(key, entry);
        return entry.data;
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }
  
  return null;
};

const setCache = <T>(key: string, data: T) => {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.warn('Cache write error:', e);
  }
};

// Normalization functions (0-100 scale)
const normalizeLogScale = (value: number, min: number, max: number): number => {
  if (value <= 0) return 0;
  if (max <= min) return 50;
  const logValue = Math.log10(value + 1);
  const logMin = Math.log10(min + 1);
  const logMax = Math.log10(max + 1);
  const normalized = ((logValue - logMin) / (logMax - logMin)) * 100;
  return Math.max(0, Math.min(100, normalized));
};

const normalizeLinear = (value: number, min: number, max: number): number => {
  if (max <= min) return 50;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
};

// Fetch user repositories
const fetchUserRepos = async (username: string): Promise<any[]> => {
  const cacheKey = getCacheKey('repos', username);
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) return cached;
  
  try {
    // Fetch first page only to keep requests reasonable
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!response.ok) throw new Error('Failed to fetch repos');
    const repos = await response.json();
    setCache(cacheKey, repos);
    return repos;
  } catch (error) {
    console.warn(`Error fetching repos for ${username}`);
    return [];
  }
};

// Fetch and aggregate language stats
const fetchLanguageStats = async (username: string): Promise<GitHubLanguageStats> => {
  const cacheKey = getCacheKey('languages', username);
  const cached = getFromCache<GitHubLanguageStats>(cacheKey);
  if (cached) return cached;
  
  try {
    const repos = await fetchUserRepos(username);
    const languageBytes: Record<string, number> = {};
    
    // Aggregate languages from repo language field (no additional API calls)
    for (const repo of repos.slice(0, 30)) { // Limit to 30 repos
      if (repo.language) {
        languageBytes[repo.language] = (languageBytes[repo.language] || 0) + (repo.size || 1);
      }
    }
    
    const languageCount = Object.keys(languageBytes).length;
    const topLanguage = languageCount > 0 
      ? Object.entries(languageBytes).sort((a, b) => b[1] - a[1])[0][0]
      : null;
    
    const stats: GitHubLanguageStats = {
      languages: languageBytes,
      topLanguage,
      languageCount
    };
    
    setCache(cacheKey, stats);
    return stats;
  } catch (error) {
    console.warn(`Error fetching language stats for ${username}`);
    return { languages: {}, topLanguage: null, languageCount: 0 };
  }
};

// Fetch repo stats
const fetchRepoStats = async (username: string): Promise<GitHubRepoStats> => {
  const cacheKey = getCacheKey('repostats', username);
  const cached = getFromCache<GitHubRepoStats>(cacheKey);
  if (cached) return cached;
  
  try {
    const repos = await fetchUserRepos(username);
    
    let totalStars = 0;
    let totalForks = 0;
    let topRepoStars = 0;
    let lastCommitDate: string | null = null;
    
    for (const repo of repos) {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      topRepoStars = Math.max(topRepoStars, repo.stargazers_count || 0);
      
      if (repo.pushed_at && (!lastCommitDate || repo.pushed_at > lastCommitDate)) {
        lastCommitDate = repo.pushed_at;
      }
    }
    
    const avgStarsPerRepo = repos.length > 0 ? totalStars / repos.length : 0;
    
    // Calculate recency score (commits in last 90 days)
    let recentCommits = 0;
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    for (const repo of repos) {
      if (repo.pushed_at && new Date(repo.pushed_at) > ninetyDaysAgo) {
        recentCommits++;
      }
    }
    
    const stats: GitHubRepoStats = {
      totalStars,
      totalForks,
      avgStarsPerRepo,
      topRepoStars,
      recentCommits,
      lastCommitDate
    };
    
    setCache(cacheKey, stats);
    return stats;
  } catch (error) {
    console.warn(`Error fetching repo stats for ${username}`);
    return {
      totalStars: 0,
      totalForks: 0,
      avgStarsPerRepo: 0,
      topRepoStars: 0,
      recentCommits: 0,
      lastCommitDate: null
    };
  }
};

// Calculate strategic attributes from enriched data
const calculateStrategicAttributes = (user: GithubUser, repoStats: GitHubRepoStats, languageStats: GitHubLanguageStats) => {
  // 1. Followers Score (log scale for heavy tail)
  const followersScore = normalizeLogScale(user.followers, NORMALIZATION_RANGES.followers.min, NORMALIZATION_RANGES.followers.max);
  
  // 2. Repositories Score (log scale)
  const repositoriesScore = normalizeLogScale(user.public_repos, NORMALIZATION_RANGES.repos.min, NORMALIZATION_RANGES.repos.max);
  
  // 3. Influence Score (aggregate: stars + forks, log scale)
  const totalInfluence = repoStats.totalStars + repoStats.totalForks;
  const influenceScore = normalizeLogScale(totalInfluence, NORMALIZATION_RANGES.stars.min, NORMALIZATION_RANGES.stars.max);
  
  // 4. Activity Score (recent commits + recency bonus)
  const daysSinceLastCommit = repoStats.lastCommitDate 
    ? Math.floor((Date.now() - new Date(repoStats.lastCommitDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const recencyBonus = Math.max(0, 100 - daysSinceLastCommit / 3); // Decay over 300 days
  const activityBase = normalizeLinear(repoStats.recentCommits, NORMALIZATION_RANGES.activity.min, NORMALIZATION_RANGES.activity.max);
  const activityScore = Math.min(100, (activityBase * 0.7) + (recencyBonus * 0.3));
  
  // 5. Tech Breadth (language diversity)
  const techBreadth = normalizeLinear(languageStats.languageCount, NORMALIZATION_RANGES.languages.min, NORMALIZATION_RANGES.languages.max);
  
  // 6. Impact Score (community engagement + longevity + efficiency)
  const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365));
  const longevityScore = Math.min(100, (accountAge / 10) * 100); // Max at 10 years
  const gistsScore = normalizeLinear(user.public_gists, 0, 100); // Knowledge sharing
  const followerEfficiency = user.public_repos > 0 ? (user.followers / user.public_repos) : 0;
  const efficiencyScore = normalizeLogScale(followerEfficiency, 0, 50); // Followers per repo
  const followingRatio = user.followers > 0 ? Math.min(100, (user.following / user.followers) * 100) : 0;
  const engagementBonus = followingRatio > 10 && followingRatio < 80 ? 20 : 0; // Active community participant
  
  const impactScore = Math.min(100, 
    (longevityScore * 0.3) + 
    (gistsScore * 0.2) + 
    (efficiencyScore * 0.3) + 
    (engagementBonus * 1.0) +
    (activityScore * 0.2) // Bonus for being active
  );
  
  return {
    followersScore: Math.round(followersScore),
    repositoriesScore: Math.round(repositoriesScore),
    influenceScore: Math.round(influenceScore),
    activityScore: Math.round(activityScore),
    techBreadth: Math.round(techBreadth),
    impactScore: Math.round(impactScore)
  };
};

export const fetchUser = async (username: string): Promise<CardData | null> => {
  const cacheKey = getCacheKey('user', username);
  const cached = getFromCache<CardData>(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error('Failed to fetch');
    const data: GithubUser = await response.json();
    
    const created = new Date(data.created_at);
    const now = new Date();
    const seniority = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365));

    // Enrich with additional data
    const repoStats = await fetchRepoStats(username);
    const languageStats = await fetchLanguageStats(username);
    const strategicAttrs = calculateStrategicAttributes(data, repoStats, languageStats);

    const cardData: CardData = {
      ...data,
      seniority,
      ...strategicAttrs,
      repoStats,
      languageStats
    };
    
    setCache(cacheKey, cardData);
    return cardData;
  } catch (error) {
    console.warn(`Error fetching ${username}, utilizing mock if available.`);
    return null;
  }
};

export const generateDeck = async (count: number = 10, deckType: DeckType = 'Standard'): Promise<CardData[]> => {
  // Use deck-specific users
  const userList = DECK_CONFIGS[deckType].users;
  
  // Shuffle selected users
  const shuffled = [...userList].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count * 2, userList.length));
  
  const promises = selected.map(u => fetchUser(u));
  const results = await Promise.all(promises);
  
  // Filter nulls and ensure we have enough
  const validCards = results.filter((c): c is CardData => c !== null);
  
  // NEW REQUIREMENT: Don't mix mock data with real data
  // If we have at least 50% valid cards, use only real data
  // If we have less than 50%, it means significant API issues, use all mock
  const minRequired = count * 2;
  const successRate = validCards.length / minRequired;
  
  if (successRate >= API_SUCCESS_THRESHOLD) {
    // Good success rate, use only real cards
    if (validCards.length >= minRequired) {
      return validCards.slice(0, minRequired);
    } else {
      // Try to fetch more from fallback list
      const additionalUsers = [...FALLBACK_USERS]
        .filter(u => !selected.includes(u))
        .sort(() => 0.5 - Math.random())
        .slice(0, minRequired - validCards.length);
      
      const additionalPromises = additionalUsers.map(u => fetchUser(u));
      const additionalResults = await Promise.all(additionalPromises);
      const additionalValid = additionalResults.filter((c): c is CardData => c !== null);
      
      validCards.push(...additionalValid);
      
      // If still not enough, just use what we have (smaller deck)
      return validCards.slice(0, Math.min(minRequired, validCards.length));
    }
  } else {
    // Poor success rate (API issues), use all mock data
    console.warn('GitHub API rate limit or network issues detected. Using mock data for consistent experience.');
    const mockCards: CardData[] = [];
    for (let i = 0; i < minRequired; i++) {
      mockCards.push(createMockCard(i));
    }
    return mockCards;
  }
};

const createMockCard = (index: number): CardData => {
  // Deterministic mock values based on index
  const baseRepos = 50 + (index * 13) % 150;
  const baseFollowers = 100 + (index * 37) % 4900;
  const baseStars = 200 + (index * 71) % 9800;
  const baseForks = 50 + (index * 29) % 1950;
  const baseLanguages = 3 + (index * 7) % 12;
  const baseActivity = 10 + (index * 11) % 40;
  
  const repoStats: GitHubRepoStats = {
    totalStars: baseStars,
    totalForks: baseForks,
    avgStarsPerRepo: baseRepos > 0 ? baseStars / baseRepos : 0,
    topRepoStars: Math.floor(baseStars * 0.4),
    recentCommits: baseActivity,
    lastCommitDate: new Date(Date.now() - (index * 7) * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const languageStats: GitHubLanguageStats = {
    languages: {},
    topLanguage: 'JavaScript',
    languageCount: baseLanguages
  };
  
  const mockUser: GithubUser = {
    login: `mock_dev_${index}`,
    avatar_url: `https://picsum.photos/seed/${index}/200`,
    name: `Mock Developer ${index}`,
    public_repos: baseRepos,
    followers: baseFollowers,
    following: 50 + (index * 5) % 100,
    public_gists: 10 + (index * 3) % 40,
    created_at: new Date(Date.now() - (5 + index % 10) * 365 * 24 * 60 * 60 * 1000).toISOString(),
    bio: "A simulated developer (mock data due to API rate limits)"
  };
  
  const strategicAttrs = calculateStrategicAttributes(mockUser, repoStats, languageStats);
  
  return {
    ...mockUser,
    seniority: 5 + (index % 10),
    ...strategicAttrs,
    repoStats,
    languageStats
  };
};
