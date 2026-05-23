import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SplitText = ({ text, className }) => {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block relative overflow-hidden">
          <span className="philosophy-word inline-block opacity-0 translate-y-[20px]">{word}</span>
          {/* Add a space after each word except the last to preserve spacing */}
          {i !== text.split(' ').length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
};

const Philosophy = () => {
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
    <section ref={containerRef} className="w-full bg-[#080F0B] noise-overlay py-[140px] relative overflow-hidden flex flex-col items-center text-center">
      
      {/* Parallax Background */}
      <div 
        className="philosophy-bg absolute inset-0 z-0 bg-cover bg-center opacity-[0.06] w-full h-[130%]"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1920&q=80")',
          top: '-15%'
        }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center">
        
        <SplitText 
          text="Most climate software is built for Geneva boardrooms." 
          className="font-sans text-[16px] text-mist mb-6"
        />

        <SplitText 
          text="CarbonOS is built for" 
          className="font-sans text-[24px] text-white mb-2"
        />

        <div className="serif-drama text-[80px] lg:text-[120px] leading-none text-emerald mb-12">
          {['B', 'a', 'n', 'g', 'l', 'a', 'd', 'e', 's', 'h', '.'].map((letter, i) => (
            <span key={i} className="inline-block relative overflow-hidden">
              <span className="philosophy-word inline-block opacity-0 translate-y-[20px]">{letter}</span>
            </span>
          ))}
        </div>

        <div className="w-[200px] h-[1px] bg-emerald/40 mb-12"></div>

        <SplitText 
          text="You are not a carbon science company." 
          className="font-sans text-[20px] text-white mb-4"
        />

        <SplitText 
          text="You are climate infrastructure." 
          className="font-sans font-bold text-[28px] lg:text-[36px] text-emerald mb-8"
        />

        <SplitText 
          text="Software + automation + local knowledge. That is your advantage. That is CarbonOS." 
          className="font-sans text-[16px] lg:text-[18px] text-mist max-w-[600px] leading-relaxed"
        />

      </div>
    </section>
  );
};

export default Philosophy;
