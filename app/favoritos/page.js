import FavoritosClient from "./FavoritosClient";
import { getProperties } from "@/lib/properties";

export const revalidate = 300;

export default async function FavoritosPage() {
  const properties = await getProperties();
  return <FavoritosClient properties={properties} />;
}
