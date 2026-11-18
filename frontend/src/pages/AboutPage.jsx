import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShield,
  FiSearch,
  FiUsers,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiMapPin,
  FiHeart,
  FiAward,
} from 'react-icons/fi';

const FAQS = [
  {
    q: 'How does the claim verification process work?',
    a: 'When an individual claims a found item, they submit a claim request explaining where and when they lost it, along with unique identifying proof (e.g., serial numbers, screen locks, distinguishing scratches, or internal contents). The finder reviews this evidence and can safely accept or reject the claim.',
  },
  {
    q: 'Is Findr completely free to use?',
    a: 'Yes! Findr is 100% free for colleges, universities, community organizations, and public transit hubs to help reunite people with their belongings.',
  },
  {
    q: 'How do you prevent fraudulent or false claims?',
    a: 'We encourage finders to conceal at least one distinct detail from the public description. When a claimant submits a request, they must provide verifiable ownership proofs that only the real owner would know. Item statuses are only marked resolved once physical handover is confirmed.',
  },
  {
    q: 'What is the recommended protocol for meeting to return an item?',
    a: 'Always meet in daylight in a crowded, well-lit public space, such as a campus student center, university library front desk, or security office. Never share banking information or wire money as a reward.',
  },
  {
    q: 'Can organizations or campuses manage their own lost and found desk?',
    a: 'Absolutely. Campus staff or facilities managers can create staff accounts and log in to the administrative panel to manage hundreds of items with audit logs and resolution statistics.',
  },
];

const AboutPage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* Hero / Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          <FiHeart className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          Our Mission
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Reconnecting People with What Matters Most
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Every day, thousands of essential items—wallets, IDs, keys, headphones, and family heirlooms—are accidentally left behind on campuses, trains, and workplaces. Findr provides a modern, transparent digital hub to bridge the gap between finders and owners.
        </p>
      </section>

      {/* Target Communities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Tailored Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Who Benefits From Findr?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-4">
              🎓
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">College Students</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Quickly retrieve misplaced laptops, lecture notes, lab goggles, water bottles, and residence hall keys without stress.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl mb-4">
              🏛️
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Universities</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Centralize lost and found logs across library desks, sports arenas, student centers, and security desks into one unified database.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4">
              🏢
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Corporate Offices</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Safely manage lost employee badges, charging cables, adapters, and office accessories across multi-floor business campuses.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl mb-4">
              🚆
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Public Spaces</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Provide transit stations, parks, libraries, and airports a reliable public lookup board to reduce lost property disposal.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 rounded-none lg:rounded-3xl max-w-7xl mx-auto px-6 sm:px-12">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Our Standards
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Security, Privacy & Trust
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            We prioritize user safety and sensitive data protection across every layer of the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <FiShield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base">Privacy by Default</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Personal contact channels remain protected until an authorized claim is reviewed by the owner.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base">Two-Sided Verification</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No item is marked resolved without explicit confirmation from the original reporter.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <FiUsers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base">Community Moderation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Administrators have full visibility into listings, spam flags, and resolution timelines.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-5 text-left font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <FiChevronUp className="w-5 h-5 text-blue-600 shrink-0" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact / Help Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 rounded-3xl bg-blue-50/70 border border-blue-100 space-y-3">
          <h3 className="text-xl font-bold text-slate-900">Need More Assistance?</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Have questions regarding partnership, school integration, or a suspicious listing? Contact our administrative team directly.
          </p>
          <a
            href="mailto:support@lostandfound.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <FiMail className="w-4 h-4" />
            <span>Contact Support Desk</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
