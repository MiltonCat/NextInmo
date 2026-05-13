import BlogPostClient from "@/components/BlogPostClient";

const articles = [
  { id: 1, title: "Cómo invertir en bienes raíces en 2026: Guía completa para principiantes", category: "Inversiones", image: "https://images.unsplash.com/photo-1560520653-9e180e2f8c1e?w=1200&q=80", date: "15 Mar 2026", readTime: "8 min", author: "Milton Catalan" },
  { id: 2, title: "El mercado inmobiliario en la Patagonia: Análisis y perspectivas", category: "Mercado", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80", date: "10 Mar 2026", readTime: "12 min", author: "Milton Catalan" },
  { id: 3, title: "Top 7 barrios para invertir en Argentina", category: "Tendencias", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80", date: "5 Mar 2026", readTime: "6 min", author: "Catalan Propiedades" },
  { id: 4, title: "Guía completa para comprar tu primera propiedad", category: "Guía", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa0?w=1200&q=80", date: "1 Mar 2026", readTime: "15 min", author: "Milton Catalan" },
  { id: 5, title: "Por qué la Patagonia es el nuevo hotspot inmobiliario", category: "Mercado", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80", date: "25 Feb 2026", readTime: "7 min", author: "Milton Catalan" },
  { id: 6, title: "Estrategias para maximizar tu inversión inmobiliaria", category: "Inversiones", image: "https://images.unsplash.com/photo-1560448204-e02f11c7d910?w=1200&q=80", date: "20 Feb 2026", readTime: "5 min", author: "Milton Catalan" },
  { id: 7, title: "Sectores emergentes en la Patagonia que debes conocer", category: "Tendencias", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80", date: "18 Feb 2026", readTime: "4 min", author: "Catalan Propiedades" },
  { id: 8, title: "Crédito hipotecario: Opciones disponibles en Argentina", category: "Guía", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80", date: "15 Feb 2026", readTime: "9 min", author: "Catalan Propiedades" },
];

export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = articles.find((a) => a.id === parseInt(id));
  if (!article) return { title: "Artículo no encontrado | Catalan Propiedades" };
  return {
    title: `${article.title} | Catalan Propiedades`,
    description: `${article.category} · ${article.readTime} de lectura · Por ${article.author}`,
    openGraph: {
      title: article.title,
      images: [article.image],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { id } = await params;
  return <BlogPostClient id={id} />;
}
