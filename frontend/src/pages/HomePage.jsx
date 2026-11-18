import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';
import {
  FiSearch,
  FiMapPin,
  FiArrowRight,
  FiCheckCircle,
  FiPlusCircle,
  FiShield,
  FiUsers,
  FiCompass,
  FiTag,
  FiAward,
} from 'react-icons/fi';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [stats, setStats] = useState({
    total_items: 8,
    total_lost: 4,
    total_found: 4,
    total_resolved: 1,
    total_active: 7,
  });
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // Load stats
        const statsRes = await api.get('/api/dashboard/stats/');
        if (statsRes.data?.platform) {
          setStats(statsRes.data.platform);
        }

        // Load recent lost items
        const lostRes = await api.get('/api/items/?item_type=lost&ordering=-created_at');
        setRecentLost(lostRes.data.results?.slice(0, 4) || []);

        // Load recent found items
        const foundRes = await api.get('/api/items/?item_type=found&ordering=-created_at');
        setRecentFound(foundRes.data.results?.slice(0, 4) || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (locationQuery.trim()) params.append('location', locationQuery.trim());
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Soft Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 right-10 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-indigo-200/25 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            The #1 Community Lost & Found Network
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Lost Something? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Let's Help You Find It.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Report lost belongings, list items you've found, and connect safely with people in your university, office, or local community.
          </p>

          {/* Search Box */}
          <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col sm:flex-row gap-2 sm:gap-3"
            >
              {/* Item Query */}
              <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-0 border-b sm:border-b-0 sm:border-r border-slate-100">
                <FiSearch className="w-5 h-5 text-blue-600 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for? (e.g. Wallet, AirPods, Keys)"
                  className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Location Query */}
              <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-0">
                <FiMapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Where? (e.g. Library, Hall 102, Metro)"
                  className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>Search</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Action Links under search */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/report-lost"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold border border-rose-200/80 transition-all shadow-xs"
              >
                <FiPlusCircle className="w-4 h-4 text-rose-600" />
                <span>I Lost Something</span>
              </Link>

              <Link
                to="/report-found"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold border border-emerald-200/80 transition-all shadow-xs"
              >
                <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                <span>I Found Something</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 relative z-10">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-900/10 border border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
                {stats.total_items || 0}+
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">
                Total Reported Items
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-rose-400">
                {stats.total_lost || 0}
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">
                Lost Belongs Reported
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-400">
                {stats.total_found || 0}
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">
                Found Items Safe
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-400">
                {stats.total_resolved || 0}
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">
                Successfully Reunited
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY LOST ITEMS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Urgent Reports
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recently Lost Belongings
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Have you spotted any of these missing items around campus or public spaces?
            </p>
          </div>
          <Link
            to="/browse?item_type=lost"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 group"
          >
            <span>View all lost items</span>
            <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : recentLost.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentLost.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
            <FiTag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No lost items reported recently.</p>
          </div>
        )}
      </section>

      {/* RECENTLY FOUND ITEMS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Recovered & Safe
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recently Found Items
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              These items were turned in by good samaritans. See if one of them is yours!
            </p>
          </div>
          <Link
            to="/browse?item_type=found"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 group"
          >
            <span>View all found items</span>
            <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : recentFound.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentFound.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
            <FiCheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No found items listed recently.</p>
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-slate-100/70 py-16 lg:py-24 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Simple & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              How Findr Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3">
              We make reporting, searching, and recovering misplaced items quick, secure, and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mb-5">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Report Belonging</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed flex-1">
                Lost an item or found someone's possession? Submit photos, location, date, and description in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-lg flex items-center justify-center mb-5">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Browse & Match</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed flex-1">
                Filter by category, specific dates, and exact campus buildings to quickly locate potential matches.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold text-lg flex items-center justify-center mb-5">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Claim with Proof</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed flex-1">
                Submit a claim with proof of ownership (serial number, distinctive marks) to verify identity safely.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-lg flex items-center justify-center mb-5">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Safely Reunited</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed flex-1">
                Once the owner accepts the claim, coordinate a safe handover in daylight or via public security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIENCE / COMMUNITY USE CASES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Built for Everyone
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Where Findr Makes an Impact
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <FiCompass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Colleges & Universities</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Help students and faculty recover student IDs, textbooks, laptops, earbuds, and gym bags left in lecture halls and dining plazas.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FiUsers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Workplaces & Offices</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Streamline lost office keys, badges, chargers, and headphones across corporate buildings, co-working spaces, and cafeterias.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FiShield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Public Transit & Venues</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Enable libraries, community parks, metro stations, and gyms to maintain an organized, searchable catalog of misplaced items.
            </p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-blue-500/15 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Found an item that doesn't belong to you?
            </h3>
            <p className="mt-3 text-blue-100 text-sm sm:text-base leading-relaxed">
              A fellow student, colleague or neighbor is likely searching for it right now. Take 60 seconds to report it and brighten their day.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/report-found"
              className="px-6 py-3.5 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-md transition-all"
            >
              Report Found Item
            </Link>
            <Link
              to="/browse"
              className="px-6 py-3.5 rounded-2xl bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              Browse All Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
