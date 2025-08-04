import React from 'react';

import { Shield, Star, Share2, Bookmark } from 'lucide-react';

interface ContentCardProps {
  title: string;
  description: string;
  badge: {
    label: string;
    variant?: 'default' | 'warning';
  };
  rating: {
    value: string;
    showIcon?: boolean;
  };
  onShare?: () => void;
  onBookmark?: () => void;
  className?: string;
}

export function ContentCard({
  title,
  description,
  badge,
  rating,
  onShare,
  onBookmark,
  className = '',
}: ContentCardProps) {
  return (
    <div className={`
      flex flex-col w-full max-w-[547px] 
      bg-white border border-gray-200 rounded-2xl
      font-['Poppins'] text-base leading-6 text-black
      ${className}
    `}>
      {/* Header Content */}
      <div className="flex-1 p-4 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium leading-5 text-gray-700 m-0">
            {title}
          </h3>
          <p className="text-xs leading-4 font-normal text-gray-500 m-0">
            {description}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left Section - Badge and Rating */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Badge */}
            <span className="
              flex items-center gap-1
              bg-orange-50 text-orange-600
              text-xs leading-4 rounded-full
              px-2 py-1
            ">
              <span className="text-[10px] font-medium whitespace-nowrap">
                {badge.label}
              </span>
              <div className="flex items-center">
                <Shield className="h-3 w-3 text-orange-600" />
              </div>
            </span>

            {/* Divider */}
            <hr className="h-4 border-l border-gray-200 border-t-0 border-r-0 border-b-0" />

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {rating.showIcon !== false && <Star className="h-3 w-3 fill-yellow-400 text-yellow-600" />}
                <span className="text-xs leading-4 font-medium text-yellow-600">
                  {rating.value}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onShare}
              className="
                flex items-center justify-center
                h-7 w-7 p-1.5
                bg-transparent border-0 rounded
                cursor-pointer gap-2
                transition-all duration-200 ease-in-out
                hover:bg-gray-50
              "
              type="button"
            >
              <Share2 className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={onBookmark}
              className="
                flex items-center justify-center
                h-7 w-7 p-1.5
                bg-transparent border-0 rounded
                cursor-pointer gap-2
                transition-all duration-200 ease-in-out
                hover:bg-gray-50
              "
              type="button"
            >
              <Bookmark className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentCard;