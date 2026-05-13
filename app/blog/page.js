import Link from "next/link";

export const metadata = {
  title: "Blog | Catalán Propiedades",
  description: "Artículos sobre inversión inmobiliaria, mercado en la Patagonia y guías para comprar o alquilar en San Martín de los Andes.",
};

const articles = [
  { id: 1, title: "Cómo invertir en bienes raíces en 2026: Guía completa para principiantes", excerpt: "Todo lo que necesitás saber para comenzar a construir patrimonio inmobiliario desde cero.", category: "Inversiones", image: "https://images.unsplash.com/photo-1560520653-9e180e2f8c1e?w=800&q=80", date: "15 Mar 2026", readTime: "8 min", author: "Milton Catalán" },
  { id: 2, title: "El mercado inmobiliario en la Patagonia: Análisis y perspectivas", excerpt: "El crecimiento de San Martín de los Andes y por qué todos miran al sur.", category: "Mercado", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", date: "10 Mar 2026", readTime: "12 min", author: "Milton Catalán" },
  { id: 3, title: "Top 7 barrios para invertir en Argentina", excerpt: "Las zonas con mayor potencial de rendimiento inmobiliario hoy.", category: "Tendencias", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", date: "5 Mar 2026", readTime: "6 min", author: "Catalán Propiedades" },
  { id: 4, title: "Guía completa para comprar tu primera propiedad", excerpt: "Todo lo que necesitás saber antes de dar el paso.", category: "Guía", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa0?w=800&q=80", date: "1 Mar 2026", readTime: "15 min", author: "Milton Catalán" },
  { id: 5, title: "Por qué la Patagonia es el nuevo hotspot inmobiliario", excerpt: "Inversores de todo el país miran hacia el sur.", category: "Mercado", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", date: "25 Feb 2026", readTime: "7 min", author: "Milton Catalán" },
  { id: 6, title: "Estrategias para maximizar tu inversión inmobiliaria", excerpt: "Cómo sacarle el mayor provecho a tu capital en el mercado actual.", category: "Inversiones", image: "https://images.unsplash.com/photo-1560448204-e02f11c7d910?w=800&q=80", date: "20 Feb 2026", readTime: "5 min", author: "Milton Catalán" },
  { id: 7, title: "Sectores emergentes en la Patagonia que debés conocer", excerpt: "Nuevas zonas de inversión en auge más allá de San Martín de los Andes.", category: "Tendencias", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", date: "18 Feb 2026", readTime: "4 min", author: "Catalán Propiedades" },
  { id: 8, title: "Crédito hipotecario: Opciones disponibles en Argentina", excerpt: "Comparativa de alternativas de financiamiento para comprar tu propiedad.", category: "Guía", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", date: "15 Feb 2026", readTime: "9 min", author: "Catalán Propiedades" },
];

const categoryColors = {
  Inversiones: "bg-emerald-100 text-emerald-800",
  Mercado: "bg-blue-100 text-blue-800",
  Tendencias: "bg-purple-100 text-purple-800",
  Guía: "bg-amber-100 text-amber-800",
};

export default function BlogPage() {
  const [featured, ...rest] = articles;

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-24 pb-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-rose-600 text-sm font-bold tracking-widest uppercase mb-3">Blog</p>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Inversión y mercado inmobiliario</h1>
          <p className="text-gray-500 text-base max-w-xl">Análisis, guías y tendencias del mercado inmobiliario en San Martín de los Andes y la Patagonia.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/blog/${featured.id}`} className="group block mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative h-72 lg:h-96 overflow-hidden rounded-2xl bg-gray-200">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${categoryColors[featured.category]}`}>
                {featured.category}
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors mb-3 leading-tight">
                {featured.title}
              </h2>
              <p className="text-gray-500 mb-4 leading-relaxed">{featured.excerpt}</p>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{featured.author}</span>
                <span>·</span>
                <span>{featured.date}</span>
                <span>·</span>
                <span>{featured.readTime} de lectura</span>
              </div>
            </div>
          </div>
        </Link>

        <div className="border-t border-gray-100 pt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-8">Más artículos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((article) => (
              <Link key={article.id} href={`/blog/${article.id}`} className="group block">
                <div className="relative h-48 overflow-hidden rounded-xl bg-gray-200 mb-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${categoryColors[article.category]}`}>
                    {article.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.readTime} de lectura</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">¿Tenés alguna consulta?</h2>
          <p className="text-gray-500 mb-6">Nuestro equipo puede orientarte sobre inversiones en la Patagonia.</p>
          <Link
            href="/contacto"
            className="inline-block bg-rose-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-rose-500 transition-colors shadow-lg"
          >
            Contactanos
          </Link>
        </div>
      </div>
    </div>
  );
}
