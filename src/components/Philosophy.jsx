import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const SplitText = ({ text, className }) => {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block relative overflow-hidden py-0.5">
          <span className="philosophy-word inline-block opacity-0 translate-y-[20px]">{word}</span>
          {/* Add a space after each word except the last to preserve spacing */}
          {i !== text.split(' ').length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
};

const Philosophy = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Parallax image
      gsap.to('.philosophy-bg', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      // Word reveal
      gsap.to('.philosophy-word', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.04,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          toggleActions: "play none none none"
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={`w-full py-24 sm:py-32 relative overflow-hidden flex flex-col items-center text-center border-t ${
      isLight ? 'bg-[#F2F3EE] text-[#0F291B] border-[#0F291B]/10' : 'bg-[#080F0B] text-white border-white/10 noise-overlay'
    }`}>
      
      {/* Parallax Background */}
      <div 
        className={`philosophy-bg absolute inset-0 z-0 bg-cover bg-center w-full h-[130%] ${isLight ? 'opacity-[0.04]' : 'opacity-[0.06]'}`}
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1920&q=80")',
          top: '-15%'
        }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center">
        
        <SplitText 
          text="Most climate software is built for Geneva boardrooms." 
          className={`font-sans text-base mb-5 ${isLight ? 'text-[#46574D]' : 'text-mist'}`}
        />

        <SplitText 
          text="Carbon Zero BD is built for" 
          className={`font-sans text-xl sm:text-2xl font-medium mb-2 ${isLight ? 'text-[#0F291B]' : 'text-white'}`}
        />

        <div className={`font-sans font-extrabold tracking-tight text-5xl sm:text-7xl lg:text-8xl leading-[1.08] mb-10 ${isLight ? 'text-[#15803d]' : 'text-emerald'}`}>
          {['B', 'a', 'n', 'g', 'l', 'a', 'd', 'e', 's', 'h', '.'].map((letter, i) => (
            <span key={i} className="inline-block relative overflow-hidden py-1">
              <span className="philosophy-word inline-block opacity-0 translate-y-[20px]">{letter}</span>
            </span>
          ))}
        </div>

        <div className={`w-[160px] h-[1px] mb-10 ${isLight ? 'bg-[#0F291B]/20' : 'bg-emerald/40'}`}></div>

        <SplitText 
          text="You are not a carbon science company." 
          className={`font-sans text-lg sm:text-xl mb-3 ${isLight ? 'text-[#0F291B]' : 'text-white'}`}
        />

        <SplitText 
          text="You are climate infrastructure." 
          className={`font-sans font-bold text-2xl sm:text-3xl lg:text-4xl mb-6 ${isLight ? 'text-[#15803d]' : 'text-emerald'}`}
        />

        <SplitText 
          text="Software + automation + local knowledge. That is your advantage. That is Carbon Zero BD." 
          className={`font-sans text-base sm:text-lg max-w-[600px] leading-relaxed ${isLight ? 'text-[#46574D]' : 'text-mist'}`}
        />

      </div>
    </section>
  );
};

export default Philosophy;
