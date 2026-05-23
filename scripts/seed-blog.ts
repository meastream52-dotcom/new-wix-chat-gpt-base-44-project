import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const db = new PrismaClient();

const categories = [
  { name: 'Movies', slug: 'movies', color: '#E51C23', sortOrder: 1 },
  { name: 'TV', slug: 'tv', color: '#E51C23', sortOrder: 2 },
  { name: 'Gaming', slug: 'gaming', color: '#E51C23', sortOrder: 3 },
  { name: 'Comics', slug: 'comics', color: '#E51C23', sortOrder: 4 },
  { name: 'Star Wars', slug: 'star-wars', color: '#FFE81F', sortOrder: 5 },
  { name: 'Lord of the Rings', slug: 'lord-of-the-rings', color: '#C0A060', sortOrder: 6 },
  { name: 'Game of Thrones', slug: 'game-of-thrones', color: '#8B0000', sortOrder: 7 },
  { name: 'AI', slug: 'ai', color: '#4FC3F7', sortOrder: 8 },
  { name: 'Anthropic', slug: 'anthropic', color: '#6C5CE7', sortOrder: 9 },
  { name: 'OpenAI', slug: 'openai', color: '#00A67E', sortOrder: 10 },
  { name: 'xAI', slug: 'xai', color: '#1DA1F2', sortOrder: 11 },
  { name: 'DeepSeek', slug: 'deepseek', color: '#FF6B35', sortOrder: 12 },
  { name: 'Country Music', slug: 'country-music', color: '#8B4513', sortOrder: 13 },
  { name: 'Eminem', slug: 'eminem', color: '#333333', sortOrder: 14 },
  { name: 'Taylor Swift', slug: 'taylor-swift', color: '#C71585', sortOrder: 15 },
  { name: 'Sports', slug: 'sports', color: '#228B22', sortOrder: 16 },
  { name: 'Celebrity News', slug: 'celebrity-news', color: '#FF69B4', sortOrder: 17 },
  { name: 'Hollywood', slug: 'hollywood', color: '#DAA520', sortOrder: 18 },
];

