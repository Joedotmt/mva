export type PageMetadata = {
  title: string;
  description: string;
  canonical: string;
  bodyClass: string;
  footer: boolean;
  section: string;
};

export const pages: Record<string, PageMetadata> = {
  "/": {
    "title": "Home",
    "description": "The official website of the Malta Veterans Association.",
    "canonical": "https://veterans.mt/",
    "bodyClass": "page-home",
    "footer": true,
    "section": ""
  },
  "/events": {
    "title": "Events",
    "description": "Events and news from the Malta Veterans Association.",
    "canonical": "https://veterans.mt/events/",
    "bodyClass": "page-events",
    "footer": true,
    "section": ""
  },
  "/apply": {
    "title": "Apply",
    "description": "Apply to join the Malta Veterans Association.",
    "canonical": "https://veterans.mt/apply/",
    "bodyClass": "page-apply",
    "footer": true,
    "section": ""
  },
  "/contacts": {
    "title": "Contacts",
    "description": "Contact the Malta Veterans Association.",
    "canonical": "https://veterans.mt/contacts/",
    "bodyClass": "page-contacts",
    "footer": true,
    "section": ""
  },
  "/statute": {
    "title": "Statute",
    "description": "The statute of the Veterans Association Armed Forces of Malta.",
    "canonical": "https://veterans.mt/statute/",
    "bodyClass": "page-statute no-hero statute-page",
    "footer": false,
    "section": ""
  },
  "/operation-pedestal": {
    "title": "Operation Pedestal",
    "description": "The Santa Maria Convoy, also known as Operation Pedestal.",
    "canonical": "https://veterans.mt/operation-pedestal/",
    "bodyClass": "page-operation-pedestal",
    "footer": true,
    "section": "articles"
  },
  "/victory-day": {
    "title": "Victory Day",
    "description": "The history and commemoration of Victory Day in Malta.",
    "canonical": "https://veterans.mt/victory-day/",
    "bodyClass": "page-victory-day",
    "footer": true,
    "section": "articles"
  },
  "/remembrance-sunday": {
    "title": "Remembrance Sunday",
    "description": "Remembrance Sunday commemorations from the Malta Veterans Association.",
    "canonical": "https://veterans.mt/remembrance-sunday/",
    "bodyClass": "page-remembrance-sunday",
    "footer": true,
    "section": "articles"
  },
  "/independence-day": {
    "title": "Independence Day",
    "description": "The history of Malta's Independence Day.",
    "canonical": "https://veterans.mt/independence-day/",
    "bodyClass": "page-independence-day",
    "footer": true,
    "section": "articles"
  },
  "/language-policy": {
    "title": "Language Policy",
    "description": "The Malta Veterans Association language policy.",
    "canonical": "https://veterans.mt/language-policy/",
    "bodyClass": "page-language-policy",
    "footer": true,
    "section": ""
  },
  "/branding": {
    "title": "Branding",
    "description": "Malta Veterans Association brand guidelines.",
    "canonical": "https://veterans.mt/branding/",
    "bodyClass": "page-branding",
    "footer": true,
    "section": ""
  },
  "/old-branding": {
    "title": "OLD Branding",
    "description": "Legacy Malta Veterans Association brand guidelines.",
    "canonical": "https://veterans.mt/old-branding/",
    "bodyClass": "page-old-branding",
    "footer": true,
    "section": ""
  },
  "/privacy-policy": {
    "title": "privacy-policy",
    "description": "Malta Veterans Association privacy policy.",
    "canonical": "https://veterans.mt/privacy-policy/",
    "bodyClass": "page-privacy-policy",
    "footer": true,
    "section": ""
  }
};
