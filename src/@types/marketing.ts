// ----------------------------------------------------------------------
export type MarketingHomePage = {
    id: any;
    title: string;
    headingTitle: string;
    headingDescription: string;
    headingBGImage: string;
    heroImageTitle: string;
    heroImages: HeroImages[];
    banner1: Banner1[];
    testimonials: Testimonials[];
    banner2: Banner2[];
};
export type HeroImages = {
  id: any;
  title: boolean;
  description: boolean;
  buttonText: boolean;
  orientation: string;
  isActive: boolean;
  image: string;
};
export type Banner1 = {
  id: any;
  title: string;
  description1: string;
  description2: string;
  description3: string;
};
export type Banner2 = {
  id: any;
  title: string;
  description: string;
  buttonText: string;
  buttonTarget: string;
  bgImage: string;
};
export type Testimonials = {
  id: any;
  name: boolean;
  testimonial: boolean;
  company: boolean;
  isActive: string;
  isImage: boolean;
  bgImage: string;
};
export type MarketingAddHomePage = {
  id: any;
  headingTitle: string; 
  headingDescription: string; 
  headingBGImage: string; 
  heroImageTitle: string; 
  b1Title: string; 
  b1Description1: string; 
  b1Description2: string; 
  b1Description3: string; 
  b2Title: string; 
  b2Description: string; 
  b2ButtonText: string; 
  b2ButtonTarget: string; 
}
export type Trends = {
  hbTitle: string;
  hbDescription: string;
  hbButtonText: string;
  hbUrl: string;
  fbTitle: string;
  fbDescription: string;
  fbButtonText: string;
  fbUrl: string;
  anonymous_hb_user: boolean;
  registered_hb_user: boolean;
  anonymous_fb_user: boolean;
  registered_fb_user: boolean;
  anonymous_0: boolean | undefined;
  anonymous_1: boolean | undefined;
  anonymous_2: boolean | undefined;
  anonymous_3: boolean | undefined;
  anonymous_4: boolean | undefined;
  anonymous_5: boolean | undefined;
  anonymous_6: boolean | undefined;
  anonymous_7: boolean | undefined;
  anonymous_8: boolean | undefined;
  anonymous_9: boolean | undefined;
  anonymous_10: boolean | undefined;
  anonymous_11: boolean | undefined;
  registered_0: boolean | undefined;
  registered_1: boolean | undefined;
  registered_2: boolean | undefined;
  registered_3: boolean | undefined;
  registered_4: boolean | undefined;
  registered_5: boolean | undefined;
  registered_6: boolean | undefined;
  registered_7: boolean | undefined;
  registered_8: boolean | undefined;
  registered_9: boolean | undefined;
  registered_10: boolean | undefined;
  registered_11: boolean | undefined;
};

export type MarketingStallionMatch = {
  mhTitle: string;
  mhDescription: string;
  mhEmailAddress: string;
  hButtonTarget: string;
  b1Title: string;
  b1Description: string;
  b1ButtonText: string;
  b1ButtonTarget: string;
  b2Title: string;
  b2Description: string;
  b2ButtonText: string;
  b2ButtonTarget: string;
};
export type ReportOverview = {
  id: any;
  title: string;
  description: string;
  buttonText: string;
  isActive: boolean;
  isImage: boolean;
  image: string;
};

export type homeCarasoul = {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  pdfUrl: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  position: number;
}