async function main() {
  console.log('Seeding blog...');

  // Create categories
  await db.blogCategory.deleteMany();
  const createdCats: Record<string, any> = {};
  for (const cat of categories) {
    const c = await db.blogCategory.create({ data: cat });
    createdCats[cat.slug] = c;
  }

  // Create admin user
  await db.blogUser.deleteMany();
  const admin = await db.blogUser.create({
    data: {
      email: 'meastream52@gmail.com',
      name: 'Admin',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'ADMIN',
    },
  });

  // Sample posts
  const posts = [
    {
      title: 'Star Wars: The Acolyte Season 2 — Everything We Know',
      excerpt: 'Lucasfilm has been tight-lipped, but here\'s every confirmed detail about the next chapter of The Acolyte.',
      content: `<p>The High Republic era continues to captivate Star Wars fans worldwide. After the events of Season 1, showrunner Leslye Headland has teased exciting new directions for the series.</p><p>Sources close to production have confirmed that filming is set to begin later this year, with several returning cast members alongside exciting new additions to the galaxy far, far away.</p><h2>What We Know So Far</h2><p>The Acolyte introduced audiences to the High Republic era some 100 years before the Skywalker Saga. Season 2 promises to dig even deeper into the mystery of the Sith's return.</p><p>Fans can expect more lightsaber duels, Force mysteries, and the political intrigue that made the first season a hit with hardcore lore enthusiasts.</p><h2>New Cast Members</h2><p>Rumors suggest several major characters from the High Republic novels could make their live-action debut, exciting fans who have followed the expanded universe closely. The casting choices will be crucial to the show's reception.</p><p>Production is expected to wrap by end of year, with a streaming release potentially in the first half of next year.</p>`,
      categorySlug: 'star-wars',
      featured: true,
      featuredImage: 'https://picsum.photos/seed/starwars1/1200/630',
      tags: ['star wars', 'the acolyte', 'disney+', 'high republic'],
    },
    {
      title: 'House of the Dragon Season 3: Cast, Story, and Release Date',
      excerpt: 'The Dance of the Dragons rages on. Here\'s everything confirmed for the third season of HBO\'s Game of Thrones prequel.',
      content: `<p>HBO's House of the Dragon continues to be one of the most-watched shows on television. After the shocking finale of Season 2, fans are hungry for more of the Targaryen civil war.</p><p>Production is underway in the UK and Wales, with dragon sequences being filmed at secret locations to avoid spoilers leaking online.</p><h2>New Cast Members</h2><p>Several new Targaryen cousins and Lannister lords will be introduced this season as the war spreads across the Seven Kingdoms. The showrunners have confirmed that this season will be even more epic in scope than the previous two.</p><h2>Story Details</h2><p>The Dance of the Dragons will escalate dramatically in Season 3, with the Battle of the Gullet serving as a centrepiece event. Fans of George R.R. Martin's Fire & Blood novel know this as one of the most devastating moments in Targaryen history.</p><p>Emma D'Arcy and Olivia Cooke continue their riveting performances as Rhaenyra and Alicent, with their conflict finally reaching its inevitable conclusion.</p>`,
      categorySlug: 'game-of-thrones',
      featured: true,
      featuredImage: 'https://picsum.photos/seed/got1/1200/630',
      tags: ['house of the dragon', 'hbo', 'game of thrones', 'fantasy'],
    },
    {
      title: 'Claude 4 vs GPT-5: Which AI Model is Actually Better?',
      excerpt: 'We put the two most powerful AI models head-to-head across coding, reasoning, creativity, and more.',
      content: `<p>The AI wars have never been more competitive. Anthropic's Claude 4 and OpenAI's GPT-5 represent the cutting edge of large language model technology, but which one should you actually use?</p><p>We ran dozens of benchmarks and real-world tests to give you a definitive answer — or at least the most comprehensive comparison available right now.</p><h2>Coding Performance</h2><p>Both models excel at code generation, but our tests showed significant differences in complex, multi-file projects. Claude 4 demonstrated superior understanding of large codebases, while GPT-5 showed stronger performance on quick algorithmic puzzles.</p><h2>Reasoning and Analysis</h2><p>For complex reasoning tasks, both models performed admirably. Claude 4 showed a preference for nuanced, multi-perspective analysis, while GPT-5 tended toward more decisive, direct conclusions.</p><h2>Creative Writing</h2><p>Creative tasks showed the most divergence. Claude 4 produced richer, more literary prose, while GPT-5 excelled at matching specific tones and styles requested by users.</p><p>Our overall verdict: for developers and researchers, Claude 4 edges ahead. For everyday productivity tasks, GPT-5 might feel more intuitive.</p>`,
      categorySlug: 'ai',
      featured: false,
      featuredImage: 'https://picsum.photos/seed/ai1/1200/630',
      tags: ['claude', 'gpt-5', 'anthropic', 'openai', 'benchmark'],
    },
    {
      title: "Taylor Swift's Eras Tour: The Final Numbers Are Mind-Blowing",
      excerpt: 'The record-breaking tour has officially concluded, and the financial and cultural impact is staggering.',
      content: `<p>Taylor Swift's Eras Tour has officially entered the history books. The tour grossed over $2 billion, becoming the highest-grossing concert tour of all time by a massive margin.</p><p>The cultural impact went far beyond the concert halls. Cities reported massive economic boosts whenever Swift came to town, with hotels, restaurants, and local businesses seeing unprecedented surges.</p><h2>The Numbers</h2><p>149 shows. 10+ million tickets sold. $2.077 billion in gross revenue. These numbers aren't just records — they shattered previous marks by hundreds of millions of dollars.</p><h2>Cultural Impact</h2><p>The "Swiftie economy" became a genuine economic phenomenon studied by universities and government agencies alike. The Federal Reserve even mentioned Taylor Swift in official economic reports — a first for any musical artist.</p><p>With the tour now wrapped, speculation is already turning to what comes next for the world's biggest pop star.</p>`,
      categorySlug: 'taylor-swift',
      featured: true,
      featuredImage: 'https://picsum.photos/seed/taylorswift1/1200/630',
      tags: ['taylor swift', 'eras tour', 'music', 'concert'],
    },
    {
      title: "The Rings of Power Season 3: Sauron's Full Rise Begins",
      excerpt: "Amazon's Lord of the Rings series is heading into its most ambitious season yet, with Sauron finally stepping into the light.",
      content: `<p>After two seasons of careful worldbuilding and mystery, The Rings of Power is ready to fully embrace its greatest villain. Sauron's rise to power during the Second Age of Middle-earth will take center stage in Season 3.</p><p>Production designer Ramsey Avery has promised sets unlike anything seen in Tolkien adaptations before, with Númenor at the height of its glory serving as a major backdrop.</p><h2>The Forging of the Rings</h2><p>The titular rings will finally be front and center in Season 3, with the forging of the rings of power serving as a major plot point. Fans of the books have been waiting anxiously for this storyline to develop fully.</p><h2>New Characters</h2><p>Several key figures from Tolkien's Second Age mythology will be introduced, including characters whose actions shaped Middle-earth for thousands of years. The showrunners have been careful to work within established Tolkien lore while crafting original narratives.</p>`,
      categorySlug: 'lord-of-the-rings',
      featured: false,
      featuredImage: 'https://picsum.photos/seed/lotr1/1200/630',
      tags: ['rings of power', 'amazon', 'tolkien', 'fantasy'],
    },
    {
      title: "Eminem's New Album: Everything Confirmed So Far",
      excerpt: "Slim Shady has been hinting at new music for months. Here's what we know about his upcoming project.",
      content: `<p>Marshal Mathers has been unusually active on social media lately, dropping cryptic hints about new music. Fans have been piecing together clues from his posts, and the picture is becoming clearer.</p><p>Collaborators have teased that this album represents a new creative direction for the rapper, while maintaining the aggressive lyricism that made him a legend.</p><h2>Confirmed Collaborations</h2><p>Several major names in hip-hop have been spotted entering Eminem's Michigan studio. While no official collaborations have been confirmed, fan speculation is running wild about potential features.</p><h2>Themes and Sound</h2><p>Sources close to the project describe a more introspective album compared to recent releases, with Eminem reportedly exploring themes of legacy, family, and the state of modern hip-hop.</p>`,
      categorySlug: 'eminem',
      featured: false,
      featuredImage: 'https://picsum.photos/seed/eminem1/1200/630',
      tags: ['eminem', 'hip hop', 'new album', 'music'],
    },
    {
      title: 'Grok 3 vs Claude 3.5: xAI Takes On Anthropic',
      excerpt: "Elon Musk's xAI has been making bold claims about Grok 3. We test whether it can really compete with Anthropic's best.",
      content: `<p>xAI's latest model, Grok 3, has been generating enormous buzz since Elon Musk announced it would be the "most powerful AI in the world." We put it through its paces against Anthropic's Claude 3.5 Sonnet to see if the hype is justified.</p><p>The results were surprising — Grok 3 shows genuine strengths in certain areas while Claude maintains dominance in others. Here's our full breakdown.</p><h2>Where Grok 3 Wins</h2><p>Real-time information access gives Grok 3 a significant edge for current events and news-related queries. Its integration with X (formerly Twitter) provides unique data access that no other model can match.</p><h2>Where Claude Wins</h2><p>For nuanced reasoning, safety-conscious responses, and long-context understanding, Claude 3.5 Sonnet remains the benchmark. Anthropic's Constitutional AI training shows in its more careful, considered outputs.</p>`,
      categorySlug: 'xai',
      featured: false,
      featuredImage: 'https://picsum.photos/seed/xai1/1200/630',
      tags: ['grok', 'xai', 'elon musk', 'ai comparison'],
    },
    {
      title: "DeepSeek R2: China's AI Giant Just Changed Everything",
      excerpt: 'The Chinese AI startup has released its most powerful model yet, sending shockwaves through Silicon Valley.',
      content: `<p>DeepSeek has done it again. The Chinese AI lab has released R2, a model that benchmarks suggest rivals GPT-4o at a fraction of the training cost. The AI community is once again scrambling to understand how they pulled it off.</p><p>The release caused significant movement in tech stocks as investors realized the implications: frontier AI development may not require the billions of dollars US companies have been spending.</p><h2>Technical Innovations</h2><p>DeepSeek's mixture-of-experts architecture and novel training techniques appear to deliver exceptional performance per dollar. The full technical paper has sent researchers into a frenzy of analysis and replication attempts.</p><h2>Geopolitical Implications</h2><p>The release has reignited debates about export controls on AI chips and the effectiveness of US policy aimed at slowing Chinese AI development. Several congresspeople have called for emergency briefings on national security implications.</p>`,
      categorySlug: 'deepseek',
      featured: false,
      featuredImage: 'https://picsum.photos/seed/deepseek1/1200/630',
      tags: ['deepseek', 'china', 'ai', 'silicon valley'],
    },
    {
      title: "Marvel's Phase 6: Every Confirmed Movie and Release Date",
      excerpt: "The Multiverse Saga is nearing its climax. Here's your complete guide to every confirmed Marvel film coming through 2027.",
      content: `<p>Marvel Studios has been slowly revealing the full shape of Phase 6, the concluding chapter of the Multiverse Saga. With Avengers: The Kang Dynasty and Avengers: Secret Wars as the bookends, the road there is packed with exciting solo adventures and team-ups.</p><h2>Confirmed Films</h2><p>Fantastic Four leads the charge as Marvel's most anticipated introduction of new characters in years. Pedro Pascal, Vanessa Kirby, Joseph Quinn, and Ebon Moss-Bachrach make up a cast that has fans buzzing.</p><h2>The Road to Secret Wars</h2><p>Each film in Phase 6 is carefully designed to add threads to the multiverse tapestry that Secret Wars will resolve. Marvel Studios President Kevin Feige has promised the most ambitious crossover event in cinema history.</p>`,
      categorySlug: 'movies',
      featured: false,
      featuredImage: 'https://picsum.photos/seed/marvel1/1200/630',
      tags: ['marvel', 'mcu', 'phase 6', 'avengers'],
    },
    {
      title: "Stranger Things Season 5: The Final Chapter's Release Date Revealed",
      excerpt: "Netflix has confirmed the premiere date for the final season of Stranger Things, and it's sooner than you think.",
      content: `<p>The wait is almost over. Netflix has officially confirmed the release date for Stranger Things Season 5, the final chapter of the beloved supernatural drama that put the streaming giant on the map.</p><p>The Duffer Brothers have been working on the final season for years, promising an ending worthy of the show's decade-long run.</p><h2>What to Expect</h2><p>The final season will resolve the overarching conflict with Vecna and the Upside Down that has been building since Season 4. The showrunners have promised emotional farewells for every character, and tissues will definitely be required.</p><h2>Production Notes</h2><p>Filming wrapped after multiple years of production, making this the longest production period for any Stranger Things season. The extra time has reportedly allowed for more ambitious visual effects and storytelling.</p>`,
      categorySlug: 'tv',
      featured: false,
      featuredImage: 'https://picsum.photos/seed/strangerthings1/1200/630',
      tags: ['stranger things', 'netflix', 'season 5', 'drama'],
    },
    {
      title: "GTA 6: Everything We Know About Rockstar's Next Masterpiece",
      excerpt: "Rockstar Games' most anticipated title is shaping up to be a generational leap. Here's the full breakdown.",
      content: `<p>Grand Theft Auto 6 is the most anticipated game in history — possibly the most anticipated entertainment product of any kind. Rockstar Games has been carefully building hype since the first trailer dropped, and the information we've gathered paints a picture of something truly extraordinary.</p><h2>Setting: Return to Vice City</h2><p>The game returns to the fictional Miami-inspired Vice City, now vastly expanded and updated to modern sensibilities. The map reportedly dwarfs GTA 5's already massive world.</p><h2>Protagonist</h2><p>For the first time in the mainline GTA series, players will control a female protagonist alongside a male counterpart in what's been described as a Bonnie and Clyde-style narrative.</p>`,
      categorySlug: 'gaming',
      featured: false,
      featuredImage: 'https://picsum.photos/seed/gta6/1200/630',
      tags: ['gta 6', 'rockstar games', 'gaming', 'vice city'],
    },
    {
      title: "Morgan Wallen's Comeback: Country Music's Most Controversial Return",
      excerpt: "After controversy and redemption, Morgan Wallen has become country music's biggest star. How did he pull it off?",
      content: `<p>Few stories in modern music are as complicated as Morgan Wallen's. The Tennessee native went from promising newcomer to country music's biggest name to cancelled artist and back to the top of the charts in just a few years.</p><p>His latest album broke records for country music, spending weeks at number one across multiple charts and earning praise from critics who had previously written him off.</p><h2>The Music Itself</h2><p>Whatever one thinks of Wallen personally, the quality of his musical output is hard to dispute. His blend of traditional country instrumentation with contemporary production values has struck a chord with an enormous audience.</p>`,
      categorySlug: 'country-music',
      featured: false,
      featuredImage: 'https://picsum.photos/seed/countrymusic1/1200/630',
      tags: ['morgan wallen', 'country music', 'comeback'],
    },
  ];

  await db.blogPost.deleteMany();
  for (const post of posts) {
    const cat = createdCats[post.categorySlug];
    if (!cat) continue;
    const slug = slugify(post.title, { lower: true, strict: true });
    await db.blogPost.create({
      data: {
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        categoryId: cat.id,
        authorId: admin.id,
        status: 'PUBLISHED',
        featured: post.featured,
        publishedAt: new Date(),
        tags: post.tags,
        views: Math.floor(Math.random() * 50000) + 1000,
      },
    });
  }

  console.log('Done! Admin login: meastream52@gmail.com / Admin123!');
}

main().catch(console.error).finally(() => db.$disconnect());
