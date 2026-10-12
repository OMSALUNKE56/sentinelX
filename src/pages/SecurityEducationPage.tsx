import React, { useState } from 'react';
import {
  GraduationCap,
  AlertTriangle,
  Globe,
  QrCode,
  Mic,
  Video,
  DollarSign,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const SecurityEducationPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('phishing');

  const topics = [
    {
      id: 'phishing',
      title: 'Phishing & Smishing Anatomy',
      icon: ShieldAlert,
      badge: 'High Frequency',
      summary: 'Manipulating human psychological urgency to extract credentials and bypass 2FA.',
      details: [
        {
          title: 'Artificial Time Pressure',
          desc: 'Ultimatums such as "Action required within 1 hour" or "Account suspended immediately" induce cognitive tunnel vision, preventing victims from checking sender authenticity.',
        },
        {
          title: 'Credential Interception Lures',
          desc: 'Any unexpected request for a One-Time Passcode (OTP), authentication token, or debit PIN over SMS or chat is virtually guaranteed to be a session-hijacking attempt.',
        },
        {
          title: 'Law Enforcement & Legal Threats',
          desc: 'Extortion emails alleging immediate arrest warrants from the IRS or federal courts demand untraceable settlement funds (gift cards, crypto ATMs) that legitimate courts never accept.',
        },
      ],
      safetyTips: [
        'Never disclose two-factor SMS codes or authenticator tokens to any party.',
        'Always navigate to banking portals directly via trusted bookmarks rather than links inside SMS messages.',
      ],
    },
    {
      id: 'urls',
      title: 'Lookalike Domains & Homoglyphs',
      icon: Globe,
      badge: 'Domain Vectors',
      summary: 'Deceptive characters, Punycode tricks, and nested subdomains used to spoof brands.',
      details: [
        {
          title: 'Homoglyph Character Substitutions',
          desc: 'Substituting visually identical characters (e.g. Cyrillic "а" for Latin "a", or numerical 1 for l like "paypa1.com") deceives standard human visual inspection.',
        },
        {
          title: 'The Deceptive @ Syntax Trap',
          desc: 'In URL syntax, text before the @ sign is parsed as username credentials (e.g., http://google.com@evil-phish.xyz/). The actual destination host is evil-phish.xyz, not Google.',
        },
        {
          title: 'Direct Numeric IP Hostnames',
          desc: 'Attackers deploy disposable phishing kits directly onto numbered IP addresses (e.g., http://192.0.2.1/login) to bypass domain registration oversight.',
        },
      ],
      safetyTips: [
        'Inspect the apex domain (the part immediately before the top-level domain suffix) rather than the subdomain prefix.',
        'Remember that an HTTPS padlock icon only proves traffic encryption, not that the website owner is legitimate.',
      ],
    },
    {
      id: 'quishing',
      title: 'Quishing: Malicious QR Barcodes',
      icon: QrCode,
      badge: 'Physical-to-Digital',
      summary: 'Replacing legitimate public QR barcodes with fraudulent redirects or executable URIs.',
      details: [
        {
          title: 'Physical Sticker Tampering',
          desc: 'Fraudsters place adhesive printed QR stickers over authentic parking meter, restaurant, or payment barcodes in public locations.',
        },
        {
          title: 'Executable & Intent Deep Links',
          desc: 'QR payloads can trigger device intents (e.g., tel:+1..., sms:..., or javascript: URIs) that force unexpected device dialer actions without browser inspection.',
        },
      ],
      safetyTips: [
        'Inspect public QR codes for signs of sticker peeling or physical overlays.',
        'Always preview the full URL destination on your device before confirming navigation.',
      ],
    },
    {
      id: 'voice',
      title: 'Voice Cloning & Impersonation Scams',
      icon: Mic,
      badge: 'Emerging Threat',
      summary: 'Using 3-second audio samples to synthesize convincing family member or executive distress calls.',
      details: [
        {
          title: 'Grandparent & Family Emergency Scams',
          desc: 'Scammers clone the voice of a relative using audio harvested from social media videos, fabricating urgent kidnappings, car accidents, or bail requests.',
        },
        {
          title: 'Acoustic Indicators',
          desc: 'Synthetic text-to-speech models often display robotic pitch monotonicity, abnormal zero-crossing rates, and unnaturally abrupt frequency truncations at high bands.',
        },
      ],
      safetyTips: [
        'Establish an unshared verbal family safe-word to verify unexpected distress calls.',
        'Hang up and call the family member back directly on their known, saved phone number.',
      ],
    },
    {
      id: 'taskscam',
      title: 'Job Recruitment & Advance Fee Fraud',
      icon: DollarSign,
      badge: 'Financial Extortion',
      summary: 'Fake remote tasks and investment doubling schemes requiring upfront crypto deposits.',
      details: [
        {
          title: 'Telegram Task Scams',
          desc: 'Victims are promised $500+/day to "like YouTube videos" or "review hotel apps". Initial minor payouts build confidence, followed by demands for thousands of dollars in "order optimization fees".',
        },
        {
          title: 'Advance Fee Pattern',
          desc: 'Requiring victims to pay processing, clearance, or tax fees before releasing fictitious lottery winnings or crypto account balances.',
        },
      ],
      safetyTips: [
        'Legitimate employers never demand that you pay money or buy cryptocurrency to begin working.',
        'Guaranteed high-yield investment returns without market risk do not exist.',
      ],
    },
  ];

  const currentTopic = topics.find((t) => t.id === selectedTopic) || topics[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-cyan-400" />
          <span>Cyber Threat Awareness & Education</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Technical breakdowns of modern digital social engineering vectors, visual cues, and incident response directives.
        </p>
      </div>

      {/* Main Grid: Sidebar topic list + Content detail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Topic navigation */}
        <div className="space-y-2">
          {topics.map((t) => {
            const Icon = t.icon;
            const isSelected = t.id === selectedTopic;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`w-full p-3.5 rounded-xl text-left border transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{t.title}</div>
                    <div className="text-[10px] text-slate-500">{t.badge}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Detailed Topic Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 uppercase">
              {currentTopic.badge}
            </span>
            <h2 className="text-xl font-bold text-white pt-1">{currentTopic.title}</h2>
            <p className="text-xs text-slate-400">{currentTopic.summary}</p>
          </div>

          {/* Details Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Mechanisms & Attack Patterns
            </h3>
            <div className="space-y-3">
              {currentTopic.details.map((d, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">{d.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Practices */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              Protective Action Directives
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {currentTopic.safetyTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Official Incident Reporting Directory */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">
            Official Cybersecurity & Law Enforcement Incident Reporting
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          SentinelX is an educational risk evaluation platform. If you have been the victim of financial fraud or credential compromise, immediately report to official investigative agencies:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">FBI IC3 (USA)</div>
            <p className="text-[11px] text-slate-400">Internet Crime Complaint Center for cyber fraud.</p>
            <div className="text-[11px] text-cyan-400 font-mono pt-1">ic3.gov</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">FTC Fraud Portal</div>
            <p className="text-[11px] text-slate-400">Report consumer identity theft & smishing.</p>
            <div className="text-[11px] text-cyan-400 font-mono pt-1">reportfraud.ftc.gov</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">APWG Anti-Phishing</div>
            <p className="text-[11px] text-slate-400">Global phishing domain blacklist submission.</p>
            <div className="text-[11px] text-cyan-400 font-mono pt-1">apwg.org</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">National CERT</div>
            <p className="text-[11px] text-slate-400">Computer Emergency Response Team jurisdiction.</p>
            <div className="text-[11px] text-cyan-400 font-mono pt-1">cisa.gov / cert.org</div>
          </div>
        </div>
      </div>
    </div>
  );
};
