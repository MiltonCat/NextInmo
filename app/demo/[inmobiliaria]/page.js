import { notFound } from "next/navigation";
import WidgetTasadorDemo from "@/components/WidgetTasadorDemo";
import { inmobiliariaDemo } from "@/data/inmobiliariasDemo";

export const metadata = { robots: { index: false, follow: false } };

export default async function DemoInmobiliariaPage({ params }) {
  const { inmobiliaria: slug } = await params;
  const inmobiliaria = inmobiliariaDemo(slug);
  if (!inmobiliaria) notFound();
  return <WidgetTasadorDemo inmobiliaria={inmobiliaria} />;
}
