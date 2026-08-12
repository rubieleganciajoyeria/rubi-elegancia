export type ShippingCityRate = {
  department: string;
  city: string;
  price: number;
};

export type ShippingSettings = {
  free_shipping_min?: number;
  default_shipping_price?: number;
  shipping_city_rates?: ShippingCityRate[];
};

const DEFAULT_FREE_SHIPPING_MIN = 500_000;
const DEFAULT_SHIPPING_PRICE = 25_000;

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function calculateShipping(
  subtotal: number,
  city: string,
  department: string,
  settings: ShippingSettings | null | undefined,
) {
  if (subtotal <= 0) return 0;

  const freeShippingMin = Number(settings?.free_shipping_min ?? DEFAULT_FREE_SHIPPING_MIN);
  if (freeShippingMin > 0 && subtotal >= freeShippingMin) return 0;

  const cityKey = normalizeLocation(city);
  const departmentKey = normalizeLocation(department);
  const cityRate = (settings?.shipping_city_rates ?? []).find(
    (rate) =>
      normalizeLocation(rate.city) === cityKey &&
      normalizeLocation(rate.department) === departmentKey,
  );

  return Number(cityRate?.price ?? settings?.default_shipping_price ?? DEFAULT_SHIPPING_PRICE);
}

export function splitStoredCity(value: string) {
  const [city = "", department = ""] = value.split(",").map((part) => part.trim());
  return { city, department };
}
