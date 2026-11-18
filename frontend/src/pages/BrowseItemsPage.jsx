import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';
import Pagination from '../components/Pagination';
import {
  FiSearch,
  FiFilter,
  FiX,
  FiRotateCcw,
  FiCalendar,
  FiMapPin,
  FiTag,
  FiCheckCircle,
} from 'react-icons/fi';

const CATEGORIES = [
  'All',
  'Electronics',
  'Mobile Phones',
  'Wallets',
  'Documents',
  'Bags',
  'Books',
  'Clothing',
  'Jewellery',
  'Keys',
  'Other',
];

const BrowseItemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Local filter states synced with URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [itemType, setItemType] = useState(searchParams.get('item_type') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created_at');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state when URL params change externally
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setItemType(searchParams.get('item_type') || '');
    setCategory(searchParams.get('category') || '');
    setLocation(searchParams.get('location') || '');
    setStatus(searchParams.get('status') || '');
    setDateFrom(searchParams.get('date_from') || '');
    setDateTo(searchParams.get('date_to') || '');
    setOrdering(searchParams.get('ordering') || '-created_at');
    setPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  // Fetch items from backend API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (itemType && itemType !== 'all') params.append('item_type', itemType);
      if (category && category !== 'All') params.append('category', category);
      if (location) params.append('location', location);
      if (status && status !== 'all') params.append('status', status);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (ordering) params.append('ordering', ordering);
      params.append('page', page.toString());

      const res = await api.get(`/api/items/?${params.toString()}`);
      setItems(res.data.results || []);
      setTotalCount(res.data.count || 0);
    } catch (err) {
      console.error('Error fetching items:', err);
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, itemType, category, location, status, dateFrom, dateTo, ordering, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Update URL search parameters
  const updateUrlParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        updated.set(key, value);
      } else {
        updated.delete(key);
      }
    });
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateUrlParams({ search, page: '1' });
  };

  const handleTypeChange = (typeVal) => {
    setItemType(typeVal);
    setPage(1);
    updateUrlParams({ item_type: typeVal === 'all' ? '' : typeVal, page: '1' });
  };

  const handleCategoryChange = (catVal) => {
    setCategory(catVal);
    setPage(1);
    updateUrlParams({ category: catVal === 'All' ? '' : catVal, page: '1' });
  };

  const handleResetFilters = () => {
    setSearch('');
    setItemType('');
    setCategory('');
    setLocation('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setOrdering('-created_at');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    search || itemType || (category && category !== 'All') || location || status || dateFrom || dateTo
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Reported Items
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Search and filter through all verified lost and found reports.
        </p>
      </div>

      {/* Main Layout: Filters Sidebar + Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP FILTERS SIDEBAR */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <FiFilter className="w-4 h-4 text-blue-600" />
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <FiRotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Item Type
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleTypeChange('all')}
                  className={`py-1.5 rounded-lg transition-all ${
                    !itemType || itemType === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('lost')}
                  className={`py-1.5 rounded-lg transition-all ${
                    itemType === 'lost'
                      ? 'bg-rose-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lost
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('found')}
                  className={`py-1.5 rounded-lg transition-all ${
                    itemType === 'found'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Found
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Category
              </label>
              <select
                value={category || 'All'}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Item Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                  updateUrlParams({ status: e.target.value, page: '1' });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All Statuses</option>
                <option value="active">Active (Open)</option>
                <option value="claimed">Claimed (In Progress)</option>
                <option value="resolved">Resolved (Returned)</option>
              </select>
            </div>

            {/* Location Substring Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Location
              </label>
              <div className="relative">
                <FiMapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onBlur={() => {
                    setPage(1);
                    updateUrlParams({ location, page: '1' });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setPage(1);
                      updateUrlParams({ location, page: '1' });
                    }
                  }}
                  placeholder="Filter by building / city"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] text-slate-400">From:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                      updateUrlParams({ date_from: e.target.value, page: '1' });
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">To:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                      updateUrlParams({ date_to: e.target.value, page: '1' });
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT COLUMN */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Search & Controls Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
              <FiSearch className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items by keyword, brand, color, location..."
                className="w-full pl-10 pr-20 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Sort & Mobile Filters Trigger */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                <FiFilter className="w-3.5 h-3.5 text-blue-600" />
                <span>Filters</span>
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={ordering}
                  onChange={(e) => {
                    setOrdering(e.target.value);
                    setPage(1);
                    updateUrlParams({ ordering: e.target.value, page: '1' });
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="-date_lost_or_found">Incident Date (Recent)</option>
                  <option value="date_lost_or_found">Incident Date (Earliest)</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Active Filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  Search: "{search}"
                  <button
                    onClick={() => {
                      setSearch('');
                      updateUrlParams({ search: '', page: '1' });
                    }}
                  >
                    <FiX className="w-3 h-3 hover:text-blue-900" />
                  </button>
                </span>
              )}
              {itemType && itemType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  Type: {itemType.toUpperCase()}
                  <button
                    onClick={() => {
                      setItemType('');
                      updateUrlParams({ item_type: '', page: '1' });
                    }}
                  >
                    <FiX className="w-3 h-3 hover:text-slate-900" />
                  </button>
                </span>
              )}
              {category && category !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  Category: {category}
                  <button
                    onClick={() => {
                      setCategory('');
                      updateUrlParams({ category: '', page: '1' });
                    }}
                  >
                    <FiX className="w-3 h-3 hover:text-slate-900" />
                  </button>
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  Location: {location}
                  <button
                    onClick={() => {
                      setLocation('');
                      updateUrlParams({ location: '', page: '1' });
                    }}
                  >
                    <FiX className="w-3 h-3 hover:text-slate-900" />
                  </button>
                </span>
              )}
              {status && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                  Status: {status}
                  <button
                    onClick={() => {
                      setStatus('');
                      updateUrlParams({ status: '', page: '1' });
                    }}
                  >
                    <FiX className="w-3 h-3 hover:text-slate-900" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 ml-1"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Items Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-2xl bg-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalCount={totalCount}
                pageSize={9}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  updateUrlParams({ page: newPage.toString() });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No items found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                We couldn't find any items matching your selected criteria. Try adjusting your search keywords, clear some filters, or report a new item.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear All Filters
                </button>
                <a
                  href="/report-lost"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Report Lost Belonging
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseItemsPage;
