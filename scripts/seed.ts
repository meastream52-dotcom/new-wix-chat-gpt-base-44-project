import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const db = new PrismaClient();

const categories = [
  { name: 'Movies',            slug: 'movies',            description: 'Latest movie news, reviews and trailers' },
  { name: 'TV',                slug: 'tv',                description: 'TV show news, recaps and reviews' },
  { name: 'Gaming',            slug: 'gaming',            description: 'Video game news, reviews and guides' },
  { name: 'Comics',            slug: 'comics',            description: 'Marvel, DC and indie comics' },
  { name: 'Star Wars',         slug: 'star-wars',         description: 'Everything from a galaxy far, far away' },
  { name: 'Lord of the Rings', slug: 'lord-of-the-rings', description: 'Middle-earth news and analysis' },
  { name: 'Game of Thrones',   slug: 'game-of-thrones',   description: 'Westeros news and House of the Dragon' },
  { name: 'AI',                slug: 'ai',                description: 'Artificial intelligence news and analysis' },
  { name: 'Anthropic',         slug: 'anthropic',         description: 'Claude, Constitutional AI and Anthropic news' },
  { name: 'OpenAI',            slug: 'openai',            description: 'ChatGPT, GPT-5 and OpenAI news' },
  { name: 'xAI',               slug: 'xai',               description: "Elon Musk's xAI and Grok news" },
  { name: 'DeepSeek',          slug: 'deepseek',          description: "China's DeepSeek AI news" },
  { name: 'Country Music',     slug: 'country-music',     description: 'Country music news and reviews' },
  { name: 'Eminem',            slug: 'eminem',            description: 'Slim Shady news, albums and tours' },
  { name: 'Taylor Swift',      slug: 'taylor-swift',      description: 'Taylor Swift news, albums and Eras Tour' },
  { name: 'Sports',            slug: 'sports',            description: 'NFL, NBA, UFC and more' },
  { name: 'Celebrity News',    slug: 'celebrity-news',    description: 'Hollywood celebrity news and gossip' },
  { name: 'Marvel',            slug: 'marvel',            description: 'MCU, comics and Marvel Studios news' },
  { name: 'DC',                slug: 'dc',                description: 'DC Universe, films and TV news' },
  { name: 'Anime',             slug: 'anime',             description: 'Anime news, reviews and releases' },
];

