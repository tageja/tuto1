import { School } from '../types/school';

export const mapSchoolFromDB = (item: any): School => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  type: item.type,
  address: item.address,
  city: item.city,
  district: item.district,
  rating: Number(item.rating),
  reviewCount: Number(item.review_count),
  minTuition: Number(item.min_tuition),
  maxTuition: Number(item.max_tuition),
  currency: item.currency,
  images: item.images || [],
  logo: item.logo,
  description: item.description,
  tags: item.tags || [],
  features: item.features || [],
  programs: item.programs || [],
  contact: {
    phone: item.contact_phone,
    email: item.contact_email,
    website: item.contact_website,
    facebook: item.contact_facebook,
  },
  verified: item.verified,
});

