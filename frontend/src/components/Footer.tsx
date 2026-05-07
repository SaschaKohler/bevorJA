import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-warm-800 text-warm-200 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="text-rose w-5 h-5" />
              <span className="font-serif text-xl text-white">Vorja</span>
            </div>
            <p className="text-warm-300 text-sm leading-relaxed">
              Einzigartige Audio- und Kartenboxen fuer Ihre Hochzeit.
              Bewahren Sie die schoensten Wuensche Ihrer Gaeste fuer immer auf.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-white text-lg mb-4">Kontakt</h3>
            <p className="text-warm-300 text-sm">info@vorja.at</p>
          </div>
          <div>
            <h3 className="font-serif text-white text-lg mb-4">Rechtliches</h3>
            <div className="space-y-2 text-sm">
              <p className="text-warm-300">Impressum</p>
              <p className="text-warm-300">Datenschutz</p>
              <p className="text-warm-300">AGB</p>
            </div>
          </div>
        </div>
        <div className="border-t border-warm-700 mt-8 pt-8 text-center text-warm-400 text-sm">
          &copy; {new Date().getFullYear()} Vorja. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
