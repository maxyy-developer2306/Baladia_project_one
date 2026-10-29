import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Loader2, X } from 'lucide-react';
import api from '../api';

export default function CertificateDetails() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);

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

  const photoUrl = cert.userPhoto && cert.userPhoto.startsWith('/uploads/')
    ? 'http://localhost:4000' + cert.userPhoto
    : cert.userPhoto;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#333] m-0 p-0" style={{ fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      {/* Google Font Injection to match PHP head exactly */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
      `}</style>

      {/* Top Utility Bar */}
      <div className="bg-[#f4f4f4] px-[40px] py-[6px] text-[13px] border-b border-[#e5e5e5] flex justify-between flex-col md:flex-row gap-[5px] md:gap-0 text-center md:text-right">
        <div className="flex justify-center md:justify-start w-full md:w-auto">
          <a href="#" className="text-[#555] no-underline ml-[15px]">أدوات سهولة الوصول</a>
          <a href="#" className="text-[#555] no-underline ml-[15px]">الإعدادات</a>
        </div>
        <div className="flex justify-center md:justify-start w-full md:w-auto">
          <span>موقع حكومي مسجل لدى هيئة الحكومة الرقمية <strong className="text-[#0b6c42]">كيف تتحقق ؟</strong></span>
        </div>
      </div>

      {/* Premium Green Navbar */}
      <nav className="bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] px-[40px] py-[15px] flex justify-between items-center flex-col md:flex-row gap-[15px] md:gap-0 text-center md:text-right">
        <div className="flex gap-[25px] items-center flex-col md:flex-row w-full md:w-auto">
          <img src="/img/logo.png" alt="Balady Logo" className="h-[55px] ml-0 md:ml-[20px] mb-[10px] md:mb-0" />
          <button onClick={() => openModal('about')} className="text-[#2d2d2d] no-underline font-semibold text-[15px] py-[8px] px-[4px] w-full md:w-auto block bg-transparent border-0 cursor-pointer" style={{ fontFamily: "'Cairo', sans-serif" }}>عن بلدي</button>
          <button onClick={() => openModal('services')} className="text-white bg-[#0b6c42] no-underline font-semibold text-[15px] py-[8px] px-[15px] rounded-[4px] w-full md:w-auto block border-0 cursor-pointer" style={{ fontFamily: "'Cairo', sans-serif" }}>الخدمات</button>
          <button onClick={() => openModal('inquiries')} className="text-[#2d2d2d] no-underline font-semibold text-[15px] py-[8px] px-[4px] w-full md:w-auto block bg-transparent border-0 cursor-pointer" style={{ fontFamily: "'Cairo', sans-serif" }}>الاستعلامات</button>
          <button onClick={() => openModal('contact')} className="text-[#2d2d2d] no-underline font-semibold text-[15px] py-[8px] px-[4px] w-full md:w-auto block bg-transparent border-0 cursor-pointer" style={{ fontFamily: "'Cairo', sans-serif" }}>تواصل معنا</button>
        </div>
        <div className="w-full md:w-auto">
          <button onClick={() => openModal('business')} className="bg-[#0b6c42] text-white no-underline rounded-[4px] py-[8px] px-[20px] font-bold inline-block w-full md:w-auto text-center border-0 cursor-pointer" style={{ fontFamily: "'Cairo', sans-serif" }}>بلدي أعمال</button>
          <button onClick={() => openModal('search')} className="mr-0 md:mr-[20px] mt-[5px] md:mt-0 text-[#333] no-underline text-[14px] inline-block w-full md:w-auto text-center bg-transparent border-0 cursor-pointer" style={{ fontFamily: "'Cairo', sans-serif" }}>بحث</button>
        </div>
      </nav>

      {/* Info Popup Modal */}
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
            <p className="text-[14px] text-[#444] leading-7">{modalInfo.body}</p>
          </div>
        </div>
      )}

      {/* Page Content Title */}
      <h2 className="text-center text-[#0f5132] mt-[30px] font-bold text-[26px]">شهادة صحية</h2>

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