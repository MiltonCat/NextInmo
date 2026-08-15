// Tiene que imitar la forma de PropertyCard: si el esqueleto muestra una caja
// con sombra y la tarjeta real no la tiene, la grilla "salta" al cargar.
export default function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[16/10] w-full rounded-xl bg-gray-200" />
      <div className="pt-3">
        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
        <div className="mb-1.5 h-3.5 w-1/2 rounded bg-gray-200" />
        <div className="mb-1.5 h-3.5 w-2/3 rounded bg-gray-200" />
        <div className="mt-3 h-4 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}
