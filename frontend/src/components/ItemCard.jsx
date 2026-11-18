import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiArrowRight, FiTag } from 'react-icons/fi';
import { ItemTypeBadge, ItemStatusBadge } from './StatusBadge';

const ItemCard = ({ item }) => {
  // Normalize image url if coming from local Django or Cloudinary
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    // Relative local media path
    const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    return `${backendUrl}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const imageUrl = getImageUrl(item.image);

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Header with Badge Overlay */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback pattern when no image or image fails to load */}
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 ${
            imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <FiTag className="w-12 h-12 stroke-1 text-slate-300 mb-1" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.category}</span>
        </div>

        {/* Badge overlays */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <ItemTypeBadge type={item.item_type} />
        </div>

        <div className="absolute top-3 right-3 z-10">
          <ItemStatusBadge status={item.status} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category Pill */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-2">
          <span>{item.category}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Metadata: Location & Date */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <FiMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{formatDate(item.date_lost_or_found)}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-2">
          <Link
            to={`/items/${item.id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white font-medium text-sm transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white"
          >
            <span>View Details</span>
            <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
