"use client";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Linkedin, Instagram, Phone, ExternalLink } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactSection() {
  const sectionRef = useRef(null);
  const socialRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance timeline
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      tl.from(socialRef.current.querySelectorAll(".social-link"), {
        scale: 0.8,
        opacity: 0,
        rotation: 5,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.7)",
      });

      // Hover animations for social links
      const socialLinks = socialRef.current.querySelectorAll(".social-link");
      socialLinks.forEach((link) => {
        link.addEventListener("mouseenter", () => {
          gsap.to(link, {
            scale: 1.1,
            y: -3,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(link.querySelector("svg"), {
            rotation: 360,
            duration: 0.6,
            ease: "back.out(1.7)",
          });
        });

        link.addEventListener("mouseleave", () => {
          gsap.to(link, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(link.querySelector("svg"), {
            rotation: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Placeholder social data - customize as needed
  const socialLinks = [
    {
      icon: Linkedin,
      href: "https://linkedin.com/in/alexmorrison",
      label: "LinkedIn",
    },
    {
      icon: Instagram,
      href: "https://instagram.com/alexmorrison",
      label: "Instagram",
    },
    {
      icon: Phone,
      href: `https://wa.me/1234567890`, // Replace with your WhatsApp number (e.g., +1 for US)
      label: "WhatsApp",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center py-20 bg-gradient-to-br from-gray-900/80 to-black/80 border-t border-gray-800"
    >
      <div className="w-full max-w-6xl mx-auto px-8 md:px-16 lg:px-20 text-center">
        <div ref={socialRef} className="space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent tracking-tight">
            Get In Touch
          </h2>
          <h3 className="text-xl font-semibold text-gray-200 mb-6 flex items-center justify-center gap-2 mx-auto">
            Connect With Me <ExternalLink className="w-4 h-4" />
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link inline-flex items-center gap-2 px-6 py-4 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors cursor-pointer font-medium text-lg"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