const posts = [
  {
    title: 'Star Wars: The Acolyte Season 2 — Everything We Know So Far',
    excerpt: 'Lucasfilm has been tight-lipped, but here\'s every confirmed detail about the next chapter set in the High Republic era.',
    content: `<p>The High Republic era continues to captivate Star Wars fans worldwide. After the shocking events of Season 1, showrunner Leslye Headland has teased exciting new directions for the series that will push deeper into the mysteries of the Force.</p><h2>What We Know So Far</h2><p>Sources close to production have confirmed that filming is set to begin later this year at Pinewood Studios, with several returning cast members alongside exciting new additions to the galaxy far, far away. The budget is reportedly significantly higher than the first season, reflecting Disney+'s commitment to the show.</p><p>Fans can expect more lightsaber duels, Force mysteries, and the political intrigue that made the first season a hit with hardcore lore enthusiasts. The identity of the mysterious Sith master remains the central mystery heading into the new season.</p><h2>Cast and Characters</h2><p>While Lucasfilm has not officially confirmed the full cast, several actors from Season 1 are expected to return. New characters from deep in High Republic lore have been rumored, potentially tying the series more closely to the novels and comics.</p><p>The show takes place roughly 100 years before the prequel trilogy, giving the creative team enormous freedom to explore corners of Star Wars mythology that have never been depicted on screen.</p>`,
    category: 'star-wars',
    featured: true,
    premium: false,
    featuredImage: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=1200&h=630&fit=crop',
    views: 47832,
    tags: ['Star Wars', 'Disney+', 'The Acolyte', 'Streaming'],
  },
  {
    title: 'House of the Dragon Season 3: Full Cast, Release Date & Story Details',
    excerpt: 'The Dance of the Dragons rages on. Everything confirmed about HBO\'s most anticipated return.',
    content: `<p>HBO's House of the Dragon continues to dominate streaming conversations. After the jaw-dropping Season 2 finale, fans have been hungry for any information about what comes next in the Targaryen civil war.</p><h2>Release Window</h2><p>HBO has officially confirmed that Season 3 is in production, with a targeted release in late 2025. Filming has been underway in the UK, with additional location shoots planned in Spain and Croatia to capture the wider scope of the war spreading across the Seven Kingdoms.</p><h2>Story Details</h2><p>Season 3 will adapt a particularly bloody period of the Dance of the Dragons, including several major battles that book readers have been anticipating since the show was first announced. The season is expected to feature more dragon-on-dragon combat than any previous season.</p><p>Showrunner Ryan Condal has confirmed that the season will be eight episodes, consistent with Season 2's format. Each episode reportedly has a larger budget to accommodate the expanded scale of the conflict.</p>`,
    category: 'game-of-thrones',
    featured: true,
    premium: false,
    featuredImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=630&fit=crop',
    views: 62104,
    tags: ['House of the Dragon', 'HBO', 'Game of Thrones', 'Fantasy'],
  },
  {
    title: 'Claude 4 vs GPT-5: The Most Comprehensive AI Benchmark Comparison Yet',
    excerpt: 'We ran 200+ tests across coding, reasoning, creativity and safety. Here\'s what we found.',
    content: `<p>The AI wars have never been more competitive. Anthropic's Claude 4 and OpenAI's GPT-5 represent the absolute cutting edge of what large language models can do in 2025, but which one should you actually use for your work?</p><h2>Coding Performance</h2><p>We tested both models on 50 real-world coding challenges ranging from simple algorithmic problems to complex multi-file refactoring tasks. Claude 4 demonstrated superior understanding of large codebases and produced cleaner, more maintainable code in 60% of cases. GPT-5 was faster on simple algorithmic puzzles but struggled more with context retention in very long files.</p><h2>Reasoning and Logic</h2><p>On mathematical reasoning benchmarks, GPT-5 edged out Claude 4 by a slim margin. However, Claude 4's reasoning traces were consistently more transparent and easier to audit — a significant advantage for enterprise use cases where explainability matters.</p><h2>Creative Writing</h2><p>Both models excel at creative tasks, but in distinctly different ways. Claude 4 produced more nuanced, character-driven narratives, while GPT-5 showed strengths in plot structure and genre convention adherence. Neither model dominates in this category.</p><h2>Safety and Reliability</h2><p>Anthropic's Constitutional AI approach shows clear dividends here. Claude 4 refused harmful requests more consistently and was less susceptible to jailbreaking attempts. For enterprise deployments where reliability is paramount, this is a significant differentiator.</p>`,
    category: 'ai',
    featured: false,
    premium: true,
    featuredImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=630&fit=crop',
    views: 89234,
    tags: ['AI', 'Claude', 'GPT-5', 'Benchmark', 'Anthropic', 'OpenAI'],
  },
  {
    title: "Taylor Swift's Record-Breaking Eras Tour: The Final Numbers Are Staggering",
    excerpt: 'The tour grossed over $2 billion. We break down every record broken and what it means for the music industry.',
    content: `<p>Taylor Swift's Eras Tour has officially entered the history books as the highest-grossing concert tour of all time, by a margin that industry analysts are still struggling to fully comprehend. The final tally — over $2 billion in gross revenue — more than doubles the previous record.</p><h2>By the Numbers</h2><p>The tour visited 5 continents, 20 countries, and 149 cities. Attendance exceeded 10 million fans across 149 shows. The economic impact on host cities was enormous — economists estimate cities like Chicago and New Orleans saw $100M+ in local economic activity during Swift's multi-night stands.</p><h2>Industry Impact</h2><p>The tour demonstrated the continued power of live music as a revenue driver in an era when streaming has compressed recorded music margins. Multiple arenas reported the highest single-event revenues in their histories. Merchandise alone reportedly generated over $200 million.</p><p>The tour also demonstrated new possibilities for fan engagement, with Swift's team pioneering innovative VIP packages, city-specific merchandise, and surprise song performances that kept attendance and fan engagement at fever pitch throughout the multi-year run.</p>`,
    category: 'taylor-swift',
    featured: true,
    premium: false,
    featuredImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=630&fit=crop',
    views: 134521,
    tags: ['Taylor Swift', 'Eras Tour', 'Music', 'Concert'],
  },
  {
    title: 'The Rings of Power Season 3: Sauron\'s Full Rise Begins in Earnest',
    excerpt: "Amazon's epic Tolkien series enters its most ambitious chapter yet with production underway in New Zealand.",
    content: `<p>After two seasons of meticulous worldbuilding and layered mystery, The Lord of the Rings: The Rings of Power is ready to fully embrace its greatest villain. Season 3 will mark the moment Sauron steps fully out of shadow and begins his campaign to dominate Middle-earth.</p><h2>Production Update</h2><p>Filming is underway in New Zealand, with the production returning to the country after the first two seasons were shot in the UK. Production designer Ramsey Avery has teased that the scope of this season dwarfs anything the show has attempted before, particularly in depicting Númenor at the height of its power and glory before the island kingdom's corruption and eventual downfall.</p><h2>Story Direction</h2><p>Multiple sources confirm that Season 3 will draw heavily from the Akallabêth section of the Silmarillion, depicting Sauron's seduction of the Númenórean kings and the forging of the One Ring. Fans of the deeper Tolkien lore have been waiting since the show was announced for this chapter of the Second Age to be depicted on screen.</p>`,
    category: 'lord-of-the-rings',
    featured: false,
    premium: false,
    featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop',
    views: 28943,
    tags: ['Lord of the Rings', 'Amazon', 'Rings of Power', 'Fantasy', 'Tolkien'],
  },
  {
    title: "DeepSeek R2 Just Upended Silicon Valley's AI Assumptions — Again",
    excerpt: "The Chinese AI lab's latest model matches frontier performance at a fraction of the cost. Here's why that matters.",
    content: `<p>DeepSeek has done it again. The Chinese AI research lab has released R2, a model that independent benchmarks suggest rivals the performance of the most expensive Western frontier models, at a reported training cost that is orders of magnitude lower than comparable US models.</p><h2>The Technical Achievement</h2><p>R2 introduces several novel architectural innovations that dramatically improve compute efficiency. The model uses a mixture-of-experts approach combined with new attention mechanisms that reduce memory bandwidth requirements significantly. The result is a model that can run on considerably less hardware than comparable models from OpenAI or Anthropic.</p><h2>Market Reaction</h2><p>As with DeepSeek's previous releases, the announcement sent immediate shockwaves through tech stocks. NVIDIA shares dropped sharply as investors questioned assumptions about the compute requirements for frontier AI. The reaction reflects broader uncertainty about whether the AI industry's capital expenditure boom is justified.</p><h2>What It Means</h2><p>For enterprises considering AI deployments, R2 represents a potentially significant cost reduction opportunity. For US AI labs, it raises uncomfortable questions about whether the billions being spent on GPU clusters represent durable competitive advantages or simply an expensive head start that can be replicated for far less.</p>`,
    category: 'deepseek',
    featured: false,
    premium: false,
    featuredImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=630&fit=crop',
    views: 71203,
    tags: ['DeepSeek', 'AI', 'China', 'LLM'],
  },
  {
    title: "Eminem's 12th Studio Album: Every Confirmed Detail",
    excerpt: "Slim Shady has been building toward something. Here's everything we know about Marshall Mathers' next chapter.",
    content: `<p>Marshal Mathers has never been one for subtlety, but his approach to promoting new music has become increasingly cryptic in recent years. The Detroit rapper's social media activity has been pointing toward a major announcement, and the evidence trail is becoming impossible to ignore.</p><h2>What We Know</h2><p>Multiple collaborators have spoken in general terms about working on something new with Eminem, though all have been careful to avoid confirming specific details. Dr. Dre has been spotted at Eminem's recording facility in Michigan on multiple occasions this year, fueling speculation about another major collaborative project.</p><h2>Creative Direction</h2><p>Sources close to the project describe it as more introspective than recent releases, with Eminem apparently mining deeper autobiographical territory than he has since Recovery. The album allegedly grapples with legacy, mortality, and what it means to still be relevant in a hip-hop landscape dominated by artists who grew up listening to Slim Shady.</p>`,
    category: 'eminem',
    featured: false,
    premium: false,
    featuredImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=630&fit=crop',
    views: 43876,
    tags: ['Eminem', 'Hip Hop', 'Music', 'Album'],
  },
  {
    title: 'Grok 3 vs Claude 3.7: xAI Takes Its Most Serious Shot at Anthropic',
    excerpt: "Elon Musk's AI company is closing the gap. Our full benchmark breakdown across 15 task categories.",
    content: `<p>xAI's Grok 3 arrived with an enormous marketing push and bold claims about its capabilities. We spent two weeks running it through comprehensive evaluations against Anthropic's Claude 3.7 Sonnet to see whether the product can back up the hype.</p><h2>The Results</h2><p>The honest answer is: it depends heavily on the task. Grok 3 shows genuine, substantial improvements over Grok 2 and carves out real advantages in certain domains — particularly real-time information retrieval (thanks to X integration), multimodal tasks involving charts and graphs, and casual conversational tasks where its personality-forward approach resonates with users.</p><h2>Where Claude Still Leads</h2><p>Claude 3.7 maintains clear advantages in long-context reasoning, code quality in complex projects, instruction following, and what Anthropic calls "Claude's character" — the consistent, principled approach to sensitive topics that enterprise customers particularly value.</p>`,
    category: 'xai',
    featured: false,
    premium: false,
    featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=630&fit=crop',
    views: 56712,
    tags: ['xAI', 'Grok', 'Claude', 'AI', 'Benchmark'],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Categories
  await db.category.deleteMany();
  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const c = await db.category.create({ data: cat });
    catMap[cat.slug] = c.id;
  }
  console.log(`✅ ${categories.length} categories created`);

  // Admin user
  await db.user.deleteMany();
  const admin = await db.user.create({
    data: {
      email: 'meastream52@gmail.com',
      name: 'Admin',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created: meastream52@gmail.com / Admin123!`);

  // Tags
  await db.tag.deleteMany();
  const allTagNames = [...new Set(posts.flatMap((p) => p.tags))];
  const tagMap: Record<string, string> = {};
  for (const name of allTagNames) {
    const t = await db.tag.create({ data: { name } });
    tagMap[name] = t.id;
  }

  // Posts
  await db.post.deleteMany();
  for (const post of posts) {
    const catId = catMap[post.category];
    if (!catId) continue;
    await db.post.create({
      data: {
        title: post.title,
        slug: slugify(post.title, { lower: true, strict: true }),
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        categoryId: catId,
        authorId: admin.id,
        published: true,
        featured: post.featured,
        premium: post.premium,
        views: post.views,
        tags: { connect: post.tags.map((name) => ({ id: tagMap[name] })).filter(Boolean) },
      },
    });
  }
  console.log(`✅ ${posts.length} posts created`);
  console.log('\n🎉 Done!');
}

main().catch(console.error).finally(() => db.$disconnect());
