import React from 'react';

export const ItemTypeBadge = ({ type }) => {
  const isLost = type?.toLowerCase() === 'lost';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
        isLost
          ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
          : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isLost ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
      {isLost ? 'Lost Item' : 'Found Item'}
    </span>
  );
};

export const ItemStatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  let styles = 'bg-slate-100 text-slate-700 ring-slate-500/20';

  if (s === 'active') {
    styles = 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
  } else if (s === 'claimed') {
    styles = 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
  } else if (s === 'resolved') {
    styles = 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${styles}`}>
      {status || 'Active'}
    </span>
  );
};

export const ClaimStatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  let styles = 'bg-slate-100 text-slate-700';

  if (s === 'pending') {
    styles = 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/30';
  } else if (s === 'accepted') {
    styles = 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30';
  } else if (s === 'rejected') {
    styles = 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles}`}>
      {status || 'Pending'}
    </span>
  );
};
