import { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: [
    "SkillStack",
    "Skill Contest",
    "Prediction Contest",
    "Gaming Contest",
    "Decentralized Platform",
    "User-Powered",
    "Cash Rewards",
    "VIP Creator",
    "Skill-Based Gaming",
    "Online Contests",
  ],
  authors: [ // Keep author for now, update if needed
    {
      name: "Dillion Verma",
      url: "https://magicui.design",
    },
  ],
  creator: "dillionverma", // Keep creator for now, update if needed
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@dillionverma", // Keep creator handle for now, update if needed
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
