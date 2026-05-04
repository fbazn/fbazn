import { notFound } from "next/navigation";
import { getSupplierWithProducts } from "@/app/actions/suppliers";
import SupplierDetailClient from "./SupplierDetailClient";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getSupplierWithProducts(id);
  if (!result) notFound();

  const { supplier, links } = result;

  return <SupplierDetailClient supplier={supplier} links={links} />;
}
