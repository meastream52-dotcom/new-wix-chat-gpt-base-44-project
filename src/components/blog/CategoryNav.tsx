'use client';

import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface CategoryNavProps {
  categories: Category[];
  activeSlug?: string;
}

export default function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
      <Link
        href="/"
        className={`whitespace-nowrap text-sm font-bold px-4 py-2 rounded-full border transition-colors flex-shrink-0 ${
          !activeSlug
            ? 'bg-[#CC0000] border-[#CC0000] text-white'
            : 'border-gray-300 text-gray-700 hover:border-[#CC0000] hover:text-[#CC0000]'
        }`}
      >
        All
      </Link>
      {categories.map(cat => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className={`whitespace-nowrap text-sm font-bold px-4 py-2 rounded-full border transition-colors flex-shrink-0 ${
            activeSlug === cat.slug
              ? 'text-white border-transparent'
              : 'border-gray-300 text-gray-700 hover:border-current'
          }`}
          style={
            activeSlug === cat.slug
              ? { backgroundColor: cat.color, borderColor: cat.color }
              : { '--hover-color': cat.color } as any
          }
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
