import { Wrench, Phone, Clock } from "lucide-react";

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-sport-dark flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-sport-green/20 animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border-4 border-sport-green/40 animate-[spin_2s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Wrench className="w-10 h-10 text-sport-green" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Site en maintenance
          </h1>
          <p className="text-lg text-white/70 max-w-md mx-auto leading-relaxed">
            Notre plateforme de réservation est temporairement indisponible suite à des travaux de mise à jour.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="bg-sport-green/20 p-3 rounded-xl shrink-0">
              <Phone className="w-6 h-6 text-sport-green" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-lg mb-1">
                Pour réserver, appelez-nous directement
              </p>
              <p className="text-white/60 text-sm mb-4">
                Notre équipe est disponible pour prendre vos réservations par téléphone.
              </p>
              <a
                href="tel:29612809"
                className="inline-flex items-center gap-3 bg-sport-green hover:bg-sport-green/90 text-white font-bold text-xl md:text-2xl px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-sport-green/20"
              >
                <Phone className="w-6 h-6" />
                29 612 809
              </a>
            </div>
          </div>
        </div>

        <a
          href="https://www.instagram.com/planet_sport_djerba/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg"
        >
          <InstagramIcon />
          Suivez-nous sur Instagram
        </a>

        <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
          <Clock className="w-4 h-4" />
          <span>Planet Sports Djerba</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
