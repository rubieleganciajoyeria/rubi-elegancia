import { getDepartamentos } from "colombia-territorial";

export type ColombiaLocationDepartment = {
  name: string;
  code: string;
  cities: string[];
};

export const COLOMBIA_DEPARTMENTS: ColombiaLocationDepartment[] = getDepartamentos()
  .map((department) => ({
    name: department.nombre,
    code: department.codigo_dane,
    cities: department.municipios
      .map((city) => city.nombre)
      .sort((a, b) => a.localeCompare(b, "es")),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "es"));
