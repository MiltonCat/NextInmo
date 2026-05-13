import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import InvestmentMapClient from "@/components/InvestmentMapClient";
import { properties } from "@/data/properties";

export const metadata = {
  title: "Catalán Propiedades | Inmobiliaria en San Martín de los Andes",
  description: "Venta de propiedades, alquileres permanentes y asesoría en inversiones inmobiliarias en San Martín de los Andes, Patagonia. +10 años de experiencia.",
};

export default function Home() {
  const featuredProperties = properties.slice(0, 3);

  return (
    <div>
      <Hero />

      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          Propiedades Destacadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/propiedades"
            className="inline-block bg-rose-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-rose-500 transition shadow-lg"
          >
            Ver todas las propiedades
          </Link>
        </div>
      </section>

      {/* Sección de Confianza y Autoridad */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-rose-600 text-sm font-bold tracking-widest uppercase mb-3">Trayectoria y Confianza</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Conocemos cada barrio, cada precio y cada oportunidad de San Martín de los Andes.
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Milton Catalán lleva más de 10 años operando en el mercado inmobiliario de San Martín de los Andes. Cada propiedad que publicamos fue revisada en persona. Cada precio fue validado con datos reales del mercado local.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Seguridad Jurídica</p>
                    <p className="text-sm text-gray-500">Operaciones transparentes.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Visión de Inversión</p>
                    <p className="text-sm text-gray-500">Maximizamos tu retorno.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/portada.jpg"
                  alt="San Martín de los Andes — Catalán Propiedades"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl hidden md:block">
                <p className="text-rose-600 text-3xl font-bold mb-1">100%</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Atención Personalizada</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InvestmentMapClient />
    </div>
  );
}
