import { Heart, Mail, Phone } from "lucide-react";
import { OrnamentDivider } from "./Ornaments";

export default function Footer() {
  return (
    <footer className="bg-cream-dark border-t border-gold/10 py-16 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <OrnamentDivider />
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Heart className="text-rose-gold w-6 h-6" />
              <span className="font-display text-2xl text-charcoal tracking-wide">Vorja</span>
            </div>
            <p className="text-slate text-sm leading-relaxed">
              Einzigartige Audio- und Kartenboxen für Ihre Hochzeit.
              Bewahren Sie die schönsten Wünsche Ihrer Gäste für immer auf.
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="font-serif text-lg text-charcoal mb-6 tracking-wide">Kontakt</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-slate text-sm">
                <Mail className="w-4 h-4 text-gold" />
                <span>info@vorja.at</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate text-sm">
                <Phone className="w-4 h-4 text-gold" />
                <span>+43 123 456 789</span>
              </div>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <h3 className="font-serif text-lg text-charcoal mb-6 tracking-wide">Rechtliches</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-slate hover:text-gold-dark transition-colors">Impressum</a>
              <a href="#" className="block text-slate hover:text-gold-dark transition-colors">Datenschutz</a>
              <a href="#" className="block text-slate hover:text-gold-dark transition-colors">AGB</a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-gold text-sm">Made with</span>
            <Heart className="w-4 h-4 text-rose-gold fill-rose-gold" />
            <span className="text-gold text-sm">in Austria</span>
          </div>
          <p className="text-slate-light text-xs">
            &copy; {new Date().getFullYear()} Vorja. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
