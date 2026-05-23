import ArticleCard from './ArticleCard';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  views: number;
  
  createdAt: Date | string;
  category: {
    name: string;
    slug: string;
    color: string;
  };
  author: {
    name: string;
    image?: string | null;
  };
}

interface ArticleGridProps {
  posts: Post[];
  columns?: 2 | 3 | 4;
  size?: 'default' | 'large' | 'small';
}

export default function ArticleGrid({ posts, columns = 3, size = 'default' }: ArticleGridProps) {
  const colClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No articles found.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} gap-6`}>
      {posts.map(post => (
        <ArticleCard key={post.id} post={post} size={size} />
      ))}
    </div>
  );
}
