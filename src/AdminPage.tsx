import React, { useState } from 'react';
import { Copy, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {
  PREFIXES,
  PrefixCode,
  formatDisplayName,
  buildInviteLink,
  buildInviteMessage,
} from './guest';

export function AdminPage() {
  const [prefix, setPrefix] = useState<PrefixCode>('mr');
  const [guestName, setGuestName] = useState('');
  const [generated, setGenerated] = useState<{ displayName: string; link: string; message: string } | null>(null);

  const handleGenerate = () => {
    if (!guestName.trim()) return;
    const displayName = formatDisplayName(prefix, guestName);
    const link = buildInviteLink(window.location.origin, prefix, guestName);
    setGenerated({ displayName, link, message: buildInviteMessage(displayName, link) });
  };

  const copy = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Could not copy. Please copy it manually.');
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-brand-beige focus:ring-2 focus:ring-brand-beige-deep focus:border-transparent outline-none transition-all bg-white font-sans';
  const buttonClass =
    'flex items-center justify-center gap-2 px-4 py-3 rounded-full font-sans text-xs tracking-[0.2em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-800 flex items-center justify-center">
      <Toaster position="top-center" />
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_8px_30px_rgba(176,137,104,0.15)] overflow-hidden border border-brand-beige/50">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display tracking-wide mb-2 text-stone-800">Link Generator</h2>
            <p className="text-stone-500 font-sans text-sm uppercase tracking-[0.2em]">Create personalized invitation links</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="prefix" className="block text-sm font-medium text-stone-700 mb-1 tracking-wide">
                Select Prefix
              </label>
              <select
                id="prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value as PrefixCode)}
                className={inputClass}
              >
                {PREFIXES.map((p) => (
                  <option key={p.code} value={p.code}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="guestName" className="block text-sm font-medium text-stone-700 mb-1 tracking-wide">
                Guest Name
              </label>
              <input
                type="text"
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Sanjaya"
                className={inputClass}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!guestName.trim()}
              className={`${buttonClass} w-full bg-brand-beige-deep text-white shadow-lg hover:bg-stone-800`}
            >
              <LinkIcon className="w-5 h-5" />
              Generate Link
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => generated && copy(generated.link, 'Link copied!')}
                disabled={!generated}
                className={`${buttonClass} border border-brand-beige-deep text-brand-beige-deep hover:bg-brand-beige/20`}
              >
                <Copy className="w-4 h-4" />
                Copy Link Only
              </button>
              <button
                onClick={() => generated && copy(generated.message, 'Message copied!')}
                disabled={!generated}
                className={`${buttonClass} border border-brand-beige-deep text-brand-beige-deep hover:bg-brand-beige/20`}
              >
                <MessageCircle className="w-4 h-4" />
                Copy Full Message
              </button>
            </div>

            {generated && (
              <div className="mt-2 space-y-4 p-4 bg-brand-ivory rounded-xl border border-brand-beige/50">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1 font-medium">Greeting</p>
                  <p className="font-serif text-xl text-stone-800">Dear {generated.displayName} ❤️</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1 font-medium">Generated Link</p>
                  <a
                    href={generated.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-all text-sm text-brand-beige-deep underline"
                  >
                    {generated.link}
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1 font-medium">Message Preview</p>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-stone-700 bg-white p-3 rounded-lg border border-brand-beige/40">
                    {generated.message}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
