import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

/* ─── Scroll-reveal wrapper ─── */
function Section({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Floating mockup card ─── */
function MockupCard() {
  return (
    <div className="hidden md:flex gap-4 mt-16 mx-auto max-w-3xl justify-center"
         style={{ perspective: '1200px' }}>
      {/* Left: Question card */}
      <div
        className="glass-card p-6 space-y-4 flex-1 mockup-float"
        style={{ transform: 'rotateX(4deg) rotateY(-4deg)' }}
      >
        {/* Resume badge */}
        <div className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 text-[10px] px-2.5 py-1 rounded-full border border-purple-500/20">
          <span>✦</span> Resume-tailored
        </div>

        {/* Category + difficulty */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] font-medium">
            System Design
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] font-medium">
            Hard
          </span>
          <span className="ml-auto text-[10px] text-emerald-400 font-mono">⏱ 2:45</span>
        </div>

        {/* Question */}
        <p className="text-[#F8FAFC] text-sm leading-relaxed">
          "Based on your micro-frontend architecture experience at TechCorp, how would
          you design a URL shortener for 10M DAU?"
        </p>

        {/* Score bar */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
            8.5 / 10
          </span>
        </div>
      </div>

      {/* Right: Mini radar chart mockup */}
      <div
        className="glass-card p-5 w-52 flex flex-col items-center justify-center mockup-float"
        style={{ transform: 'rotateX(4deg) rotateY(4deg)', animationDelay: '1s' }}
      >
        <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-3 font-medium">Category Score</div>
        {/* SVG radar mockup */}
        <svg viewBox="0 0 120 120" className="w-28 h-28">
          <polygon points="60,10 110,40 95,100 25,100 10,40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <polygon points="60,25 95,45 85,90 35,90 20,45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <polygon points="60,40 80,50 75,80 45,80 30,50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <polygon points="60,22 100,44 88,95 32,95 15,44" fill="rgba(139,92,246,0.25)" stroke="#8B5CF6" strokeWidth="1.5" />
          {[{x:60,y:22},{x:100,y:44},{x:88,y:95},{x:32,y:95},{x:15,y:44}].map((p,i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#8B5CF6" />
          ))}
        </svg>
        {/* Labels */}
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Technical 7.8</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Behavioral 6.2</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">DSA 8.5</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="glass-card p-8 group hover:border-[#8B5CF6]/50 hover:scale-[1.03] transition-all duration-300"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">{title}</h3>
      <p className="text-[#94A3B8] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ─── Step card ─── */
function StepCard({ num, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center text-center max-w-xs mx-auto"
    >
      {/* Number circle */}
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-[#F8FAFC] mb-5
                      bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] shadow-[0_0_30px_rgba(139,92,246,0.35)]">
        {num}
      </div>
      <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">{title}</h3>
      <p className="text-[#94A3B8] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ctaPath = user ? '/setup' : '/register';

  return (
    <div className="relative min-h-screen bg-[#050816] text-[#F8FAFC] overflow-hidden">
      {/* ── Animated grid background ── */}
      <div className="grid-bg" />

      {/* ── Aurora blobs ── */}
      <div className="aurora-blob aurora-purple" />
      <div className="aurora-blob aurora-blue" />
      <div className="aurora-blob aurora-cyan" />

      {/* ═══ NAVBAR ═══ */}
      <LandingNav user={user} navigate={navigate} />

      {/* ═══ HERO ═══ */}
      <Section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 md:pt-40 md:pb-28 min-h-[100dvh]">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-pill mb-8"
        >
          <span className="text-[#8B5CF6] mr-1.5">✦</span>
          AI-Powered · Resume-Aware · Visual Analytics
        </motion.div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight max-w-4xl">
          Ace Your Next Interview{' '}
          <span className="bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] bg-clip-text text-transparent">
            Before It Happens
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg md:text-xl text-[#94A3B8] max-w-2xl leading-relaxed">
          Upload your resume, get AI questions tailored to your actual experience,
          receive instant scored feedback, and track your growth with category-level analytics.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => navigate(ctaPath)}
            className="cta-primary"
          >
            Start Practicing Free
          </button>
          <a
            href="#how-it-works"
            className="cta-secondary"
          >
            See How It Works
          </a>
        </div>

        {/* Floating mockup */}
        <MockupCard />
      </Section>

      {/* ═══ FEATURES ═══ */}
      <Section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
          Everything you need to walk in{' '}
          <span className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
            confident
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="📄"
            title="Resume-Aware Questions"
            desc="Upload your PDF resume and the AI will ask about your specific projects, skills, and experience — not generic templates."
            delay={0}
          />
          <FeatureCard
            icon="⚡"
            title="Instant AI Scoring"
            desc="Each answer is scored 1-10 with detailed strengths, improvements, and ideal answer hints from an AI interviewer."
            delay={0.08}
          />
          <FeatureCard
            icon="📊"
            title="Category Analytics"
            desc="Radar and bar charts break down your performance by Technical, Behavioral, System Design, and DSA categories."
            delay={0.16}
          />
          <FeatureCard
            icon="⏱️"
            title="Timed Questions"
            desc="Each question has a 3-minute countdown timer — just like a real interview. Practice answering under pressure."
            delay={0.24}
          />
          <FeatureCard
            icon="💡"
            title="Hints & Skip"
            desc="Stuck? Reveal a hint to guide your thinking, or skip and come back later. No one's judging — it's practice."
            delay={0.32}
          />
          <FeatureCard
            icon="🔄"
            title="Session History"
            desc="Review past interviews with full question-by-question breakdowns, category dots, and score trends over time."
            delay={0.40}
          />
        </div>
      </Section>

      {/* ═══ HOW IT WORKS ═══ */}
      <Section id="how-it-works" className="relative z-10 px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          From setup to feedback{' '}
          <span className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
            in minutes
          </span>
        </h2>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-12 md:gap-0">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-[2px]
                          bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] opacity-40" />

          <StepCard
            num="1"
            title="Set up & upload"
            desc="Pick your role, experience level, question count (3-10), and optionally upload your resume PDF."
            delay={0}
          />
          <StepCard
            num="2"
            title="Answer under time"
            desc="Face timed AI questions one by one. Use hints if stuck, or skip and return later."
            delay={0.12}
          />
          <StepCard
            num="3"
            title="Get AI feedback"
            desc="Each answer scored 1-10 with strengths, improvements, and ideal answer guidance."
            delay={0.24}
          />
          <StepCard
            num="4"
            title="Review analytics"
            desc="See radar & bar charts by category, overall score, and full question-by-question breakdown."
            delay={0.36}
          />
        </div>
      </Section>

      {/* ═══ FINAL CTA ═══ */}
      <Section className="relative z-10 px-6 py-28 flex justify-center">
        {/* Intense aurora behind CTA */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] bg-[#8B5CF6] rounded-full blur-[160px] opacity-20" />
        </div>

        <div className="glass-card p-10 md:p-16 max-w-4xl w-full text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stop guessing.{' '}
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
              Start preparing.
            </span>
          </h2>
          <p className="text-[#94A3B8] mb-8 max-w-lg mx-auto">
            Free to use. Resume upload. Visual analytics.
            No credit card required.
          </p>
          <button
            onClick={() => navigate(ctaPath)}
            className="cta-primary text-lg"
          >
            Get Started Now
          </button>
        </div>
      </Section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#94A3B8]">
          <span className="font-bold bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent text-base">
            ⚡ PrepIQ
          </span>
          <span>Built by Vaibhav · Powered by Groq + LLaMA</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}

/* ─── Landing Navbar (separate from auth navbar) ─── */
function LandingNav({ user, navigate }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <span
          onClick={() => navigate('/')}
          className="text-xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] bg-clip-text text-transparent cursor-pointer select-none"
        >
          ⚡ PrepIQ
        </span>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/setup')}
              className="cta-nav"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors px-3 py-1.5 cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="cta-nav"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
