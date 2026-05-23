interface AdBannerProps {
  placement: string;
  code?: string;
  className?: string;
}

export default function AdBanner({ placement, code, className = '' }: AdBannerProps) {
  if (code) {
    return (
      <div className={`my-6 ${className}`}>
        <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-1 font-medium">Advertisement</p>
        <div
          className="w-full"
          dangerouslySetInnerHTML={{ __html: code }}
        />
      </div>
    );
  }

  // Placeholder ad
  const sizes: Record<string, { w: string; h: string; label: string }> = {
    'leaderboard': { w: 'max-w-3xl', h: 'h-24', label: '728×90 Leaderboard' },
    'rectangle': { w: 'max-w-sm', h: 'h-64', label: '300×250 Rectangle' },
    'banner': { w: 'max-w-2xl', h: 'h-16', label: '468×60 Banner' },
    'sidebar': { w: 'w-full', h: 'h-64', label: '300×250 Sidebar' },
    'in-article': { w: 'max-w-xl', h: 'h-24', label: '468×60 In-Article' },
  };

  const config = sizes[placement] || { w: 'max-w-2xl', h: 'h-24', label: 'Advertisement' };

  return (
    <div className={`my-6 flex flex-col items-center ${className}`}>
      <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-1 font-medium">Advertisement</p>
      <div className={`${config.w} ${config.h} w-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center rounded`}>
        <div className="text-center">
          <p className="text-gray-400 text-xs font-medium">{config.label}</p>
          <p className="text-gray-300 text-xs mt-0.5">Google AdSense</p>
        </div>
      </div>
    </div>
  );
}
