export interface SchoolProgram {
  title: string;
  ageRange: string;
  description: string;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  type: 'Preschool' | 'Primary' | 'Secondary' | 'HighSchool' | 'Center' | 'Other';
  address: string;
  city: string;
  district: string;
  rating: number;
  reviewCount: number;
  minTuition: number;
  maxTuition: number;
  currency: string;
  images: string[];
  logo: string;
  description: string;
  tags: string[];
  features: string[];
  programs: SchoolProgram[];
  contact: {
    phone: string;
    email: string;
    website?: string;
    facebook?: string;
  };
  verified: boolean;
}

