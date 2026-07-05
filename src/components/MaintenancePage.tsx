import { Wrench, Phone, Clock } from "lucide-react";

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
              <p className="text-white/60 text-sm mb-3">
                Notre équipe est disponible pour prendre vos réservations par téléphone.
              </p>
              <a
                href="tel:29612809"
                className="inline-flex items-center gap-2 text-sport-green hover:text-white transition-colors font-bold text-2xl md:text-3xl"
              >
                <Phone className="w-6 h-6" />
                29 612 809
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
          <Clock className="w-4 h-4" />
          <span>Planet Sports Djerba</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
