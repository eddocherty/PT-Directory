/**
 * Neighbourhoods and boroughs inside the biggest cities. Each gets its own page at /locations/<city>/<area>,
 * listing trainers within AREA_RADIUS miles, because "personal trainer Clapham" is how people search in London.
 * Coordinates are approximate area centres. Places that already have their own town page (Salford, Stockport) are left out.
 */
export type Area = { slug: string; name: string; city: string; lat: number; lng: number };

export const AREA_RADIUS = 3;

const a = (city: string, slug: string, name: string, lat: number, lng: number): Area => ({ city, slug, name, lat, lng });

export const AREAS: Area[] = [
  // London boroughs and well-known areas
  a("london", "city-of-london", "City of London", 51.5155, -0.0922),
  a("london", "westminster", "Westminster", 51.4975, -0.1357),
  a("london", "camden", "Camden", 51.539, -0.1426),
  a("london", "islington", "Islington", 51.5416, -0.1022),
  a("london", "hackney", "Hackney", 51.545, -0.0553),
  a("london", "tower-hamlets", "Tower Hamlets", 51.5195, -0.0597),
  a("london", "canary-wharf", "Canary Wharf", 51.5054, -0.0235),
  a("london", "shoreditch", "Shoreditch", 51.5265, -0.0798),
  a("london", "kensington-and-chelsea", "Kensington and Chelsea", 51.502, -0.1947),
  a("london", "hammersmith-and-fulham", "Hammersmith and Fulham", 51.4927, -0.2339),
  a("london", "wandsworth", "Wandsworth", 51.4571, -0.191),
  a("london", "clapham", "Clapham", 51.4618, -0.1384),
  a("london", "battersea", "Battersea", 51.4706, -0.1636),
  a("london", "lambeth", "Lambeth", 51.4900, -0.1190),
  a("london", "brixton", "Brixton", 51.4613, -0.1156),
  a("london", "southwark", "Southwark", 51.5035, -0.0804),
  a("london", "dulwich", "Dulwich", 51.4452, -0.0857),
  a("london", "lewisham", "Lewisham", 51.4452, -0.0209),
  a("london", "greenwich", "Greenwich", 51.4826, -0.0077),
  a("london", "richmond", "Richmond", 51.4613, -0.3037),
  a("london", "kingston", "Kingston upon Thames", 51.4123, -0.3007),
  a("london", "wimbledon", "Wimbledon", 51.4214, -0.2064),
  a("london", "ealing", "Ealing", 51.513, -0.3089),
  a("london", "hounslow", "Hounslow", 51.4746, -0.368),
  a("london", "brent", "Brent", 51.5588, -0.2817),
  a("london", "barnet", "Barnet", 51.6252, -0.1517),
  a("london", "haringey", "Haringey", 51.5906, -0.111),
  a("london", "crouch-end", "Crouch End", 51.5793, -0.1236),
  a("london", "stoke-newington", "Stoke Newington", 51.5617, -0.0757),
  a("london", "enfield", "Enfield", 51.6538, -0.0799),
  a("london", "walthamstow", "Walthamstow", 51.5839, -0.0199),
  a("london", "stratford", "Stratford", 51.5416, -0.0033),
  a("london", "croydon", "Croydon", 51.3762, -0.0982),
  a("london", "bromley", "Bromley", 51.4039, 0.0198),
  a("london", "harrow", "Harrow", 51.5806, -0.3416),
  a("london", "romford", "Romford", 51.5768, 0.1801),
  // Manchester
  a("manchester", "city-centre", "Manchester city centre", 53.4808, -2.2426),
  a("manchester", "ancoats", "Ancoats and Northern Quarter", 53.4846, -2.2297),
  a("manchester", "salford-quays", "Salford Quays and MediaCity", 53.4723, -2.2935),
  a("manchester", "chorlton", "Chorlton", 53.4416, -2.2768),
  a("manchester", "didsbury", "Didsbury", 53.4167, -2.2318),
  a("manchester", "sale", "Sale", 53.4245, -2.3222),
  a("manchester", "altrincham", "Altrincham", 53.3838, -2.3547),
  a("manchester", "prestwich", "Prestwich", 53.5333, -2.2833),
  a("manchester", "bury", "Bury", 53.593, -2.2966),
  a("manchester", "oldham", "Oldham", 53.5409, -2.1114),
  a("manchester", "wilmslow", "Wilmslow", 53.3254, -2.2311),
  // Birmingham
  a("birmingham", "city-centre", "Birmingham city centre", 52.4797, -1.9027),
  a("birmingham", "jewellery-quarter", "Jewellery Quarter", 52.4891, -1.9126),
  a("birmingham", "edgbaston", "Edgbaston", 52.4621, -1.9265),
  a("birmingham", "harborne", "Harborne", 52.4597, -1.9533),
  a("birmingham", "moseley", "Moseley and Kings Heath", 52.4462, -1.8893),
  a("birmingham", "sutton-coldfield", "Sutton Coldfield", 52.5633, -1.8224),
  a("birmingham", "solihull", "Solihull", 52.4118, -1.7776),
  a("birmingham", "erdington", "Erdington", 52.5236, -1.8382),
  a("birmingham", "halesowen", "Halesowen", 52.4502, -2.0509),
];

export const areasIn = (city: string) => AREAS.filter((x) => x.city === city);
export const areaBy = (city: string, slug: string) => AREAS.find((x) => x.city === city && x.slug === slug);
