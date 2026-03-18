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

const SCHOOL_TYPE_MAP: Record<number, School['type']> = {
  1: 'Preschool',
  3: 'Preschool',
  4: 'Preschool',
  13: 'Other',
};

const SCHOOL_TYPE_LABEL: Record<number, string> = {
  1: 'Tư thục',
  3: 'Song ngữ',
  4: 'Quốc tế',
  13: 'Công lập',
};

export const mapDirectorySchool = (item: any): School => ({
  id: String(item.kiddihub_id),
  name: item.name,
  slug: item.slug,
  type: SCHOOL_TYPE_MAP[item.school_type] || 'Preschool',
  address: item.address || '',
  city: item.province || 'Hồ Chí Minh',
  district: '',
  rating: item.rating != null ? Number(item.rating) : 0,
  reviewCount: item.review_count ? Number(item.review_count) : 0,
  minTuition: Number(item.tuition_min) || 0,
  maxTuition: Number(item.tuition_max) || 0,
  currency: 'VND',
  images: [item.banner_lg, item.banner_md, item.banner_xs].filter(Boolean),
  logo: item.avatar_lg || item.avatar_origin || '',
  description: '',
  tags: [
    SCHOOL_TYPE_LABEL[item.school_type],
    item.age_range,
    item.verified ? 'Đã xác minh' : null,
    item.refund_commitment ? 'Cam kết hoàn tiền' : null,
    item.has_promotions ? 'Có ưu đãi' : null,
  ].filter(Boolean) as string[],
  features: [
    item.verified && 'Trường đã xác minh',
    item.refund_commitment && 'Cam kết hoàn tiền',
    item.member && 'Đối tác xác nhận',
    item.age_range && `Độ tuổi: ${item.age_range}`,
  ].filter(Boolean) as string[],
  programs: [],
  contact: {
    phone: item.phone || '',
    email: item.email || '',
    website: item.website || item.kiddihub_url || '',
  },
  verified: Boolean(item.verified),
});

