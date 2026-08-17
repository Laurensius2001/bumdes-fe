'use client';

import React from 'react';

export interface KwitansiData {
  noKwitansi: string;
  namaPelanggan: string;
  kodePelanggan?: string;
  nominal: number;
  terbilangText: string;
  untukPembayaran: string;
  tanggal: string; // Format YYYY-MM-DD or formatted DD/MM/YYYY
  namaPaket?: string;
  jenisPaket?: string;
  tandaTangan?: string | null;
  tandaTanganScale?: number;
}

interface KwitansiReceiptProps {
  data: KwitansiData;
  className?: string;
}

export default function KwitansiReceipt({ data, className = '' }: KwitansiReceiptProps) {
  // Parse date into DD, MM, YYYY
  const parseDateParts = (dateStr: string) => {
    if (!dateStr) {
      const now = new Date();
      return {
        day: String(now.getDate()).padStart(2, '0'),
        month: String(now.getMonth() + 1).padStart(2, '0'),
        year: String(now.getFullYear()),
      };
    }

    if (dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-');
      return { day: d, month: m, year: y };
    }

    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/');
      return { day: d, month: m, year: y };
    }

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return {
        day: String(d.getDate()).padStart(2, '0'),
        month: String(d.getMonth() + 1).padStart(2, '0'),
        year: String(d.getFullYear()),
      };
    }

    return { day: '', month: '', year: '' };
  };

  const { day, month, year } = parseDateParts(data.tanggal);
  const formattedNominal = Number(data.nominal || 0).toLocaleString('id-ID');

  return (
    <div
      id="kwitansi-print-area"
      className={`relative w-full max-w-[800px] shadow-2xl rounded-2xl overflow-hidden select-none bg-white print:shadow-none print:w-[750px] print:max-w-none ${className}`}
      style={{
        aspectRatio: '731 / 383',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Background Template Image (Official struck.jpg) */}
      <img
        src="/assets/logo/struck.jpg"
        alt="Kwitansi BTS SODONG NET"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
      />

      {/* ─── DYNAMIC OVERLAYS PRECISELY POSITIONED ON TEMPLATE ─── */}
      <div className="absolute inset-0 z-10 text-[#002f6c] font-sans">
        
        {/* 1. No. Kwitansi (Top Right Box, positioned after the colon on dotted line) */}
        <div
          className="absolute flex items-center font-mono font-bold text-[9px] sm:text-[10px] md:text-[11.5px] text-[#003882] tracking-normal"
          style={{
            top: '20.6%',
            left: '78.5%',
            width: '15.5%',
            height: '6%',
          }}
        >
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">{data.noKwitansi || ''}</span>
        </div>

        {/* 2. Sudah Terima Dari (Positioned cleanly above dotted line, same as Untuk Pembayaran) */}
        <div
          className="absolute flex items-center font-extrabold text-[12px] sm:text-sm md:text-[14.5px] text-[#00255a] tracking-wide"
          style={{
            top: '31.7%',
            left: '28%',
            width: '66.5%',
            height: '6%',
          }}
        >
          <span className="truncate uppercase font-black">{data.namaPelanggan || ''}</span>
        </div>

        {/* 3. Uang Sejumlah (Nominal inside Rp Pill Box) */}
        <div
          className="absolute flex items-center font-mono font-black text-[13px] sm:text-base md:text-[18px] text-[#00224f] tracking-wider"
          style={{
            top: '40.2%',
            left: '34.5%',
            width: '58%',
            height: '7%',
          }}
        >
          {data.nominal > 0 ? (
            <span className="bg-transparent pl-1 font-bold">
              {formattedNominal} ,-
            </span>
          ) : null}
        </div>

        {/* 4. Terbilang (Above dotted line) */}
        <div
          className="absolute flex items-center font-bold italic text-[10px] sm:text-[11px] md:text-[12.5px] text-slate-800 leading-tight"
          style={{
            top: '47.8%',
            left: '28%',
            width: '66.5%',
            height: '6.5%',
          }}
        >
          {data.terbilangText ? (
            <span className="truncate font-semibold text-[#0f2444]">
              # {data.terbilangText} #
            </span>
          ) : null}
        </div>

        {/* 5. Untuk Pembayaran (Above dotted line) */}
        <div
          className="absolute flex items-center font-bold text-[10px] sm:text-[11px] md:text-[12.5px] text-[#0a1e3f] leading-tight"
          style={{
            top: '57.8%',
            left: '28%',
            width: '66.5%',
            height: '6.5%',
          }}
        >
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {data.untukPembayaran || ''}
          </span>
        </div>

        {/* 6. Tanggal (DD / MM / YYYY) (Positioned cleanly on top of the blue underlines) */}
        {/* Day */}
        <div
          className="absolute flex items-center justify-center font-mono font-bold text-[11px] sm:text-xs md:text-[13.5px] text-[#00255a]"
          style={{
            top: '70.6%',
            left: '21.5%',
            width: '5.8%',
            height: '6%',
          }}
        >
          <span>{day}</span>
        </div>

        {/* Month */}
        <div
          className="absolute flex items-center justify-center font-mono font-bold text-[11px] sm:text-xs md:text-[13.5px] text-[#00255a]"
          style={{
            top: '70.6%',
            left: '29.3%',
            width: '5.8%',
            height: '6%',
          }}
        >
          <span>{month}</span>
        </div>

        {/* Year */}
        <div
          className="absolute flex items-center justify-center font-mono font-bold text-[11px] sm:text-xs md:text-[13.5px] text-[#00255a]"
          style={{
            top: '70.6%',
            left: '37.3%',
            width: '9.2%',
            height: '6%',
          }}
        >
          <span>{year}</span>
        </div>

        {/* 7. Tanda Tangan Digital / Uploaded Signature (Precisely Inside Rounded Box) */}
        {data.tandaTangan && (
          <div
            className="absolute flex items-center justify-center pointer-events-none overflow-hidden"
            style={{
              top: '74.8%',
              left: '68.4%',
              width: '21.4%',
              height: '8.2%',
              padding: '1px 3px',
            }}
          >
            <img
              src={data.tandaTangan}
              alt="Tanda Tangan"
              style={{
                transform: `scale(${(data.tandaTanganScale || 100) / 100})`,
                transformOrigin: 'center center',
              }}
              className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform"
            />
          </div>
        )}

      </div>
    </div>
  );
}
