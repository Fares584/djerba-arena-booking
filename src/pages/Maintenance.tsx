import { Wrench, Phone } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sport-dark via-slate-900 to-sport-dark flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-sport-green/10 flex items-center justify-center mb-6">
          <Wrench className="w-10 h-10 text-sport-green" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-sport-dark mb-4">
          Site en maintenance
        </h1>

        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Notre plateforme est actuellement en cours de maintenance afin de
          vous offrir une meilleure expérience. Nous serons de retour très
          prochainement.
        </p>

        <div className="bg-sport-gray rounded-xl p-6 border border-gray-200">
          <p className="text-sm uppercase tracking-wide text-gray-500 mb-3 font-semibold">
            Pour toute réservation
          </p>
          <p className="text-gray-700 mb-4">
            Merci de bien vouloir nous contacter directement par téléphone :
          </p>
          <a
            href="tel:+21629612809"
            className="inline-flex items-center gap-3 bg-sport-green hover:bg-sport-dark transition-colors text-white font-bold text-2xl md:text-3xl px-8 py-4 rounded-xl shadow-lg"
          >
            <Phone className="w-7 h-7" />
            29 612 809
          </a>
        </div>

        <p className="text-gray-400 text-sm mt-8">
          Merci de votre compréhension — Planet Sports Djerba
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
