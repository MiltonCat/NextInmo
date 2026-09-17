import WidgetTasadorDemo from "@/components/WidgetTasadorDemo";
import { inmobiliariaDemo } from "@/data/inmobiliariasDemo";

export const metadata = { robots: { index: false, follow: false } };

export default function TasadorDemoPage() {
  return <WidgetTasadorDemo inmobiliaria={inmobiliariaDemo("piloto")} />;
}
