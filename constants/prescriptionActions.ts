// Shared by the home page buttons, the mobile menu and the prescription form
// tabs so their labels, links and icons stay in sync
export interface PrescriptionAction {
  title: string;
  // Used where space is tight, like the mobile form tabs
  shortTitle: string;
  link: string;
  icon: string;
  // Icon colour scheme, matching ButtonPill themes
  theme: "primary" | "secondary";
}

export const prescriptionActions: PrescriptionAction[] = [
  {
    title: "Transfer Prescription",
    shortTitle: "Transfer",
    link: "/prescriptions/transfer/",
    icon: "fa6-solid:paper-plane",
    theme: "secondary",
  },
  {
    title: "Refill Medications",
    shortTitle: "Refill",
    link: "/prescriptions/refill/",
    icon: "fa6-solid:prescription-bottle",
    theme: "primary",
  },
  {
    title: "Send Prescription",
    shortTitle: "Send",
    link: "/prescriptions/send/",
    icon: "fa6-solid:prescription",
    theme: "secondary",
  },
];
