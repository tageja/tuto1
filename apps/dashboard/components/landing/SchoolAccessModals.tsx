"use client";

import { useState } from "react";
import { useI18n } from "../../contexts/I18nContext";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { schoolLink } from "../../lib/routeBuilder";

export default function SchoolAccessModals() {
  const { t } = useI18n();
  const router = useRouter();
  
  // State for Code Modal
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for Teacher Request Modal
  const [email, setEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const handleVerifyCode = async () => {
    if (!code) return;
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/school/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.success) {
        // Close modal
        (document.getElementById('school-code-modal') as any)?.close();
        
        // Refresh auth state to pick up new role if needed (client side refresh usually needed)
        // We'll trust the redirect for now or trigger a reload if needed
        
        router.push(schoolLink(undefined, result.school_id));
      } else {
        setError(result.message || t("landing.modals.invalidCode"));
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError(t("landing.modals.invalidCode"));
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRequestSent(true);
    }, 1000);
  };

  return (
    <>
      {/* School Code Modal */}
      <dialog id="school-code-modal" className="modal bg-transparent p-0 backdrop:bg-black/50">
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => (document.getElementById('school-code-modal') as any)?.close()}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t("landing.modals.enterSchoolCode")}</h3>
            <p className="text-sm text-gray-500 mb-6">{t("landing.modals.codeDesc")}</p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SCH-2024"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-center text-lg font-mono tracking-widest uppercase"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              
              <button
                onClick={handleVerifyCode}
                disabled={loading || !code}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {t("landing.modals.verifyEnter")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* Teacher Request Modal */}
      <dialog id="teacher-request-modal" className="modal bg-transparent p-0 backdrop:bg-black/50">
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => {
                (document.getElementById('teacher-request-modal') as any)?.close();
                setRequestSent(false);
                setEmail("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            {!requestSent ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("landing.modals.requestAccess")}</h3>
                <p className="text-sm text-gray-500 mb-6">{t("landing.modals.requestDesc")}</p>
                
                <form onSubmit={handleTeacherRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t("landing.modals.email")}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@school.edu.vn"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("landing.modals.sendRequest")}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-8 h-8 rotate-[-45deg]" /> 
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("landing.modals.requestSent")}</h3>
                <p className="text-gray-500 mb-6">{t("landing.modals.requestSentDesc")}</p>
                <button
                  onClick={() => (document.getElementById('teacher-request-modal') as any)?.close()}
                  className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  {t("landing.modals.close")}
                </button>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

