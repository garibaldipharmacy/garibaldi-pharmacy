// Every public page, in the groups the HTML sitemap shows. The 404 page uses
// the same list to suggest where someone meant to go, so add new pages here.
// Descriptions follow each page's own introduction

export interface SitePage {
  title: string;
  link: string;
  icon: string;
  description: string;
  // Words people are likely to have in an address when they meant this page.
  // Matched as parts of words, so "vaccin" covers vaccine and vaccination
  words: string[];
}

export interface SitePageGroup {
  title: string;
  pages: SitePage[];
}

export const sitePageGroups: SitePageGroup[] = [
  {
    title: "Garibaldi Pharmacy",
    pages: [
      {
        title: "Home",
        link: "/",
        icon: "fa6-solid:house",
        description:
          "Personalized medicine and accessible healthcare in Squamish.",
        words: ["home", "index"],
      },
      {
        title: "Pharmacy in Squamish",
        link: "/squamish-pharmacy/",
        icon: "fa6-solid:location-dot",
        description:
          "Our location, hours and services, and the communities we serve.",
        words: ["squamish", "local", "near-me"],
      },
      {
        title: "About Us",
        link: "/about/",
        icon: "fa6-solid:store",
        description:
          "Squamish’s first independent pharmacy, owned and operated by locals.",
        words: ["about", "team", "story", "owner"],
      },
      {
        title: "Medical Clinic",
        link: "/medical-clinic/",
        icon: "fa6-solid:user-doctor",
        description:
          "Terra Nova Squamish Clinic, our in-house family practice clinic.",
        words: ["clinic", "doctor", "physician", "terra"],
      },
      {
        title: "Contact Us",
        link: "/contact/",
        icon: "fa6-solid:phone",
        description: "Phone, fax, email and directions to the pharmacy.",
        words: [
          "contact",
          "hour",
          "location",
          "map",
          "direction",
          "phone",
          "email",
          "fax",
        ],
      },
    ],
  },
  {
    title: "Prescriptions",
    pages: [
      {
        title: "Prescriptions",
        link: "/prescriptions/",
        icon: "fa6-solid:prescription",
        description:
          "Transfer, refill or send your prescription using our online forms.",
        words: ["prescri", "rx"],
      },
      {
        title: "Transfer Prescription",
        link: "/prescriptions/transfer/",
        icon: "fa6-solid:paper-plane",
        description:
          "Our pharmacy staff will contact your current pharmacy to transfer your medication.",
        words: ["transfer", "switch"],
      },
      {
        title: "Refill Medications",
        link: "/prescriptions/refill/",
        icon: "fa6-solid:prescription-bottle",
        description:
          "Our pharmacy staff will confirm and refill your prescription.",
        words: ["refill", "renew", "repeat"],
      },
      {
        title: "Send Prescription",
        link: "/prescriptions/send/",
        icon: "fa6-solid:prescription",
        description:
          "Send us a paper prescription so we can prepare it in advance.",
        words: ["send", "upload", "new-prescri"],
      },
    ],
  },
  {
    title: "Services",
    pages: [
      {
        title: "Compounding",
        link: "/services/compounding/",
        icon: "fa6-solid:mortar-pestle",
        description:
          "The exact medication you need, prepared from a custom formula.",
        words: ["compound", "custom", "clean-room", "lab"],
      },
      {
        title: "Immunizations",
        link: "/services/immunizations/",
        icon: "bx:bxs-injection",
        description:
          "Seasonal flu shots, travel vaccinations and most other vaccines.",
        words: ["immuni", "vaccin", "flu", "covid", "shot", "travel"],
      },
      {
        title: "Minor Ailments",
        link: "/services/minor-ailments/",
        icon: "fa6-solid:hand-holding-medical",
        description:
          "Treatment from a pharmacist, faster than it takes to see a doctor.",
        words: ["ailment", "minor", "uti", "contracept"],
      },
      {
        title: "Consultations",
        link: "/services/consultations/",
        icon: "fa6-solid:clipboard-list",
        description:
          "One-on-one time with a pharmacist about your medications and health.",
        words: ["consult", "review", "stocking", "compression"],
      },
      {
        title: "Drug Administration",
        link: "/services/drug-administration/",
        icon: "fa6-solid:prescription-bottle-medical",
        description: "Pharmacists can administer your medication for you.",
        words: ["administ", "inject"],
      },
      {
        title: "Point-of-Care Testing",
        link: "/services/point-of-care-testing/",
        icon: "fa6-solid:vial",
        description:
          "Quick health checks at the pharmacy, with results during your visit.",
        words: ["test", "point-of-care", "poc"],
      },
    ],
  },
];

export const sitePages: SitePage[] = sitePageGroups.flatMap(
  (group) => group.pages,
);
