import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import GetEventLogic from '../../Logic/EventsLogic/getEvents';
import Loading from '../../components/Loading';
import { MdComputer } from '../../components/icons';
import { resolveImage } from '../../lib/resolveImage';
import {
  IoBookmarkOutline,
  IoCalendarClearOutline,
  IoGlobeOutline,
  IoLanguageOutline,
  IoLinkOutline,
  IoLocationOutline,
  IoShareSocialOutline,
  IoTimerOutline
} from '../../components/icons';
import { shareLinks } from '../../static/shareLinks';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { eventService } from '../../services/events';
import RsvpLogic from '../../Logic/Explore/rsvp.logic';

function formatTime(date) {
  return (
    date?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) || ''
  );
}

function PersonAvatar({ person, className = 'w-10 h-10' }) {
  return person?.avatar ? (
    <img
      src={resolveImage(person.avatar)}
      alt=""
      className={`${className} rounded-full object-cover bg-stone-100 dark:bg-white/10`}
    />
  ) : (
    <div
      className={`${className} rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-stone-800 flex items-center justify-center text-sm font-bold shrink-0`}
    >
      {person?.name?.slice(0, 1)?.toUpperCase() || '?'}
    </div>
  );
}

function EventPage() {
  const { loading, error, events } = GetEventLogic();
  const { token, handleRSVP, adding, myRsvp } = RsvpLogic(events);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(search);
  const isInvitation = params.get('invited') === '1';
  const inviteToken = params.get('token');

  const invitationMutation = useMutation({
    mutationFn: async (action) => {
      const res =
        action === 'accept'
          ? await eventService.acceptInvitation(inviteToken)
          : await eventService.rejectInvitation(inviteToken);
      if (!res.ok) throw new Error(res.error || 'Could not update invitation');
      return action;
    },
    onSuccess: (action) => {
      toast.success(action === 'accept' ? 'Invitation accepted' : 'Invitation rejected');
      if (events?.id) queryClient.invalidateQueries({ queryKey: ['event', Number(events.id)] });
      queryClient.invalidateQueries({ queryKey: ['rsvps'] });
      navigate(pathname, { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });
  const responding = invitationMutation.isPending;

  const respondToInvitation = (action) => {
    if (!token) {
      toast.error('Please login to respond to this invitation');
      navigate(`/auth/login?redirect=${encodeURIComponent(pathname + search)}`);
      return;
    }
    if (!inviteToken) return toast.error('Invitation token is missing');
    invitationMutation.mutate(action);
  };

  if (loading || !events) return <Loading />;
  if (error)
    return (
      <div className="container py-16 text-center text-stone-500 dark:text-white/50">{error}</div>
    );

  const {
    title,
    description,
    medium,
    category,
    start_date,
    end_date,
    location_name,
    latitude,
    longitude,
    image,
    meet_link,
    meet_id,
    meet_password,
    tnc,
    language,
    duration,
    accepting_rsvp,
    host,
    going = [],
    going_count = 0
  } = events;

  const start = start_date
    ? new Date(typeof start_date === 'string' ? start_date.split('+')[0] : start_date)
    : null;
  const end = end_date
    ? new Date(typeof end_date === 'string' ? end_date.split('+')[0] : end_date)
    : null;
  const isFree = true;

  const DetailsCard = () => (
    <div className="bg-white dark:bg-[#151517] rounded-2xl border border-stone-200 dark:border-white/10 shadow-sm overflow-hidden">
      {/* Date header */}
      <div className="p-5 pb-4 border-b border-stone-100 dark:border-white/10">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex flex-col items-center justify-center shrink-0">
            <p className="text-xs font-bold text-violet-600 dark:text-violet-300 leading-none">
              {start?.toLocaleString('en', { weekday: 'short' })}
            </p>
            <p className="text-lg font-extrabold text-violet-600 dark:text-violet-300 leading-none mt-0.5">
              {start?.getDate()}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-white">
              {start?.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p className="text-xs text-stone-400 dark:text-white/40 mt-0.5">
              {formatTime(start)}
              {end && start?.toDateString() !== end?.toDateString() && ` — ${formatTime(end)}`}
              {end && start?.toDateString() === end?.toDateString() && ` – ${formatTime(end)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        {/* Category */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-white/10 flex items-center justify-center">
            <IoBookmarkOutline className="text-xs text-stone-500 dark:text-white/50" />
          </div>
          <span className="text-sm text-stone-600 dark:text-white/65">{category}</span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            {medium === 'offline' ? (
              <IoLocationOutline className="text-xs text-stone-500 dark:text-white/50" />
            ) : (
              <IoGlobeOutline className="text-xs text-stone-500 dark:text-white/50" />
            )}
          </div>
          <div className="flex-1">
            <span className="text-sm text-stone-600 dark:text-white/65">
              {medium === 'offline' ? location_name || 'Location TBA' : 'Online Event'}
            </span>
          </div>
        </div>

        {/* Duration */}
        {duration?.length > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-white/10 flex items-center justify-center">
              <IoTimerOutline className="text-xs text-stone-500 dark:text-white/50" />
            </div>
            <span className="text-sm text-stone-600 dark:text-white/65">
              {duration.split(':').join('h ')}m
            </span>
          </div>
        )}

        {/* Language */}
        {language?.length > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-white/10 flex items-center justify-center">
              <IoLanguageOutline className="text-xs text-stone-500 dark:text-white/50" />
            </div>
            <span className="text-sm text-stone-600 dark:text-white/65">{language}</span>
          </div>
        )}

        {/* Map */}
        {medium === 'offline' && latitude && longitude && (
          <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-white/10 mt-2">
            <iframe
              title="map"
              className="w-full h-40"
              src={`https://maps.google.com/maps?q=${latitude},${longitude}&hl=en&output=embed`}
              loading="lazy"
            />
          </div>
        )}

        {/* Online link */}
        {medium === 'online' && meet_link && (
          <a
            href={meet_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-300 hover:underline mt-1"
          >
            <IoLinkOutline /> Join Meeting Link
          </a>
        )}
        {meet_id && (
          <div className="flex items-center gap-2.5 mt-2">
            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-white/10 flex items-center justify-center">
              <IoLinkOutline className="text-xs text-stone-500 dark:text-white/50" />
            </div>
            <div>
              <p className="text-xs text-stone-400 dark:text-white/40">Meeting ID</p>
              <p className="text-sm text-stone-600 dark:text-white/65">
                {meet_id}
                {meet_password ? ` (Pass: ${meet_password})` : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Price & CTA */}
      <div className="p-5 pt-4 border-t border-stone-100 dark:border-white/10">
        {isInvitation ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={responding}
              onClick={() => respondToInvitation('reject')}
              className="w-full py-3 rounded-full text-sm font-semibold bg-white text-stone-700 hover:bg-stone-50 dark:bg-transparent dark:text-white/75 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-stone-200 dark:border-white/15"
            >
              Reject
            </button>
            <button
              disabled={responding}
              onClick={() => respondToInvitation('accept')}
              className="w-full py-3 rounded-full text-sm font-semibold bg-stone-900 text-white hover:bg-stone-700 dark:bg-white dark:text-stone-950 dark:hover:bg-white/85 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-stone-900 dark:border-white"
            >
              {responding ? 'Processing...' : token ? 'Accept Invitation' : 'Login to Accept'}
            </button>
          </div>
        ) : myRsvp ? (
          <div className="w-full py-3 rounded-full text-sm font-semibold text-center bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
            {myRsvp.approved
              ? "You're Going 🎉"
              : myRsvp.rejected
                ? 'RSVP Declined'
                : 'RSVP Pending Approval'}
          </div>
        ) : (
          <button
            disabled={adding || (token && accepting_rsvp === false)}
            onClick={handleRSVP}
            className="w-full py-3 rounded-full text-sm font-semibold bg-stone-900 text-white hover:bg-stone-700 dark:bg-white dark:text-stone-950 dark:hover:bg-white/85 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-stone-900 dark:border-white"
          >
            {adding
              ? 'Processing...'
              : !token
                ? 'Login to RSVP'
                : accepting_rsvp === false
                  ? 'RSVP Closed'
                  : "RSVP — It's Free"}
          </button>
        )}
      </div>
    </div>
  );

  const HostSection = () => (
    <div className="space-y-6 pt-4 border-t border-stone-100 dark:border-white/10">
      {host && (
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-3">Hosted By</h3>
          <div className="flex items-center gap-3">
            <PersonAvatar person={host} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                {host.name}
              </p>
              {host.email && (
                <p className="text-xs text-stone-400 dark:text-white/40 truncate">{host.email}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-3">
          {going_count} Going
        </h3>
        {going.length > 0 ? (
          <div className="space-y-3">
            {going.slice(0, 5).map((person) => (
              <div key={person.id} className="flex items-center gap-3">
                <PersonAvatar person={person} className="w-9 h-9" />
                <p className="text-sm font-medium text-stone-700 dark:text-white/75 truncate">
                  {person.name}
                </p>
              </div>
            ))}
            {going_count > 5 && (
              <p className="text-xs text-stone-400 dark:text-white/40">
                +{going_count - 5} more going
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-stone-400 dark:text-white/40">Be the first to go.</p>
        )}
      </div>
    </div>
  );

  return (
    <section className="pb-16 w-full bg-white dark:bg-[#0a0a0b] text-stone-900 dark:text-white transition-colors">
      {/* Cover image with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            alt="cover blur"
            src={resolveImage(image)}
            className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-[#0a0a0b]/80 dark:to-[#0a0a0b]" />
        </div>
        <div className="relative container pt-6">
          <div className="rounded-2xl overflow-hidden shadow-lg shadow-stone-200/50 dark:shadow-black/30">
            <img
              alt={title}
              src={resolveImage(image)}
              className="w-full aspect-[21/9] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 md:items-start">
          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & meta */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-semibold mb-4">
                {category}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 dark:text-white leading-tight">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-stone-500 dark:text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <IoCalendarClearOutline className="text-sm" />
                  {start?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {start?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) !==
                    end?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) &&
                    end && (
                      <> — {end?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                    )}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {formatTime(start)}
                  {end && ` – ${formatTime(end)}`}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {medium === 'offline' ? (
                    <>
                      <IoLocationOutline className="text-sm" />
                      {location_name || 'Location TBA'}
                    </>
                  ) : (
                    <>
                      <MdComputer className="text-sm" />
                      Online
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Mobile details card */}
            <div className="lg:hidden">
              <DetailsCard />
            </div>

            {/* Description */}
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-4">
                About this event
              </h2>
              <div className="display-linebreak text-stone-600 dark:text-white/65 text-sm leading-relaxed whitespace-pre-line">
                {description}
              </div>
            </div>

            {/* Host & attendees */}
            <HostSection />

            <div className="pt-4 border-t border-stone-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <IoShareSocialOutline className="text-stone-400" />
                <p className="text-xs text-stone-400 dark:text-white/40">Share this event</p>
                <div className="flex gap-2 ml-auto">
                  {shareLinks?.map((link, index) => (
                    <a
                      key={index}
                      href={link?.share?.(`${window.location.origin}${pathname}`, title)}
                      target="_blank"
                      title={`Share on ${link?.title}`}
                      className={`w-8 h-8 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 flex items-center justify-center text-sm text-stone-500 dark:text-white/50 hover:text-stone-700 dark:hover:text-white transition-colors`}
                      rel="noreferrer"
                    >
                      {link?.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sticky sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <DetailsCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventPage;
