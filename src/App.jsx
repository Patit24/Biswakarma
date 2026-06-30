import React, { useState, useEffect, useRef } from "react";
import { 
  Cube, 
  Wrench, 
  Stack, 
  Compass, 
  Check, 
  CaretRight,
  ShieldCheck,
  House,
  Briefcase,
  MonitorPlay,
  Palette
} from "@phosphor-icons/react";
import { gsap } from "gsap";

const productViews = {
  0: { // Hero / Genesis
    hero: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=90",
    detail: "https://images.unsplash.com/photo-1505693395321-883724634266?auto=format&fit=crop&w=2000&q=90",
    insitu: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2000&q=90"
  },
  1: { // Craftsmanship
    hero: "https://images.unsplash.com/photo-1505693395321-883724634266?auto=format&fit=crop&w=2000&q=90",
    detail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=90",
    insitu: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2000&q=90"
  },
  2: { // Living & Dining Suite (Table)
    hero: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90",
    detail: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=90",
    insitu: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90"
  },
  3: { // Bedroom (Bed)
    hero: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=2000&q=90",
    detail: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=2000&q=90",
    insitu: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=2000&q=90"
  },
  4: { // Office (Desk)
    hero: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=2000&q=90",
    detail: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=90",
    insitu: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=2000&q=90"
  },
  5: { // Materials Lab
    hero: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=90",
    detail: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=2000&q=90",
    insitu: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=2000&q=90"
  },
  6: { // Client Spaces (Villa)
    hero: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=90",
    detail: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90",
    insitu: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=90"
  },
  7: { // Contact (Showroom)
    hero: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90",
    detail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=90",
    insitu: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=90"
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState("hero");

  // UX Controls State
  const [currentSection, setCurrentSection] = useState(0);
  const [activeWood, setActiveWood] = useState("walnut");
  const [activeFabric, setActiveFabric] = useState("leather");
  const [activeMetal, setActiveMetal] = useState("steel");
  const [lightMode, setLightMode] = useState(false); // Day/Night Mode State
  const [activeView, setActiveView] = useState("hero"); // "hero" | "detail" | "insitu"
  const [drawerOpen, setDrawerOpen] = useState(false); // Office drawer actuator state

  // Form submission state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // Custom Cursor tracking
  const cursorRef = useRef(null);
  const containerRef = useRef(null);

  const sectionRefs = [
    useRef(null), // 0: Hero
    useRef(null), // 1: Craftsmanship
    useRef(null), // 2: Living & Dining
    useRef(null), // 3: Bedroom
    useRef(null), // 4: Office
    useRef(null), // 5: Materials Lab
    useRef(null), // 6: Customer Spaces & Testimonials
    useRef(null), // 7: Blueprints & Contact
  ];

  // Sync body theme class
  useEffect(() => {
    if (lightMode) {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }, [lightMode]);

  // Scroll spy observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.45,
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-section-index"), 10);
          setCurrentSection(index);
          // Auto reset view angle to 'hero' on scroll transition to keep it intuitive
          setActiveView("hero");
          
          if (index === 0) setActiveTab("hero");
          else if (index <= 4) setActiveTab("collections");
          else if (index === 5) setActiveTab("materials");
          else setActiveTab("inquire");
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    sectionRefs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      sectionRefs.forEach((ref) => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  // Custom magnetic cursor tracking
  useEffect(() => {
    const onMouseMove = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX - 10,
          y: e.clientY - 10,
          duration: 0.1,
          ease: "power2.out",
        });
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const actuateButton = (e, callback) => {
    const el = e.currentTarget;
    el.classList.add("neomorphic-button-active");
    setTimeout(() => {
      el.classList.remove("neomorphic-button-active");
      callback();
    }, 120);
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (email && name) {
      setFormSubmitted(true);
    }
  };

  const sectionNames = [
    "ARMCHAIR v1.026",
    "JOINERY BLUEPRINTS",
    "DINING TABLE v3.4",
    "WALNUT PLATFORM BED",
    "OFFICE WORKDESK v2.1",
    "RAW SURFACE LAB",
    "VILLA INSTALLATIONS",
    "SECURE GATEWAY",
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-brand-matte-black text-brand-ambient relative selection:bg-brand-walnut selection:text-white blueprint-grid font-sans">
      
      {/* Dynamic Magnetic Cursor */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-5 h-5 rounded-full pointer-events-none z-50 border border-brand-ambient/30 bg-brand-ambient/5 mix-blend-difference hidden md:block" 
      />

      {/* FIXED PHOTOGRAPHIC CINEMATIC BACKDROP */}
      <div className="fixed inset-0 w-full h-screen z-0 overflow-hidden bg-[#080809]">
        
        {/* Render each section's active photograph. Use CSS cross-fade and scale transitions for luxury cinematic parallax. */}
        {Object.keys(productViews).map((key) => {
          const sectionIdx = parseInt(key, 10);
          const views = productViews[sectionIdx];
          let activeImgUrl = views[activeView] || views.hero;
          
          // If in the office desk section and detailing view, toggle image perspective based on drawer state
          if (sectionIdx === 4 && activeView === "detail" && drawerOpen) {
            activeImgUrl = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=90";
          }
          
          return (
            <div
              key={sectionIdx}
              style={{ backgroundImage: `url(${activeImgUrl})` }}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-[1200ms] ease-in-out filter ${
                lightMode ? "brightness-[0.75] contrast-[1.05]" : "brightness-[0.25]"
              } ${
                currentSection === sectionIdx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
            />
          );
        })}

        {/* Spotlighting overlay */}
        <div className="glow-spotlight absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[70%] pointer-events-none z-10" />

        {/* HUD System Overlay */}
        <div className="absolute top-28 left-8 md:left-16 pointer-events-none z-20 font-mono text-[9px] text-brand-steel flex flex-col gap-1.5 uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-brand-ambient rounded-full animate-ping" />
            <span className="text-[#eae3d5] font-bold">STREAMING PHOTOREALISM RENDERER</span>
          </div>
          <div>VIEWPORT PERSPECTIVE: [{activeView.toUpperCase()}]</div>
          <div>COMPILATION CODES: [ 200 OK ]</div>
        </div>

        <div className="absolute top-28 right-8 md:right-16 pointer-events-none z-20 font-mono text-[9px] text-brand-steel flex flex-col items-end gap-1.5 uppercase">
          <div className="text-white font-bold">STAGE: {currentSection + 1} / 8</div>
          <div className="text-brand-ambient/80 font-serif tracking-widest">{sectionNames[currentSection]}</div>
        </div>
      </div>

      {/* AMBIENT BACKDROP LIGHTING EFFECTS */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10 overflow-hidden">
        <div className="glow-ambient absolute top-10 left-1/4 w-[600px] h-[600px]" />
        <div className="glow-warm absolute bottom-12 right-1/4 w-[500px] h-[500px]" />
      </div>

      {/* ARCHITECTURAL LAYOUT HAIRLINES */}
      <div className="fixed inset-y-0 left-[15%] w-px pointer-events-none z-10 hidden md:block">
        <div className="hairline-y h-full" />
      </div>
      <div className="fixed inset-y-0 right-[15%] w-px pointer-events-none z-10 hidden md:block">
        <div className="hairline-y h-full" />
      </div>

      {/* FIXED HEADER / NAVIGATION */}
      <header className="fixed top-0 left-0 w-full h-20 glass z-50 flex items-center justify-between px-6 md:px-16 border-b border-[#eae3d5]/5">
        <div className="flex items-center gap-4">
          <span className="font-serif text-lg tracking-[0.25em] font-bold text-white uppercase">
            BISWAKARMA
          </span>
          <span className="h-5 w-px bg-white/10 hidden md:block" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-brand-steel hidden md:block uppercase">
            DESIGN DEPT / EST. 2026
          </span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-8 md:gap-12">
            <button 
              onClick={() => sectionRefs[0].current.scrollIntoView({ behavior: "smooth" })}
              className={`font-mono text-[10px] tracking-[0.2em] transition-colors uppercase ${
                activeTab === "hero" ? "text-white font-bold border-b border-brand-ambient/30 pb-1" : "text-brand-steel hover:text-white"
              }`}
            >
              Showroom
            </button>
            <button 
              onClick={() => sectionRefs[2].current.scrollIntoView({ behavior: "smooth" })}
              className={`font-mono text-[10px] tracking-[0.2em] transition-colors uppercase ${
                activeTab === "collections" ? "text-white font-bold border-b border-brand-ambient/30 pb-1" : "text-brand-steel hover:text-white"
              }`}
            >
              Collections
            </button>
            <button 
              onClick={() => sectionRefs[5].current.scrollIntoView({ behavior: "smooth" })}
              className={`font-mono text-[10px] tracking-[0.2em] transition-colors uppercase ${
                activeTab === "materials" ? "text-white font-bold border-b border-brand-ambient/30 pb-1" : "text-brand-steel hover:text-white"
              }`}
            >
              Materials
            </button>
            <button 
              onClick={() => sectionRefs[7].current.scrollIntoView({ behavior: "smooth" })}
              className={`font-mono text-[10px] tracking-[0.2em] transition-colors uppercase ${
                activeTab === "inquire" ? "text-white font-bold border-b border-brand-ambient/30 pb-1" : "text-brand-steel hover:text-white"
              }`}
            >
              Inquire
            </button>
          </nav>

          {/* Day/Night Theme Toggle Switch */}
          <button
            onClick={() => setLightMode(!lightMode)}
            className="p-2.5 border border-white/10 rounded-full bg-black/25 text-[#eae3d5] hover:bg-white/10 hover:text-white transition-all cursor-pointer flex items-center justify-center pointer-events-auto"
            title="Toggle Day/Night Theme"
          >
            {lightMode ? (
              // Sun icon (Day Mode)
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              // Moon icon (Night Mode)
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* SCROLLING OVERLAYS */}
      <div className="relative z-20 w-full pointer-events-none">
        
        {/* SECTION 0: HERO (Left aligned) */}
        <section 
          ref={sectionRefs[0]}
          data-section-index="0"
          className="min-h-screen flex flex-col justify-center px-6 md:px-24 py-24 relative"
        >
          <div className="pointer-events-auto max-w-xl md:ml-[15%]">
            <div className="mono-label mb-5 flex items-center gap-3">
              <span>00 / GENESIS</span>
              <span className="w-10 h-px bg-brand-steel/30" />
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-light tracking-tight display-text text-white mb-6 uppercase">
              Engineered <br />
              <span className="text-brand-steel">Comfort.</span> <br />
              Crafted Forever.
            </h1>
            
            <p className="text-sm md:text-base text-brand-steel leading-relaxed max-w-[40ch] mb-12 font-light">
              Architectural furniture systems constructed with industrial metallurgy and hand-selected walnut veneers, built to endure for generations.
            </p>

            <div className="flex gap-5">
              <button 
                onClick={() => sectionRefs[7].current.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-3.5 border border-[#eae3d5]/15 rounded-md font-mono text-[10px] uppercase tracking-[0.2em] bg-white text-black hover:bg-transparent hover:text-white transition-all duration-300 font-bold shadow-lg cursor-pointer"
              >
                Inquire Consult
              </button>
              <button 
                onClick={() => sectionRefs[5].current.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-3.5 border border-[#eae3d5]/10 rounded-md font-mono text-[10px] uppercase tracking-[0.2em] text-white hover:bg-white/5 transition-all duration-300 cursor-pointer"
              >
                Inspect Materials
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: CRAFTMANSHIP (Right aligned) */}
        <section 
          ref={sectionRefs[1]}
          data-section-index="1"
          className="min-h-screen flex flex-col justify-center items-end px-6 md:px-24 py-24 relative bg-brand-matte-black/30"
        >
          <div className="pointer-events-auto max-w-xl md:mr-[15%] text-right flex flex-col items-end">
            <div className="mono-label mb-5 flex items-center gap-3">
              <span className="w-10 h-px bg-brand-steel/30" />
              <span>01 / METALLURGY</span>
            </div>
            
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#eae3d5]/60 mb-3 block">
              Precision Machined Frameworks
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight display-text text-white mb-6 uppercase">
              Welded Frames, <br />
              Grown Grains
            </h2>
            <p className="text-sm md:text-base text-brand-steel leading-relaxed max-w-[40ch] mb-10 font-light">
              Every structural interface is machine welded under gas shields for ultimate skeletal unity. Every piece of walnut veneer is carefully paired to showcase organic wood grain flows.
            </p>

            <div className="grid grid-cols-2 gap-4 text-left w-full">
              <div className="glass p-6 rounded-xl border border-white/5">
                <Wrench size={20} className="text-[#eae3d5]/80 mb-4" />
                <h4 className="font-serif text-sm text-white uppercase tracking-wider mb-2">
                  TIG Welding
                </h4>
                <p className="text-[11px] text-brand-steel leading-relaxed">
                  Precision high-frequency inert gas welds that completely unify the internal carbon steel support skeletons.
                </p>
              </div>
              <div className="glass p-6 rounded-xl border border-white/5">
                <Stack size={20} className="text-[#eae3d5]/80 mb-4" />
                <h4 className="font-serif text-sm text-white uppercase tracking-wider mb-2">
                  Material Layers
                </h4>
                <p className="text-[11px] text-brand-steel leading-relaxed">
                  Multi-density architectural foam layers wrapped in saddle leather, anchored on rigid backing frames.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: COLLECTIONS BENTO (Left aligned) */}
        <section 
          ref={sectionRefs[2]}
          data-section-index="2"
          className="min-h-screen flex flex-col justify-center px-6 md:px-24 py-24 relative"
        >
          <div className="pointer-events-auto max-w-3xl md:ml-[15%]">
            <div className="mono-label mb-5 flex items-center gap-3">
              <span>02 / VOLUMES</span>
              <span className="w-10 h-px bg-brand-steel/30" />
            </div>
            
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#eae3d5]/60 mb-3 block">
              Architectural Room Showrooms
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight display-text text-white mb-8 uppercase">
              Living & Dining Suite
            </h2>
            
            {/* Bento Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Card 1: Armchair (Split with image) */}
              <div className="glass col-span-3 p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-500">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  <div className="md:col-span-7 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#eae3d5]/50">[ VOLUME 01 / LIVING ]</span>
                      <h3 className="text-2xl text-white font-light tracking-tight uppercase mt-2 mb-3 font-serif">Living Room Suite</h3>
                      <p className="text-xs text-brand-steel leading-relaxed">
                        Centrally anchored design systems. Cantilevered framing, floating volumes, and integrated titanium joints that divide room layouts with engineering precision.
                      </p>
                    </div>
                    <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-4">
                      <span className="font-mono text-[10px] text-brand-steel">03 SPECIFIC MODELS</span>
                      <CaretRight size={14} className="text-brand-steel" />
                    </div>
                  </div>
                  {/* Photo Embedding */}
                  <div className="md:col-span-5 h-48 md:h-full min-h-[160px] rounded-xl overflow-hidden border border-white/5 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80" 
                      alt="Living Room Armchair Setup" 
                      className="absolute inset-0 w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Dining Table (Split with image) */}
              <div className="glass col-span-2 p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-500">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  <div className="md:col-span-7 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-steel">[ VOLUME 02 / DINING ]</span>
                      <h3 className="text-xl text-white font-light uppercase mt-2 mb-2 font-serif">Dining Table</h3>
                      <p className="text-xs text-brand-steel leading-relaxed">
                        Travertine stone marble slabs supported by geometric walnut frames and solid titanium feet caps.
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-5 h-36 rounded-xl overflow-hidden border border-white/5 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" 
                      alt="Luxury Dining Table installation" 
                      className="absolute inset-0 w-full h-full object-cover filter brightness-95"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: CAD view */}
              <div className="glass col-span-1 p-8 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80" 
                  alt="CAD blueprints zoom" 
                  className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay hover:scale-110 transition-transform duration-700"
                />
                <div className="flex flex-col items-center justify-center h-full relative z-10 text-center">
                  <Cube size={28} className="text-brand-steel mb-3" />
                  <span className="font-mono text-[9px] text-[#eae3d5]/80 uppercase tracking-widest font-bold">
                    8K CAD VIEW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: BEDROOM COLLECTION (Right aligned) */}
        <section 
          ref={sectionRefs[3]}
          data-section-index="3"
          className="min-h-screen flex flex-col justify-center items-end px-6 md:px-24 py-24 relative bg-brand-matte-black/30"
        >
          <div className="pointer-events-auto max-w-xl md:mr-[15%] text-right flex flex-col items-end">
            <div className="mono-label mb-5 flex items-center gap-3">
              <span className="w-10 h-px bg-brand-steel/30" />
              <span>03 / SANCTUARY</span>
            </div>
            
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#eae3d5]/60 mb-3 block">
              Rest Architectures
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight display-text text-white mb-6 uppercase">
              Platform Bed
            </h2>
            <p className="text-sm md:text-base text-brand-steel leading-relaxed max-w-[40ch] mb-8 font-light">
              A continuous walnut base plate cantilevered over internal steel frames, creating an architectural plane that appears to float inches above the ground.
            </p>

            <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between w-full text-left mb-6">
              <div>
                <h4 className="font-serif text-sm text-white uppercase tracking-wider mb-1">
                  Bedside Ledges
                </h4>
                <p className="text-xs text-brand-steel">
                  Integrated bedside tables cantilevering organically from the core walnut frame.
                </p>
              </div>
              <Compass size={28} className="text-brand-steel" />
            </div>

            {/* Photo Embedding */}
            <div className="w-full h-60 rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80" 
                alt="Platform Bed Installation" 
                className="w-full h-full object-cover filter brightness-90 hover:brightness-100 transition-all duration-700" 
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: OFFICE (Left aligned) */}
        <section 
          ref={sectionRefs[4]}
          data-section-index="4"
          className="min-h-screen flex flex-col justify-center px-6 md:px-24 py-24 relative"
        >
          <div className="pointer-events-auto max-w-xl md:ml-[15%]">
            <div className="mono-label mb-5 flex items-center gap-3">
              <span>04 / COGNITIVE</span>
              <span className="w-10 h-px bg-brand-steel/30" />
            </div>
            
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#eae3d5]/60 mb-3 block">
              Actuated workspaces
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight display-text text-white mb-6 uppercase">
              Office Workdesk
            </h2>
            <p className="text-sm md:text-base text-brand-steel leading-relaxed max-w-[40ch] mb-8 font-light">
              Solid wood desk structure containing aluminum routing channels and soft-close storage blocks, detailed with linear titanium handles.
            </p>

            {/* Actuator mock control trigger */}
            <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4 mb-6">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#eae3d5]/50">
                [ MECHANICAL STAGE ACTUATOR ]
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white font-mono uppercase tracking-wider">
                  Slide Desk Drawer
                </span>
                
                <button
                  onClick={(e) => actuateButton(e, () => setDrawerOpen(!drawerOpen))}
                  className="switch-btn px-5 py-2.5 bg-black border border-white/10 rounded font-mono text-[9px] text-[#eae3d5] uppercase tracking-widest shadow-inner hover:bg-white/5 transition-all cursor-pointer"
                >
                  {drawerOpen ? "Retract Drawer [←]" : "Deploy Drawer [→]"}
                </button>
              </div>
            </div>

            {/* Photo Embedding */}
            <div className="w-full h-60 rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80" 
                alt="Office workdesk in raw concrete studio" 
                className="w-full h-full object-cover filter brightness-90 hover:brightness-100 transition-all duration-700"
              />
            </div>
          </div>
        </section>

        {/* SECTION 5: MATERIALS LAB (Right aligned) */}
        <section 
          ref={sectionRefs[5]}
          data-section-index="5"
          className="min-h-screen flex flex-col justify-center items-end px-6 md:px-24 py-24 relative bg-brand-matte-black/30"
        >
          <div className="pointer-events-auto max-w-xl md:mr-[15%] text-right flex flex-col items-end">
            <div className="mono-label mb-5 flex items-center gap-3">
              <span className="w-10 h-px bg-brand-steel/30" />
              <span>05 / MATERIAL LAB</span>
            </div>
            
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#eae3d5]/60 mb-3 block">
              PBR Material Configurator
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight display-text text-white mb-6 uppercase">
              Raw Surfaces
            </h2>
            <p className="text-sm md:text-base text-brand-steel leading-relaxed max-w-[40ch] mb-10 font-light">
              Toggle materials to inspect surface finishes. The active surface parameters will compile onto the visual presentation automatically.
            </p>

            {/* Material Grid */}
            <div className="grid grid-cols-2 gap-4 w-full text-left mb-6">
              {/* WOOD SELECTOR */}
              <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[9px] text-brand-steel block mb-2">01 / TIMBERS</span>
                  <h4 className="text-white font-serif text-sm uppercase mb-4">Wood Selection</h4>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setActiveWood("walnut")}
                    className={`px-3 py-2 rounded text-left font-mono text-[10px] flex justify-between items-center transition-colors uppercase tracking-wider cursor-pointer ${
                      activeWood === "walnut" ? "bg-white/10 text-white font-bold" : "text-brand-steel hover:text-white"
                    }`}
                  >
                    <span>Walnut Shell</span>
                    {activeWood === "walnut" && <Check size={12} />}
                  </button>
                  <button 
                    onClick={() => setActiveWood("oak")}
                    className={`px-3 py-2 rounded text-left font-mono text-[10px] flex justify-between items-center transition-colors uppercase tracking-wider cursor-pointer ${
                      activeWood === "oak" ? "bg-white/10 text-white font-bold" : "text-brand-steel hover:text-white"
                    }`}
                  >
                    <span>Natural Oak</span>
                    {activeWood === "oak" && <Check size={12} />}
                  </button>
                  <button 
                    onClick={() => setActiveWood("ash")}
                    className={`px-3 py-2 rounded text-left font-mono text-[10px] flex justify-between items-center transition-colors uppercase tracking-wider cursor-pointer ${
                      activeWood === "ash" ? "bg-white/10 text-white font-bold" : "text-brand-steel hover:text-white"
                    }`}
                  >
                    <span>Ash Veneer</span>
                    {activeWood === "ash" && <Check size={12} />}
                  </button>
                </div>
              </div>

              {/* COVERS SELECTOR */}
              <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[9px] text-brand-steel block mb-2">02 / TEXTILES</span>
                  <h4 className="text-white font-serif text-sm uppercase mb-4">Fabric Covers</h4>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setActiveFabric("leather")}
                    className={`px-3 py-2 rounded text-left font-mono text-[10px] flex justify-between items-center transition-colors uppercase tracking-wider cursor-pointer ${
                      activeFabric === "leather" ? "bg-white/10 text-white font-bold" : "text-brand-steel hover:text-white"
                    }`}
                  >
                    <span>Saddle Leather</span>
                    {activeFabric === "leather" && <Check size={12} />}
                  </button>
                  <button 
                    onClick={() => setActiveFabric("linen")}
                    className={`px-3 py-2 rounded text-left font-mono text-[10px] flex justify-between items-center transition-colors uppercase tracking-wider cursor-pointer ${
                      activeFabric === "linen" ? "bg-white/10 text-white font-bold" : "text-brand-steel hover:text-white"
                    }`}
                  >
                    <span>Natural Linen</span>
                    {activeFabric === "linen" && <Check size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Material Swatches Photo Row */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="h-16 rounded-xl overflow-hidden border border-white/5 relative" title="Walnut Grains">
                <img src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80" alt="Walnut Timber Finish" className="absolute inset-0 w-full h-full object-cover filter brightness-75" />
              </div>
              <div className="h-16 rounded-xl overflow-hidden border border-white/5 relative" title="Saddle Leather">
                <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80" alt="Saddle Leather Finish" className="absolute inset-0 w-full h-full object-cover filter brightness-75" />
              </div>
              <div className="h-16 rounded-xl overflow-hidden border border-white/5 relative" title="Travertine stone">
                <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80" alt="Travertine Finish" className="absolute inset-0 w-full h-full object-cover filter brightness-75" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: CLIENT SPACES & TESTIMONIALS (Left aligned - Split Columns with Photo) */}
        <section 
          ref={sectionRefs[6]}
          data-section-index="6"
          className="min-h-screen flex flex-col justify-center px-6 md:px-24 py-24 relative"
        >
          <div className="pointer-events-auto max-w-5xl md:ml-[15%]">
            <div className="mono-label mb-5 flex items-center gap-3">
              <span>06 / COMMISSIONED</span>
              <span className="w-10 h-px bg-brand-steel/30" />
            </div>
            
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#eae3d5]/60 mb-3 block">
              Architectural Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight display-text text-white mb-8 uppercase">
              Global Installs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              {/* Column 1: Testimonials */}
              <div className="md:col-span-7 flex flex-col gap-6">
                <div className="glass p-8 rounded-2xl border border-white/5 relative">
                  <div className="absolute top-4 right-6 font-mono text-[9px] text-brand-steel">LONDON / UK</div>
                  <p className="text-sm text-white italic font-light leading-relaxed mb-6">
                    "Biswakarma furniture is not simply furniture; it is an architectural installation that defines space. The precision of the joints matches our detailing standards perfectly."
                  </p>
                  <div className="flex justify-between items-center font-mono text-[10px] border-t border-white/5 pt-4">
                    <span className="text-[#eae3d5] font-bold uppercase tracking-wider">Foster + Partners</span>
                    <span className="text-brand-steel">Principal Architect</span>
                  </div>
                </div>

                <div className="glass p-8 rounded-2xl border border-white/5 relative">
                  <div className="absolute top-4 right-6 font-mono text-[9px] text-brand-steel">OSLO / NO</div>
                  <p className="text-sm text-white italic font-light leading-relaxed mb-6">
                    "The walnut wood grows organically across the frame. Its structural alignment feels Apple-engineered but executed by master craftsmen."
                  </p>
                  <div className="flex justify-between items-center font-mono text-[10px] border-t border-white/5 pt-4">
                    <span className="text-[#eae3d5] font-bold uppercase tracking-wider">Norm Architects</span>
                    <span className="text-brand-steel">Lead Designer</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Architectural Installation Photo Card */}
              <div className="md:col-span-5 rounded-2xl overflow-hidden border border-white/5 relative shadow-2xl min-h-[300px]">
                <img 
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" 
                  alt="Luxury Villa Architectural Interior Design" 
                  className="absolute inset-0 w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
                />
                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 glass px-4 py-3 rounded-lg flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                  <span className="text-white font-bold">Residency Project</span>
                  <span className="text-brand-steel">Lake Como, IT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: CONTACT & BLUEPRINTS (Left aligned) */}
        <section 
          ref={sectionRefs[7]}
          data-section-index="7"
          className="min-h-screen flex flex-col justify-center px-6 md:px-24 py-24 relative bg-brand-matte-black/30"
        >
          <div className="pointer-events-auto max-w-xl md:ml-[15%]">
            <div className="mono-label mb-5 flex items-center gap-3">
              <span>07 / SECURED INQUIRY</span>
              <span className="w-10 h-px bg-brand-steel/30" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#eae3d5]/60 mb-3 block">
              Architectural Inquiries
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight display-text text-white mb-6 uppercase">
              Firm Consult
            </h2>
            <p className="text-sm md:text-base text-brand-steel leading-relaxed max-w-[40ch] mb-10 font-light">
              Initiate contact to request physical material samples, request custom 3D model volumes, or discuss bespoke layouts for commercial tenders.
            </p>

            {/* Premium Inquiry Form */}
            <div className="glass p-8 rounded-2xl border border-white/5 relative overflow-hidden">
              
              {!formSubmitted ? (
                <form onSubmit={handleInquirySubmit} className="flex flex-col gap-6 relative z-10">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-brand-steel">
                      Design Specialist / Partner Name
                    </label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alexis Foster" 
                      className="w-full bg-black/40 border border-white/5 px-4 py-3 rounded text-white font-mono text-xs focus:outline-none focus:border-brand-steel transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-brand-steel">
                      Firm / Institutional Email Address
                    </label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexis@fosterandpartners.com" 
                      className="w-full bg-black/40 border border-white/5 px-4 py-3 rounded text-white font-mono text-xs focus:outline-none focus:border-brand-steel transition-colors"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 mt-2 bg-[#eae3d5] hover:bg-white text-black font-mono text-xs uppercase tracking-[0.2em] font-bold rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Request Digital Catalogues</span>
                    <CaretRight size={14} />
                  </button>
                </form>
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck size={28} className="text-[#eae3d5]" />
                  </div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-white font-bold">
                    CONNECTION ESTABLISHED
                  </h4>
                  <p className="text-xs text-brand-steel max-w-[30ch] leading-relaxed">
                    A Biswakarma design partner will contact your firm within 4 hours.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-12 text-left border-t border-white/5 pt-8 flex flex-col gap-4 text-xs font-mono text-brand-steel">
              <div className="flex items-center gap-3">
                <span className="text-white">Office Address:</span>
                <span>Industrial Zone 4, Basel, Switzerland</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white">Communications:</span>
                <span>+41 (0) 61 200 4840</span>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-16 px-6 md:px-24 border-t border-white/5 flex flex-col gap-8 text-xs font-mono text-brand-steel bg-[#050506] pointer-events-auto relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-white font-serif text-lg tracking-[0.2em] uppercase">BISWAKARMA</span>
              <span>Engineered Comfort. Crafted Forever.</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Catalogues</a>
              <a href="#" className="hover:text-white transition-colors">Firm Profile</a>
              <a href="#" className="hover:text-white transition-colors">Showrooms</a>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 text-[10px] flex flex-col md:flex-row justify-between text-brand-steel/50 gap-4">
            <span>© 2026 Biswakarma AG. All rights reserved.</span>
            <span>Raytraced photography engine / PBR shaders enabled</span>
          </div>
        </footer>

      </div>

      {/* FLOATING GLASSMORPHIC CONTROL CONSOLE (HUD) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl glass rounded-2xl p-5 flex flex-col gap-4 border border-white/10 shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-between text-[9px] font-mono text-brand-steel">
          <span className="uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={12} className="text-[#eae3d5]" />
            <span>[ SYSTEM INTERACTIVE VIEWPORT CONTROLLER ]</span>
          </span>
          <span className="uppercase tracking-widest">PHOTOGRAPHY VIEWPORT v26.4</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Angle 1: Frontal Hero */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[8px] text-brand-steel uppercase tracking-wider">01 / PERSPECTIVE</span>
            <button
              onClick={(e) => actuateButton(e, () => setActiveView("hero"))}
              className={`py-3 rounded border font-mono text-[9px] uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
                activeView === "hero" 
                  ? "bg-[#eae3d5] text-black border-[#eae3d5] font-bold shadow-inner" 
                  : "bg-black/40 text-white border-white/5 hover:bg-white/5"
              }`}
            >
              Frontal Hero
            </button>
          </div>

          {/* Angle 2: Close Up Detail */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[8px] text-brand-steel uppercase tracking-wider">02 / INTERNALS</span>
            <button
              onClick={(e) => actuateButton(e, () => setActiveView("detail"))}
              className={`py-3 rounded border font-mono text-[9px] uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
                activeView === "detail" 
                  ? "bg-[#eae3d5] text-black border-[#eae3d5] font-bold shadow-inner" 
                  : "bg-black/40 text-white border-white/5 hover:bg-white/5"
              }`}
            >
              Zoom Details
            </button>
          </div>

          {/* Angle 3: Room setup */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[8px] text-brand-steel uppercase tracking-wider">03 / IN-SITU</span>
            <button
              onClick={(e) => actuateButton(e, () => setActiveView("insitu"))}
              className={`py-3 rounded border font-mono text-[9px] uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
                activeView === "insitu" 
                  ? "bg-[#eae3d5] text-black border-[#eae3d5] font-bold shadow-inner" 
                  : "bg-black/40 text-white border-white/5 hover:bg-white/5"
              }`}
            >
              Room Layouts
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
