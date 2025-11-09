import { useRef, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ExternalLink,
  Linkedin,
  Instagram,
  Phone,
  Menu,
  X,
  Search,
  Film,
  Star,
  Video,
  DollarSign,
} from "lucide-react"; // Added more icons
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface BioSectionProps {
  scrollToSection?: (section: string) => void;
}

export default function BioSection({ scrollToSection }: BioSectionProps) {
  const bioRef = useRef(null);
  const avatarRef = useRef(null);
  const nameRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const skillsRef = useRef(null);
  const statsRef = useRef(null);
  const contactRef = useRef(null);
  const mobileMenuRef = useRef(null); // New ref for mobile menu

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create master timeline
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // Avatar animations
      tl.from(avatarRef.current, {
        scale: 0.5,
        opacity: 0,
        rotation: -15,
        duration: 1.2,
        ease: "back.out(1.4)",
      })
        .from(
          ".profile-avatar",
          {
            borderRadius: "50%",
            duration: 0.8,
            ease: "power2.inOut",
          },
          "-=0.6"
        )
        .from(
          ".glow-orb",
          {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
          },
          "-=0.8"
        );

      // Text content animations
      tl.from(
        nameRef.current,
        {
          x: -100,
          opacity: 0,
          duration: 0.8,
        },
        "-=0.6"
      )
        .from(
          titleRef.current,
          {
            x: -80,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.6"
        )
        .from(
          descriptionRef.current.children,
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.2,
          },
          "-=0.4"
        );

      // Skills animation
      tl.from(
        skillsRef.current,
        {
          y: 30,
          opacity: 0,
          duration: 0.6,
        },
        "-=0.4"
      ).from(
        skillsRef.current.querySelectorAll(".skill-badge"),
        {
          scale: 0,
          opacity: 0,
          rotation: -10,
          duration: 0.4,
          stagger: 0.08,
          ease: "back.out(1.7)",
        },
        "-=0.3"
      );

      // Stats animation
      tl.from(
        statsRef.current.querySelectorAll(".stat-card"),
        {
          y: 50,
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.4)",
        },
        "-=0.5"
      );

      // Contact section animation
      tl.from(
        contactRef.current.querySelectorAll(".contact-link"),
        {
          y: 20,
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.3"
      );

      // Skill badges hover animations
      const badges = skillsRef.current.querySelectorAll(".skill-badge");
      badges.forEach((badge) => {
        badge.addEventListener("mouseenter", () => {
          gsap.to(badge, {
            scale: 1.15,
            y: -5,
            duration: 0.3,
            ease: "back.out(1.7)",
          });
        });

        badge.addEventListener("mouseleave", () => {
          gsap.to(badge, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });

      // Stat cards hover animations
      const statCards = statsRef.current.querySelectorAll(".stat-card");
      statCards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.08,
            y: -8,
            duration: 0.3,
            ease: "power2.out",
          });

          gsap.to(card.querySelector(".stat-number"), {
            scale: 1.1,
            duration: 0.3,
            ease: "back.out(1.7)",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });

          gsap.to(card.querySelector(".stat-number"), {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });

      // Contact links hover animations
      const contactLinks = contactRef.current.querySelectorAll(".contact-link");
      contactLinks.forEach((link) => {
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

      // Number counting animation for stats
      const animateNumber = (element, target) => {
        const obj = { value: 0 };
        gsap.to(obj, {
          value: target,
          duration: 2,
          ease: "power2.out",
          delay: 1,
          onUpdate: () => {
            element.textContent =
              Math.round(obj.value) +
              (target === 150 || target === 50 ? "+" : "");
          },
        });
      };

      const statNumbers = statsRef.current.querySelectorAll(".stat-number");
      animateNumber(statNumbers[0], 150);
      animateNumber(statNumbers[1], 50);
      animateNumber(statNumbers[2], 12);

      // Menu slide-down animation
      if (mobileMenuRef.current) {
        if (isMenuOpen) {
          gsap.fromTo(
            mobileMenuRef.current,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
          );
        } else {
          gsap.to(mobileMenuRef.current, {
            y: -100,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
          });
        }
      }
    }, [isMenuOpen, bioRef]); // Add isMenuOpen dependency

    return () => ctx.revert();
  }, [isMenuOpen]);

  // Placeholder links - replace with your actual URLs/phone number
  const LINKEDIN_URL = "https://linkedin.com/in/alexmorrison";
  const INSTAGRAM_URL = "https://instagram.com/alexmorrison";
  const WHATSAPP_NUMBER = "+1234567890"; // Replace with your number
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(
    /[^0-9]/g,
    ""
  )}`;

  // Navigation links
  const navItems = [
    { name: "Reels", href: "/reels", icon: Film },
    { name: "Features", href: "/features", icon: Star },
    { name: "Videos", href: "/videos", icon: Video },
    { name: "Pricing", href: "/pricing", icon: DollarSign },
  ];

  const handleMenuItemClick = (name: string) => {
    if (name === "Pricing") {
      // External navigation
      window.location.href = "/pricing";
    } else {
      // Internal scroll
      scrollToSection?.(name.toLowerCase());
    }
    closeMenu();
  };

  return (
    <>
      {/* Transparent Burger Menu Icon - Fixed Position on Left Side */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 flex flex-col justify-center gap-1 p-2 transition-all"
      >
        <span
          className={`w-6 h-0.5 bg-white transition-transform duration-300 ${
            isMenuOpen ? "rotate-45 translate-y-1.5" : ""
          }`}
        ></span>
        <span
          className={`w-6 h-0.5 bg-white transition-opacity duration-300 ${
            isMenuOpen ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`w-6 h-0.5 bg-white transition-transform duration-300 ${
            isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
          }`}
        ></span>
      </button>

      {/* Full-Screen Menu Overlay - Always full screen on click */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-md flex flex-col">
          <div
            ref={mobileMenuRef}
            className="flex-1 flex flex-col items-center justify-center space-y-8 pt-8"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleMenuItemClick(item.name)}
                  className="flex items-center gap-3 px-6 py-3 text-2xl font-semibold text-gray-300 hover:text-purple-400 transition-colors rounded-xl bg-gray-800/30"
                >
                  <Icon className="w-6 h-6" />
                  {item.name}
                </button>
              );
            })}
            {/* Search Bar */}
            <div className="flex items-center bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 w-4/5 max-w-lg">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search projects..."
                className="bg-transparent text-gray-300 outline-none flex-1 text-lg"
              />
            </div>
          </div>
        </div>
      )}

      <section ref={bioRef} className="min-h-screen flex items-center">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            {/* Left Column - Image */}
            <div className="flex items-center justify-center min-h-screen">
              <div ref={avatarRef} className="relative">
                <div className="profile-avatar w-96 h-96 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-[4px] shadow-2xl">
                  <div className="w-full h-full rounded-3xl bg-gray-900 flex items-center justify-center overflow-hidden">
                    <span className="text-[12rem]">🎬</span>
                  </div>
                </div>
                <div className="glow-orb glow-orb-1 absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"></div>
                <div className="glow-orb glow-orb-2 absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-3xl"></div>
              </div>
            </div>

            {/* Right Column - Description & Skills */}
            <div className="flex items-center px-8 md:px-16 lg:px-20 py-20">
              <div className="max-w-2xl">
                <h1
                  ref={nameRef}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent tracking-tight"
                >
                  Alex Morrison
                </h1>
                <p
                  ref={titleRef}
                  className="text-xl md:text-2xl text-gray-300 font-light tracking-wide mb-8"
                >
                  Award-Winning Video Editor & Storyteller
                </p>

                <div ref={descriptionRef}>
                  <p className="text-lg text-gray-300 leading-relaxed mb-4">
                    With over 8 years of experience in professional video
                    editing, I specialize in crafting compelling visual
                    narratives that captivate audiences and elevate brands.
                  </p>
                  <p className="text-base text-gray-400 leading-relaxed mb-8">
                    From corporate films and commercials to music videos and
                    documentaries, I bring stories to life through expert
                    editing, color grading, and motion graphics.
                  </p>
                </div>

                {/* Skills */}
                <div ref={skillsRef} className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-200 mb-4">
                    Core Skills
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge
                      variant="secondary"
                      className="skill-badge bg-purple-500/20 border-purple-500/40 text-purple-300 cursor-pointer"
                    >
                      Adobe Premiere Pro
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="skill-badge bg-pink-500/20 border-pink-500/40 text-pink-300 cursor-pointer"
                    >
                      DaVinci Resolve
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="skill-badge bg-purple-500/20 border-purple-500/40 text-purple-300 cursor-pointer"
                    >
                      After Effects
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="skill-badge bg-pink-500/20 border-pink-500/40 text-pink-300 cursor-pointer"
                    >
                      Color Grading
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="skill-badge bg-purple-500/20 border-purple-500/40 text-purple-300 cursor-pointer"
                    >
                      Motion Graphics
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="skill-badge bg-pink-500/20 border-pink-500/40 text-pink-300 cursor-pointer"
                    >
                      Sound Design
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div ref={statsRef} className="grid grid-cols-3 gap-4 mb-8">
                  <Card className="stat-card bg-gray-800/40 backdrop-blur-sm border-gray-700/50 cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="stat-number text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-1">
                        0+
                      </div>
                      <div className="text-sm text-gray-300">Projects</div>
                    </CardContent>
                  </Card>
                  <Card className="stat-card bg-gray-800/40 backdrop-blur-sm border-gray-700/50 cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="stat-number text-3xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent mb-1">
                        0+
                      </div>
                      <div className="text-sm text-gray-300">Clients</div>
                    </CardContent>
                  </Card>
                  <Card className="stat-card bg-gray-800/40 backdrop-blur-sm border-gray-700/50 cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="stat-number text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-1">
                        0
                      </div>
                      <div className="text-sm text-gray-300">Awards</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Section */}
                <div ref={contactRef}>
                  <h3 className="text-xl font-semibold text-gray-200 mb-4">
                    Let's Connect
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors cursor-pointer"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/40 text-pink-300 rounded-lg hover:bg-pink-500/30 transition-colors cursor-pointer"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </a>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
