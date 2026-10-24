import corolla from '../assets/cars/corolla.jpg';
import corolla2 from '../assets/cars/corolla-2.jpg';
import corollaStudio from '../assets/cars/corolla-studio.jpg';
import corollaSide from '../assets/cars/corolla-side.jpg';
import corollaRear from '../assets/cars/corolla-rear.jpg';
import sportage from '../assets/cars/sportage.jpg';
import sportageStudio from '../assets/cars/sportage-studio.jpg';
import mazda3 from '../assets/cars/mazda3.jpg';
import tucson from '../assets/cars/tucson.jpg';
import ranger from '../assets/cars/ranger.jpg';
import swift from '../assets/cars/swift.jpg';
import interior from '../assets/interior.jpg';

export const VEHICLE_TYPES = [
  { id: 'urbano', label: 'Urbanos', singular: 'Urbano' },
  { id: 'sedan', label: 'Sedanes', singular: 'Sedán' },
  { id: 'suv', label: 'SUV', singular: 'SUV' },
  { id: 'pickup', label: 'Pickups', singular: 'Pickup' },
  { id: 'deportivo', label: 'Deportivos', singular: 'Deportivo' },
  { id: 'comercial', label: 'Comerciales', singular: 'Comercial' },
];

export const BUDGETS = [
  { id: 'hasta-20', label: 'Hasta US$ 20,000', min: 0, max: 20000 },
  { id: '20-30', label: 'US$ 20,000 – 30,000', min: 20000, max: 30000, minExclusive: true },
  { id: '30-mas', label: 'Más de US$ 30,000', min: 30000, max: Infinity, minExclusive: true },
];

export const vehicles = [
  {
    id: 'toyota-corolla',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2024,
    type: 'sedan',
    condition: 'Seminuevo',
    transmission: 'Automático',
    fuel: 'Gasolina',
    km: 32000,
    price: 22900,
    image: corolla,
    gallery: [corollaStudio, corollaRear, corollaSide, interior, corolla, corolla2],
    description: [
      'El Toyota Corolla 2024 combina confiabilidad, eficiencia y un diseño moderno, siendo una excelente opción para quienes buscan un sedán versátil, cómodo y seguro para el día a día.',
      'Ofrece un manejo suave, un interior espacioso y un alto nivel de equipamiento, ideal para la ciudad y la carretera, con el respaldo de la calidad y durabilidad que caracterizan a Toyota.',
    ],
    equipment: ['Pantalla táctil 8" con Apple CarPlay y Android Auto', 'Toyota Safety Sense 3.0', 'Control crucero adaptativo', 'Cámara de retroceso', 'Faros LED', 'Climatizador automático'],
  },
  {
    id: 'kia-sportage',
    brand: 'Kia',
    model: 'Sportage',
    year: 2024,
    type: 'suv',
    condition: 'Nuevo',
    transmission: 'Automático',
    fuel: 'Gasolina',
    km: 0,
    price: 29900,
    image: sportage,
    gallery: [sportage, sportageStudio],
    description: [
      'La Kia Sportage 2024 es una SUV de diseño audaz que destaca por su tecnología, amplitud y confort en cada trayecto.',
      'Con una cabina moderna, gran capacidad de carga y sistemas de asistencia a la conducción, es ideal para familias y aventureros urbanos.',
    ],
    equipment: ['Doble pantalla panorámica', 'Sensores de estacionamiento', 'Asistente de mantenimiento de carril', 'Cargador inalámbrico', 'Llantas de aleación 18"', 'Portón trasero eléctrico'],
  },
  {
    id: 'mazda-3',
    brand: 'Mazda',
    model: '3',
    year: 2024,
    type: 'sedan',
    condition: 'Seminuevo',
    transmission: 'Automático',
    fuel: 'Gasolina',
    km: 18500,
    price: 25900,
    image: mazda3,
    gallery: [mazda3],
    description: [
      'El Mazda 3 2024 ofrece un diseño elegante inspirado en la filosofía Kodo y una experiencia de manejo dinámica y precisa.',
      'Su interior de alta calidad y su motor Skyactiv lo convierten en un sedán premium a un precio accesible.',
    ],
    equipment: ['Head-up display', 'Sistema de audio Bose', 'Asientos de cuero', 'Monitor de punto ciego', 'Faros LED adaptativos', 'Encendido sin llave'],
  },
  {
    id: 'hyundai-tucson',
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2024,
    type: 'suv',
    condition: 'Nuevo',
    transmission: 'Automático',
    fuel: 'Híbrido',
    km: 0,
    price: 30900,
    image: tucson,
    gallery: [tucson],
    description: [
      'La Hyundai Tucson 2024 sorprende con su diseño paramétrico y una propuesta híbrida eficiente para el uso diario.',
      'Espaciosa, conectada y segura, es la compañera ideal para quienes buscan una SUV moderna con bajo consumo.',
    ],
    equipment: ['Tren motriz híbrido', 'Cluster digital 10.25"', 'Frenado autónomo de emergencia', 'Techo panorámico', 'Cámara 360°', 'Asientos ventilados'],
  },
  {
    id: 'ford-ranger',
    brand: 'Ford',
    model: 'Ranger',
    year: 2024,
    type: 'pickup',
    condition: 'Seminuevo',
    transmission: 'Automático',
    fuel: 'Diésel',
    km: 24000,
    price: 37900,
    image: ranger,
    gallery: [ranger],
    description: [
      'La Ford Ranger 2024 es una pickup robusta y capaz, preparada para el trabajo pesado y las aventuras fuera de la ciudad.',
      'Con tracción 4x4, gran capacidad de remolque y una cabina tecnológica, combina fuerza y confort en un solo vehículo.',
    ],
    equipment: ['Tracción 4x4', 'Pantalla SYNC 4A de 12"', 'Capacidad de remolque 3,500 kg', 'Control de descenso', 'Barras antivuelco', 'Cámara 360°'],
  },
  {
    id: 'suzuki-swift',
    brand: 'Suzuki',
    model: 'Swift',
    year: 2024,
    type: 'urbano',
    condition: 'Nuevo',
    transmission: 'Manual',
    fuel: 'Gasolina',
    km: 0,
    price: 15900,
    image: swift,
    gallery: [swift],
    description: [
      'El Suzuki Swift 2024 es un hatchback ágil y eficiente, perfecto para moverse con facilidad por la ciudad.',
      'Su bajo consumo, tamaño compacto y equipamiento completo lo hacen ideal como primer auto o para el día a día.',
    ],
    equipment: ['Pantalla táctil 7"', 'Aire acondicionado', '6 airbags', 'Control de estabilidad', 'Sensores de retroceso', 'Llantas de aleación 16"'],
  },
];

export const BRANDS = [...new Set(vehicles.map((v) => v.brand))].sort();
export const YEARS = [...new Set(vehicles.map((v) => v.year))].sort((a, b) => b - a);

export const getVehicle = (id) => vehicles.find((v) => v.id === id);
export const typeLabel = (id) => VEHICLE_TYPES.find((t) => t.id === id)?.singular ?? id;
export const vehicleName = (v) => `${v.brand} ${v.model}`;
export const formatPrice = (n) => n.toLocaleString('en-US');
