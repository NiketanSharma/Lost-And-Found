import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiHeart, FiShield, FiHelpCircle, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <FiSearch className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Findr<span className="text-blue-500">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The modern, community-driven Lost and Found web platform connecting people with their missing belongings across campuses, workplaces, and public venues.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <FiShield className="w-4 h-4 text-emerald-400" />
                Verified Community
              </span>
              <span className="flex items-center gap-1.5">
                <FiHelpCircle className="w-4 h-4 text-blue-400" />
                24/7 Access
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/browse?item_type=lost" className="hover:text-white transition-colors">
                  Lost Items
                </Link>
              </li>
              <li>
                <Link to="/browse?item_type=found" className="hover:text-white transition-colors">
                  Found Items
                </Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-white transition-colors">
                  Browse All
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-white transition-colors">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-white transition-colors">
                  Report a Found Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/browse?category=Electronics" className="hover:text-white transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Wallets" className="hover:text-white transition-colors">
                  Wallets & IDs
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Mobile Phones" className="hover:text-white transition-colors">
                  Mobile Phones
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Keys" className="hover:text-white transition-colors">
                  Keys & Badges
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Bags" className="hover:text-white transition-colors">
                  Bags & Backpacks
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Findr
                </Link>
              </li>
              <li>
                <Link to="/about#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about#faq" className="hover:text-white transition-colors">
                  FAQ & Safety
                </Link>
              </li>
              <li>
                <a href="mailto:support@lostandfound.com" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5" />
                  <span>Contact Support</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Findr Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with care for communities everywhere <FiHeart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
