'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { MapPin, Star, Phone, Globe, Mail, Facebook, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { School } from '../../../types/school';
import { mapSchoolFromDB } from '../../../lib/school-mapper';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/landing/Footer';
import { formatSchoolTuition, formatRating } from '../../../lib/format';
import { useI18n } from '../../../contexts/I18nContext';
import LoadingState from '../../../components/shared/LoadingState';

export default function SchoolDetailPage() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchool = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('school_listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setSchool(mapSchoolFromDB(data));
        }
      } catch (err) {
        console.error('Error fetching school details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [id]);

  if (loading) return <LoadingState />;
  if (!school) return <div className="min-h-screen flex items-center justify-center">School not found</div>;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero */}
      <div className="relative h-[40vh] bg-gray-900">
        {school.images[0] && (
          <Image src={school.images[0]} alt={school.name} fill className="object-cover opacity-60" />
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-12 w-full text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{school.name}</h1>
            <div className="flex flex-wrap items-center gap-6">
               <div className="flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-gray-300" />
                 <span>{school.address}, {school.city}</span>
               </div>
               {school.rating > 0 && (
                 <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                   <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                   <span className="font-bold">{formatRating(school.rating)}</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{lang === 'vi' ? 'Giới thiệu' : 'About'}</h2>
            <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
              {school.description}
            </div>
            
            <div className="mt-8 flex flex-wrap gap-3">
              {school.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* Programs */}
          {school.programs && school.programs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{lang === 'vi' ? 'Chương trình học' : 'Programs'}</h2>
              <div className="space-y-6">
                {school.programs.map((prog, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{prog.title}</h3>
                      <span className="text-sm font-medium text-[#0B5FFF] bg-blue-50 px-3 py-1 rounded-full">
                        {prog.ageRange}
                      </span>
                    </div>
                    <p className="text-gray-600">{prog.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Features */}
          {school.features && school.features.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{lang === 'vi' ? 'Tiện ích' : 'Features'}</h2>
              <div className="grid grid-cols-2 gap-4">
                {school.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feat}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
               <div className="mb-6">
                 <p className="text-sm text-gray-500 mb-1">{lang === 'vi' ? 'Học phí' : 'Tuition'}</p>
                 <p className="text-2xl font-bold text-[#0B5FFF]">
                   {school.minTuition ? formatSchoolTuition(school.minTuition) : 'Contact'} 
                   {school.maxTuition && ` - ${formatSchoolTuition(school.maxTuition)}`}
                 </p>
               </div>
               
               <div className="space-y-4">
                 {school.contact.phone && (
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                       <Phone className="w-5 h-5 text-[#0B5FFF]" />
                     </div>
                     <div>
                       <p className="text-xs text-gray-500">Hotline</p>
                       <p className="font-semibold text-gray-900">{school.contact.phone}</p>
                     </div>
                   </div>
                 )}
                 {school.contact.email && (
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                       <Mail className="w-5 h-5 text-[#0B5FFF]" />
                     </div>
                     <div>
                       <p className="text-xs text-gray-500">Email</p>
                       <p className="font-semibold text-gray-900 truncate max-w-[200px]">{school.contact.email}</p>
                     </div>
                   </div>
                 )}
                 {school.contact.website && (
                   <a href={school.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                     <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-[#0B5FFF] transition-colors">
                       <Globe className="w-5 h-5 text-[#0B5FFF] group-hover:text-white transition-colors" />
                     </div>
                     <div>
                       <p className="text-xs text-gray-500">Website</p>
                       <p className="font-semibold text-gray-900 group-hover:text-[#0B5FFF] transition-colors">Visit Website</p>
                     </div>
                   </a>
                 )}
               </div>

               <button className="w-full mt-8 py-3 bg-[#0B5FFF] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-600 transition-all">
                 {lang === 'vi' ? 'Liên hệ tư vấn' : 'Contact School'}
               </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

