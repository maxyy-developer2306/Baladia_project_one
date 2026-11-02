import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  X,
  Menu,
  ChevronDown,
  Settings,
  Accessibility,
} from 'lucide-react';
import api from '../api';

export default function CertificateDetails() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // controls the hamburger dropdown

  useEffect(() => {
    api
      .get(`/certificates/${id}`)
      .then((res) => {
        setCert(res.data.certificate);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load certificate.');
        setLoading(false);
      });
  }, [id]);

  const navInfo = {
    about: {
      title: 'عن بلدي',
      body: 'منصة بلدي هي المنصة الرقمية الرسمية لوزارة البلديات والإسكان في المملكة العربية السعودية، تتيح للمستفيدين إنجاز معاملاتهم البلدية إلكترونياً دون الحاجة لمراجعة الفروع.',
    },
    services: {
      title: 'الخدمات',
      body: 'تقدم منصة بلدي مجموعة واسعة من الخدمات البلدية مثل رخص البناء، التراخيص التجارية، الشهادات الصحية، وخدمات الإشغال والتفتيش البلدي.',
    },
    inquiries: {
      title: 'الاستعلامات',
      body: 'يمكن للمستخدمين من خلال هذه الخدمة الاستعلام عن حالة معاملاتهم، التحقق من صحة الشهادات والرخص الصادرة، ومتابعة طلباتهم البلدية.',
    },
    contact: {
      title: 'تواصل معنا',
      body: 'للتواصل مع وزارة البلديات والإسكان يمكنكم الاتصال على الرقم الموحد 940 أو زيارة الموقع الرسمي momrah.gov.sa',
    },
    business: {
      title: 'بلدي أعمال',
      body: 'نسخة مخصصة من منصة بلدي موجهة لأصحاب الأعمال والمنشآت التجارية لإدارة تراخيصهم ومعاملاتهم البلدية بكل سهولة.',
    },
    search: {
      title: 'بحث',
      body: 'خاصية البحث تتيح لك إيجاد الخدمات والمعلومات داخل منصة بلدي بسرعة وسهولة.',
    },
    verify: {
      title: 'كيف تتحقق ؟',
      body: 'تحقق من صحة هذا الموقع من خلال شعار هيئة الحكومة الرقمية الموضح أعلى الصفحة، وتأكد أن الرابط ينتهي بـ gov.sa الرسمي.',
    },
    // Settings popup content
    settings: {
      title: 'الإعدادات',
      body: 'اللغة: العربية | الإنجليزية\nحجم الخط: صغير | متوسط | كبير\nوضع التباين العالي: تشغيل | إيقاف\nيمكنك تخصيص طريقة عرض الموقع بما يناسبك من هذه القائمة.',
    },
  };

  const openModal = (key) => setModalInfo(navInfo[key]);
  const closeModal = () => setModalInfo(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "'Cairo', sans-serif" }} dir="rtl">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#0b6c42] mx-auto mb-4" />
          <p className="text-sm text-gray-600">جاري تحميل الشهادة...</p>
        </div>
      </div>
    );
  }

  if (error || !cert || cert.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "'Cairo', sans-serif" }} dir="rtl">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">404 - Baladia Card Not Found or Deactivated</h1>
          <p className="text-gray-600 mb-6">{error || 'لم يتم العثور على الشهادة أو أنها غير مفعلة'}</p>
        </div>
      </div>
    );
  }

  const photoUrl = cert.userPhoto || '';

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#333] m-0 p-0" style={{ fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      {/* Google Font Injection to match PHP head exactly */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
      `}</style>

      {/* ===== Gray verification banner (matches gov.sa style) ===== */}
      <div className="bg-[#f4f4f4] border-b border-[#e5e5e5] px-[20px] md:px-[40px] py-[12px]">
        {/* Saudi flag row - top right */}
        <div className="flex justify-end mb-[6px]">
          <img
            src="https://flagcdn.com/w40/sa.png"
            alt="Saudi Arabia"
            className="w-[26px] h-[18px] object-cover rounded-[2px]"
          />
        </div>

        {/* Notice text */}
        <p className="text-[13px] text-[#333] text-right leading-6 mb-[6px]">
          موقع حكومي مسجل لدى هيئة الحكومة الرقمية
        </p>

        {/* "How to verify" link with chevron */}
        <button
          onClick={() => openModal('verify')}
          className="flex items-center gap-[4px] text-[#0b6c42] font-bold text-[13px] bg-transparent border-0 cursor-pointer mb-[10px]"
        >
          <ChevronDown size={16} />
          <span>كيف تتحقق ؟</span>
        </button>

        {/* Accessibility + settings row */}
        <div className="flex items-center justify-between flex-wrap gap-[10px] pt-[8px] border-t border-[#e5e5e5]">
          <button className="flex items-center gap-[6px] text-[#555] text-[13px] bg-transparent border-0 cursor-pointer">
            <Accessibility size={18} />
            <span>أدوات سهولة الوصول</span>
          </button>
          {/* Settings button opens the settings popup */}
          <button
            onClick={() => openModal('settings')}
            className="flex items-center gap-[6px] text-[#555] text-[13px] bg-transparent border-0 cursor-pointer"
          >
            <Settings size={18} />
            <span>الإعدادات</span>
          </button>
        </div>
      </div>

      {/* ===== Logo + hamburger nav (matches "balady services" nav) ===== */}
      <nav className="bg-white px-[20px] md:px-[40px] py-[15px] flex justify-between items-center relative">
        {/* Logo on the right (RTL start) */}
        <div className="flex items-center gap-[10px]">
          <img src="/img/logo.png" alt="Balady Logo" className="h-[46px]" />
          <div className="flex flex-col leading-[1.1] text-right">
            <span className="font-bold text-[16px] text-[#2d2d2d]">خدمات</span>
            <span className="font-bold text-[16px] text-[#2d2d2d]">بلدي</span>
          </div>
        </div>

        {/* Hamburger menu on the left */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="bg-transparent border-0 cursor-pointer text-[#2d2d2d]"
          aria-label="فتح القائمة"
        >
          <Menu size={28} />
        </button>

        {/* Dropdown menu triggered by hamburger icon */}
        {menuOpen && (
          <div className="absolute top-full left-[20px] md:left-[40px] mt-[8px] bg-white shadow-lg rounded-[8px] py-[8px] w-[200px] z-40 border border-[#eee]">
            {[
              ['about', 'عن بلدي'],
              ['services', 'الخدمات'],
              ['inquiries', 'الاستعلامات'],
              ['contact', 'تواصل معنا'],
              ['business', 'بلدي أعمال'],
              ['search', 'بحث'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  openModal(key);
                  setMenuOpen(false);
                }}
                className="block w-full text-right px-[16px] py-[10px] text-[14px] text-[#2d2d2d] bg-transparent border-0 cursor-pointer hover:bg-[#f4f4f4]"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Info Popup Modal (also used for the settings popup) */}
      {modalInfo && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-[8px] max-w-md w-full p-[25px] relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-[15px] left-[15px] text-[#777] hover:text-[#000] bg-transparent border-0 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-[#0f5132] font-bold text-[20px] mb-[12px]">{modalInfo.title}</h3>
            {/* whitespace-pre-line so the settings list (with line breaks) renders on separate lines */}
            <p className="text-[14px] text-[#444] leading-7 whitespace-pre-line">{modalInfo.body}</p>
          </div>
        </div>
      )}

      {/* ===== Page title - now in English (matches "Health certificate for business activities") ===== */}
      <h2
        className="text-center text-[#2d2d2d] mt-[20px] font-bold text-[28px] leading-[1.4] px-[20px]"
        dir="ltr"
      >
        Health certificate for business activities
      </h2>

      {/* User Photo */}
      {cert.userPhoto && (
        <div className="text-center my-[20px]">
          <img
            src={photoUrl}
            alt="User Photo"
            className="w-[130px] h-[160px] object-cover border border-[#ccc] shadow-[0_4px_8px_rgba(0,0,0,0.1)] inline-block"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Info Grid */}
      <div className="max-w-[1000px] mx-auto mb-[60px] px-[20px] w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">الأمانة</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.amanah || '—'}
            </div>
          </div>
          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">البلدية</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.municipality || '—'}
            </div>
          </div>

          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">الإسم</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.name || '—'}
            </div>
          </div>
          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">رقم الهوية</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.identityNumber || '—'}
            </div>
          </div>

          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">الجنس</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.gender || '—'}
            </div>
          </div>
          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">الجنسية</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.nationality || '—'}
            </div>
          </div>

          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">رقم الشهادة الصحية</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.certificateNumber || '—'}
            </div>
          </div>
          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">المهنة</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.profession || '—'}
            </div>
          </div>

          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">تاريخ إصدار الشهادة صحية هجري</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.issueDateHijri || '—'}
            </div>
          </div>
          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">تاريخ إصدار الشهادة صحية ميلادي</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.issueDateGregorian || '—'}
            </div>
          </div>

          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">تاريخ نهاية الشهادة صحية هجري</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.expiryDateHijri || '—'}
            </div>
          </div>
          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">تاريخ نهاية الشهادة صحية ميلادي</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.expiryDateGregorian || '—'}
            </div>
          </div>

          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">نوع البرنامج التثقيفي</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.programType || '—'}
            </div>
          </div>
          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">تاريخ إنهاء البرنامج التثقيفي</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.programEndDate || '—'}
            </div>
          </div>

          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">رقم الرخصة</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.licenseNumber || '—'}
            </div>
          </div>
          <div>
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">إسم المنشأة</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.facilityName || '—'}
            </div>
          </div>

          <div className="md:col-span-2">
            <span className="text-[12px] text-[#111] font-bold mb-[4px] block">رقم المنشأة</span>
            <div className="bg-[#f1f3f5] border border-[#ced4da] rounded-[4px] px-[15px] py-[10px] text-[14px] min-h-[43px] text-[#495057] flex items-center">
              {cert.facilityNumber || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#053e26] text-white px-[60px] py-[40px] text-[14px] relative mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-[20px]">
            <a href="#" className="text-white no-underline text-[13px] border-b border-transparent hover:border-white">خريطة الموقع</a>
            <a href="#" className="text-white no-underline text-[13px] border-b border-transparent hover:border-white">RSS</a>
            <a href="#" className="text-white no-underline text-[13px] border-b border-transparent hover:border-white">شروط الاستخدام</a>
          </div>
          <div>
            <span>جميع الحقوق محفوظة لوزارة البلديات والإسكان © 2026</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mt-[30px] border-t border-white/10 pt-[20px] gap-4">
          <div className="border border-white/40 px-[15px] py-[8px] rounded-[6px] text-[11px] inline-block bg-white/5">
            مسجلة لدى هيئة الحكومة الرقمية
          </div>
          <div>
            <span>تم تطويره وصيانته بواسطة وزارة البلديات والإسكان</span>
          </div>
        </div>
      </footer>
    </div>
  );
}