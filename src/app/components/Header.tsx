// components/Header.tsx
"use client";
import { useState } from "react";
import { X, Menu, Film, Star, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for classnames; install clsx and tailwind-merge if needed

interface HeaderProps {
  onScrollTo: (section: string) => void;
}

export default function Header({ onScrollTo }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const menuItems = [
    { id: "featured", label: "Featured Video", icon: Star },
    { id: "reels", label: "Reels", icon: Film },
    { id: "pricing", label: "Pricing", icon: DollarSign },
  ];

  const handleMenuItemClick = (id: string) => {
    onScrollTo(id);
    closeMenu();
  };

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
            Alex Morrison
          </div>
          {/* Desktop Nav - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onScrollTo(item.id)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>
          {/* Burger Icon - Visible on mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="md:hidden text-white"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Full Screen Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col justify-center items-center">
          <Button
            variant="ghost"
            onClick={closeMenu}
            className="absolute top-6 right-6 text-white"
            size="sm"
          >
            <X className="w-8 h-8" />
          </Button>
          <nav className="flex flex-col space-y-8 text-center">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleMenuItemClick(item.id)}
                className="text-2xl text-gray-300 hover:text-white transition-colors px-4 py-2"
                size="lg"
              >
                <item.icon className="w-6 h-6 mr-3 inline" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
