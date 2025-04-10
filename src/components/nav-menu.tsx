"use client";

import Link from "next/link"; // Import Link
import { siteConfig } from "@/lib/config";
import { motion } from "motion/react";
import React, { useRef, useState } from "react";
import { usePathname } from "next/navigation"; // Import usePathname

interface NavItem {
  name: string;
  href: string;
}

const navs: NavItem[] = siteConfig.nav.links;

export function NavMenu() {
  const ref = useRef<HTMLUListElement>(null);
  const pathname = usePathname(); // Get current path
  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [activeSection, setActiveSection] = useState(""); // Initialize empty
  const [isManualScroll, setIsManualScroll] = useState(false);

  // Function to update indicator position
  const updateIndicator = (targetHref: string) => {
    const navItem = ref.current?.querySelector(
      `[href="${targetHref}"]`,
    )?.parentElement;
    // Use navItem here
    if (navItem) {
      const rect = navItem.getBoundingClientRect();
      setLeft(navItem.offsetLeft);
      setWidth(rect.width);
      // Set isReady only once
      if (!isReady) setIsReady(true);
    }
  };

  // Effect to initialize and update indicator based on path or scroll
  React.useEffect(() => {
    // Initialize based on current path or first anchor link on mount/path change
    const initialHref = pathname !== '/' ? pathname : (navs.find(item => item.href.startsWith('#'))?.href || '');
    if (initialHref) {
       if (initialHref.startsWith('/')) {
         setActiveSection(initialHref); // Set active based on path
         updateIndicator(initialHref);
       } else if (initialHref.startsWith('#')) {
         // Initial active section for homepage anchors
         const firstAnchor = initialHref.substring(1) || 'hero';
         setActiveSection(firstAnchor);
         updateIndicator(initialHref);
       }
    } else {
        // Reset if no match (e.g., on a path not in nav)
        setActiveSection("");
        // Optionally hide or reset indicator position
        // setLeft(0); setWidth(0); setIsReady(false);
    }

    // Scroll handler for homepage anchors
    const handleScroll = () => {
      // Skip scroll handling during manual click scrolling or if not on homepage
      if (isManualScroll || pathname !== '/') return;

      const sections = navs
        .filter((item) => item.href.startsWith("#")) // Only consider anchor links
        .map((item) => item.href.substring(1));

      // Find the section closest to viewport top
      // Find the section closest to viewport top
      let closestSection = ""; // Default to empty
      let minDistance = Infinity;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Consider section active if its top is within the top ~300px of the viewport
          if (rect.top >= -100 && rect.top <= 200) {
             const distance = Math.abs(rect.top - 100);
             if (distance < minDistance) {
                 minDistance = distance;
                 closestSection = section;
             }
          } else if (rect.top < -100 && rect.bottom > 100 && closestSection === "") {
             // Fallback if a section spans the target area but top is too high
             closestSection = section;
          }
        }
      }

      // Update active section and nav indicator only if it changed
      if (closestSection && activeSection !== closestSection) {
        setActiveSection(closestSection);
        updateIndicator(`#${closestSection}`);
      } else if (!closestSection && activeSection && activeSection.startsWith('#')) {
        // If scrolled away from all sections, potentially clear active state for anchors
        // setActiveSection(""); // Optional: clear if needed
      }
    };

    // Only add scroll listener on homepage
    if (pathname === '/') {
        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Initial check
        return () => window.removeEventListener("scroll", handleScroll);
    } else {
        // Ensure indicator is set correctly for non-homepage paths
        if (pathname && navs.some(nav => nav.href === pathname)) {
            setActiveSection(pathname);
            updateIndicator(pathname);
        } else {
             setActiveSection(""); // Clear active section if path not in nav
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManualScroll, pathname, activeSection]); // Add activeSection dependency


  // Click handler specifically for anchor links
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem,
  ) => {
    // Only handle clicks for anchor links on the homepage
    if (!item.href.startsWith("#") || pathname !== '/') {
        // Allow default behavior or Link component to handle navigation
        // If it's an anchor link but not on homepage, prevent default and do nothing or redirect
        if (item.href.startsWith("#")) e.preventDefault();
        return;
    }

    e.preventDefault();
    const targetId = item.href.substring(1);
    const element = document.getElementById(targetId);

    if (element) {
      // Set manual scroll flag
      setIsManualScroll(true);

      // Immediately update nav state
      setActiveSection(targetId);
      updateIndicator(item.href); // Use updateIndicator function

      // Calculate exact scroll position
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100; // 100px offset

      // Smooth scroll to exact position
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Reset manual scroll flag reliably after scroll ends
      let scrollEndTimer: NodeJS.Timeout;
      const scrollEndListener = () => {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => {
          setIsManualScroll(false);
          window.removeEventListener('scroll', scrollEndListener);
        }, 150); // Wait 150ms after last scroll event
      };
      window.addEventListener('scroll', scrollEndListener);
      // Fallback timeout
      setTimeout(() => {
         setIsManualScroll(false);
         window.removeEventListener('scroll', scrollEndListener);
      }, 700); // Slightly longer than typical smooth scroll
    }
  };

  // Determine if a link is active (either section or path)
  const isActive = (item: NavItem) => {
    if (item.href.startsWith("/")) {
      // Active if it's the current pathname
      return pathname === item.href;
    }
    if (item.href.startsWith("#")) {
      // Active if on homepage and it's the current scrolled section
      return pathname === '/' && activeSection === item.href.substring(1);
    }
    return false;
  };

  return (
    <div className="w-full hidden md:block">
      <ul
        className="relative mx-auto flex w-fit rounded-full h-11 px-2 items-center justify-center"
        ref={ref}
      >
        {navs.map((item) => (
          <li
            key={item.name}
            className={`z-10 cursor-pointer h-full flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              isActive(item) // Use combined active check
                ? "text-primary"
                : "text-primary/60 hover:text-primary"
            } tracking-tight`}
          >
            {item.href.startsWith("/") ? (
              // Use Next.js Link for internal page navigation
              <Link href={item.href} onClick={() => {
                  setActiveSection(item.href); // Set active state on click
                  updateIndicator(item.href);
              }}>
                {item.name}
              </Link>
            ) : (
              // Use regular anchor for smooth scrolling on the same page
              <a href={item.href} onClick={(e) => handleAnchorClick(e, item)}>
                {item.name}
              </a>
            )}
          </li>
        ))}
        {isReady && ( // Render indicator only when position is calculated
          <motion.li
            animate={{ left, width }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute inset-0 my-1.5 rounded-full bg-accent/60 border border-border"
          />
        )}
      </ul>
    </div>
  );
}
