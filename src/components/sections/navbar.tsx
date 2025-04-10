"use client";

import { Icons } from "@/components/icons";
import { NavMenu } from "@/components/nav-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname
import { useEffect, useState } from "react";

const INITIAL_WIDTH = "70rem";
const MAX_WIDTH = "800px";

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 200,
      staggerChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    y: 100,
    transition: { duration: 0.1 },
  },
};

const drawerMenuContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerMenuVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function Navbar() {
  const { scrollY } = useScroll();
  const pathname = usePathname(); // Get current path
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(""); // Initialize empty

  // Effect to determine active section based on scroll or path
  useEffect(() => {
     // Function to handle scroll detection for anchor links
     const handleScroll = () => {
       if (pathname !== '/') return; // Only run on homepage

       const sections = siteConfig.nav.links
         .filter(item => item.href.startsWith("#"))
         .map((item) => item.href.substring(1));

       let currentSection = "";
       let minDistance = Infinity;

       for (const section of sections) {
         const element = document.getElementById(section);
         if (element) {
           const rect = element.getBoundingClientRect();
           // Check if section is near the top of the viewport
           if (rect.top >= -100 && rect.top <= 200) {
              const distance = Math.abs(rect.top - 100);
              if (distance < minDistance) {
                  minDistance = distance;
                  currentSection = section;
              }
           } else if (rect.top < -100 && rect.bottom > 100 && currentSection === "") {
              // Fallback if a section spans the target area
              currentSection = section;
           }
         }
       }
       if (currentSection && activeSection !== currentSection) {
         setActiveSection(currentSection);
       }
     };

     // Set initial active state based on path
     if (pathname && pathname !== '/') {
         if (siteConfig.nav.links.some(link => link.href === pathname)) {
             setActiveSection(pathname);
         } else {
             setActiveSection(""); // Clear if path not in nav
         }
     } else {
         // Default to first anchor or 'hero' on homepage load
         const firstAnchor = siteConfig.nav.links.find(item => item.href.startsWith('#'))?.href.substring(1) || 'hero';
         setActiveSection(firstAnchor);
         handleScroll(); // Run scroll check immediately on homepage
     }


     // Add scroll listener only on the homepage
     if (pathname === '/') {
       window.addEventListener("scroll", handleScroll);
       return () => window.removeEventListener("scroll", handleScroll);
     }
  }, [pathname, activeSection]); // Rerun when path changes or activeSection potentially updates

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setHasScrolled(latest > 10);
    });
    return unsubscribe;
  }, [scrollY]);

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const handleOverlayClick = () => setIsDrawerOpen(false);

  // Determine if a mobile link is active
  const isMobileLinkActive = (item: { href: string }) => {
    if (item.href.startsWith("/")) {
      return pathname === item.href;
    }
    if (item.href.startsWith("#")) {
      return pathname === '/' && activeSection === item.href.substring(1);
    }
    return false;
  };

  // Click handler for mobile anchor links
  const handleMobileAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.startsWith("#") || pathname !== '/') {
          // If it's a page link, let default Link behavior handle it
          // If it's an anchor but not on homepage, prevent default
          if (href.startsWith("#")) e.preventDefault();
          setIsDrawerOpen(false); // Close drawer anyway
          return;
      }

      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
          const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
      setIsDrawerOpen(false); // Close drawer after click
  };


  return (
    <header
      className={cn(
        "sticky z-50 mx-4 flex justify-center transition-all duration-300 md:mx-0",
        hasScrolled ? "top-6" : "top-4 mx-0",
      )}
    >
      <motion.div
        initial={{ width: INITIAL_WIDTH }}
        animate={{ width: hasScrolled ? MAX_WIDTH : INITIAL_WIDTH }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-2xl transition-all duration-300  xl:px-0",
            hasScrolled
              ? "px-2 border border-border backdrop-blur-lg bg-background/75"
              : "shadow-none px-7",
          )}
        >
          <div className="flex h-[56px] items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-1">
              <Icons.logo className="size-7 md:size-10 text-[#155dfc]" />
              <p className="text-lg font-semibold text-primary">SkillStack</p>
            </Link>

            <NavMenu />

            <div className="flex flex-row items-center gap-1 md:gap-3 shrink-0">
              <div className="flex items-center space-x-6">
                <Link
                  className="bg-secondary h-8 hidden md:flex items-center justify-center text-sm font-normal tracking-wide rounded-full text-primary-foreground dark:text-secondary-foreground w-fit px-4 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] border border-white/[0.12]"
                  href="#" // Update link later if needed
                >
                  Sign Up
                </Link>
              </div>
              <ThemeToggle />
              <button
                className="md:hidden border border-border size-8 rounded-md cursor-pointer flex items-center justify-center"
                onClick={toggleDrawer}
              >
                {isDrawerOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              transition={{ duration: 0.2 }}
              onClick={handleOverlayClick}
            />

            <motion.div
              className="fixed inset-x-0 w-[95%] mx-auto bottom-3 bg-background border border-border p-4 rounded-xl shadow-lg"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={drawerVariants}
            >
              {/* Mobile menu content */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                    <Icons.logo className="size-7 md:size-10 text-[#155dfc]" />
                    <p className="text-lg font-semibold text-primary">
                      SkillStack
                    </p>
                  </Link>
                  <button
                    onClick={toggleDrawer}
                    className="border border-border rounded-md p-1 cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <motion.ul
                  className="flex flex-col text-sm mb-4 border border-border rounded-md"
                  variants={drawerMenuContainerVariants}
                >
                  <AnimatePresence>
                     {siteConfig.nav.links.map((item) => (
                       <motion.li
                         key={item.id}
                         className="p-2.5 border-b border-border last:border-b-0"
                         variants={drawerMenuVariants}
                       >
                         {item.href.startsWith("/") ? (
                           <Link
                             href={item.href}
                             onClick={() => setIsDrawerOpen(false)} // Close drawer on navigation
                             className={`underline-offset-4 hover:text-primary/80 transition-colors ${
                               isMobileLinkActive(item)
                                 ? "text-primary font-medium"
                                 : "text-primary/60"
                             }`}
                           >
                             {item.name}
                           </Link>
                         ) : (
                           <a
                             href={item.href}
                             onClick={(e) => handleMobileAnchorClick(e, item.href)}
                             className={`underline-offset-4 hover:text-primary/80 transition-colors ${
                               isMobileLinkActive(item)
                                 ? "text-primary font-medium"
                                 : "text-primary/60"
                             }`}
                           >
                             {item.name}
                           </a>
                         )}
                       </motion.li>
                     ))}
                   </AnimatePresence>
                 </motion.ul>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  <Link
                    href="#" // Update link later if needed
                    className="bg-secondary h-8 flex items-center justify-center text-sm font-normal tracking-wide rounded-full text-primary-foreground dark:text-secondary-foreground w-full px-4 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] border border-white/[0.12] hover:bg-secondary/80 transition-all ease-out active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
