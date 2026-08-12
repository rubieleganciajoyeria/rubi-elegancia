declare module "colombia-territorial" {
  export type ColombiaMunicipality = {
    nombre: string;
    codigo_dane: string;
  };

  export type ColombiaDepartment = {
    nombre: string;
    codigo_dane: string;
    capital: string;
    municipios: ColombiaMunicipality[];
  };

  export function getDepartamentos(): ColombiaDepartment[];
}
