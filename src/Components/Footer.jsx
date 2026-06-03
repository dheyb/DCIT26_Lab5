export const Footer = ({ className = "" }) => {
  return (
    <footer className={`w-full bg-[#4a3a22] text-[#f0e3d2] ${className}`}>
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <h3 className="text-lg font-black tracking-wider uppercase">☕ OUR CAFÉ</h3>
          <p className="text-xs opacity-75 max-w-xs mt-1 leading-relaxed">
            Serving you the finest traditional and modern coffee blends, crispy chicken wings,
            and delicious rice meals freshly prepared every day.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <h3 className="text-lg font-black tracking-wider uppercase">🕒 OPERATING HOURS</h3>
          <div className="text-xs opacity-75 mt-1 flex flex-col gap-1">
            <p><span className="font-bold text-white">Monday - Friday:</span> 8:00 AM - 9:00 PM</p>
            <p><span className="font-bold text-white">Saturday - Sunday:</span> 9:00 AM - 10:00 PM</p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <h3 className="text-lg font-black tracking-wider uppercase">📞 CONTACT & LOCATION</h3>
          <div className="text-xs opacity-75 mt-1 flex flex-col gap-1.5">
            <p>📍 123 Cafe Street, Tanza, Cavite</p>
            <p>📞 +63 912 345 6789</p>
            <p>✉️ support@ourcafe.com</p>
          </div>
        </div>
      </div>

      <hr className="border-white/10 w-full" />

      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs opacity-60 text-center sm:text-left">
        <p>© 2026 Our Café. All Rights Reserved.</p>
        <p>Made with ❤️ for coffee lovers</p>
      </div>
    </footer>
  );
};