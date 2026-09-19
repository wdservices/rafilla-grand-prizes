import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  UserCheck,
  FileCheck2,
  PackagePlus,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Eye,
  EyeOff,
  ShieldCheck,
  Building,
  Check,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { partnerStore } from "@/lib/partner-store";
import { setFirebaseSession } from "@/lib/auth-store";
import { registerWithEmail, createUserProfile } from "@/lib/firebase-auth";
import { useAuthSession } from "@/hooks/useAuthSession";
import { formatNaira, cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  "Automotive & Dealership",
  "Real Estate & Property Development",
  "Consumer Electronics & Computing",
  "Luxury Watches & Horology",
  "Fine Jewelry & Precious Metals",
  "Marine, Yachts & Aviation",
  "Hospitality & Luxury Travel",
  "Art, Antiques & Collectibles",
  "Other Premium Goods",
];

const ASSET_CATEGORIES = [
  "Automotive",
  "Real Estate",
  "Electronics",
  "Watches",
  "Jewelry",
  "Lifestyle & Travel",
];

const AFRICAN_COUNTRIES: Record<string, string[]> = {
  "Algeria": [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
    "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
    "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda",
    "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem",
    "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj",
    "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
    "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
    "Ghardaïa", "Relizane", "El M'Ghair", "El Meniaa", "Ouled Djellal",
    "Bordj Badji Mokhtar", "Béni Abbès", "Timimoun", "Touggourt", "Djanet",
    "In Salah", "In Guezzam",
  ],
  "Angola": [
    "Bengo", "Benguela", "Bié", "Cabinda", "Cuando-Cubango", "Cuanza Norte",
    "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Icolo e Bengo", "Luanda",
    "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire",
  ],
  "Benin": [
    "Alibori", "Atakora", "Atlantique", "Borgou", "Collines", "Couffo",
    "Donga", "Littoral", "Mono", "Ouémé", "Plateau", "Zou",
  ],
  "Botswana": [
    "Central", "Ghanzi", "Kgalagadi", "Kgatleng", "Kweneng", "North-East",
    "North-West", "South-East", "Southern",
  ],
  "Burkina Faso": [
    "Boucle du Mouhoun", "Cascades", "Centre", "Centre-Est", "Centre-Nord",
    "Centre-Ouest", "Centre-Sud", "Est", "Hauts-Bassins", "Nord", "Plateau-Central",
    "Sahel", "Sud-Ouest",
  ],
  "Burundi": [
    "Bujumbura Mairie", "Bujumbura Rural", "Bururi", "Cankuzo", "Cibitoke",
    "Gitega", "Karuzi", "Kayanza", "Kirundo", "Makamba", "Muramvya",
    "Muyinga", "Mwaro", "Ngozi", "Rumonge", "Rutana", "Ruyigi",
  ],
  "Cabo Verde": [
    "Boa Vista", "Brava", "Fogo", "Maio", "Sal", "Santiago",
    "Santo Antão", "São Nicolau", "São Vicente",
  ],
  "Cameroon": [
    "Adamaoua", "Centre", "East", "Far North", "Littoral", "North",
    "North-West", "South", "South-West", "West",
  ],
  "Central African Republic": [
    "Bamingui-Bangoran", "Bangui", "Basse-Kotto", "Haut-Kotto", "Haut-Mbomou",
    "Kémo", "Lobaye", "Mambéré-Kadéï", "Mbomou", "Nana-Grébizi",
    "Nana-Mambéré", "Ombella-M'Poko", "Ouham", "Ouham-Pendé", "Sangha-Mbaéré",
    "Vakaga",
  ],
  "Chad": [
    "Bahr el Gazel", "Batha", "Borkou", "Chari-Baguirmi", "Ennedi-Est",
    "Ennedi-Ouest", "Guéra", "Hadjer-Lamis", "Kanem", "Lac", "Logone-Occidental",
    "Logone-Oriental", "Mandoul", "Mayo-Kebbi-Est", "Mayo-Kebbi-Ouest",
    "Moyen-Chari", "N'Djamena", "Ouaddaï", "Tandjilé", "Tibesti", "Wadi Fira",
  ],
  "Comoros": [
    "Grande Comore (Ngazidja)", "Anjouan (Ndzuwani)", "Mohéli (Mwali)",
  ],
  "Congo (Republic)": [
    "Brazzaville", "Pointe-Noire", "Pool", "Plateaux", "Cuvette",
    "Cuvette-Ouest", "Kouilou", "Likouala", "Lékoumou", "Niari", "Sangha",
  ],
  "Democratic Republic of the Congo": [
    "Kinshasa", "Kongo-Central", "Kwango", "Kwilu", "Kasaï", "Kasaï-Central",
    "Kasaï-Oriental", "Lomami", "Sankuru", "Maniema", "Haut-Uélé", "Tshopo",
    "Bas-Uélé", "Nord-Uélé", "Ituri", "Nord-Kivu", "Sud-Kivu", "Maniema",
    "Tanganyika", "Haut-Lomami", "Lualaba", "Haut-Katanga",
  ],
  "Djibouti": [
    "Djibouti", "Ali Sabieh", "Dikhil", "Obock", "Tadjourah",
  ],
  "Egypt": [
    "Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo",
    "Dakahlia", "Damietta", "Fayoum", "Gharbia", "Giza", "Ismailia",
    "Kafr El Sheikh", "Luxor", "Matruh", "Minya", "Monufia", "New Valley",
    "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea", "Sharqia",
    "Sohag", "South Sinai", "Suez",
  ],
  "Equatorial Guinea": [
    "Annobón", "Bioko Norte", "Bioko Sur", "Centro Sur", "Kie-Ntem",
    "Litoral", "Wele-Nzas",
  ],
  "Eritrea": [
    "Anseba", "Central", "Southern Red Sea", "Gash-Barka", "Northern Red Sea",
    "Southern",
  ],
  "Eswatini": [
    "Hhohho", "Lubombo", "Manzini", "Shiselweni",
  ],
  "Ethiopia": [
    "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa",
    "Gambela", "Harari", "Oromia", "Sidama", "SNNPR", "Somali",
    "South West Ethiopia Peoples'", "Tigray",
  ],
  "Gabon": [
    "Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga",
    "Ogooué-Ivindo", "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem",
  ],
  "Gambia": [
    "Banjul", "Central River", "Lower River", "North Bank", "Upper River", "West Coast",
  ],
  "Ghana": [
    "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
    "Greater Accra", "North East", "Northern", "Oti", "Savannah",
    "Upper East", "Upper West", "Volta", "Western", "Western North",
  ],
  "Guinea": [
    "Boké", "Conakry", "Faranah", "Kankan", "Kindia", "Labé", "Mamou", "Nzérékoré",
  ],
  "Guinea-Bissau": [
    "Bafatá", "Biombo", "Bissau", "Bolama", "Cacheu", "Gabú",
    "Oio", "Quinara", "Tombali",
  ],
  "Ivory Coast": [
    "Abidjan", "Bas-Sassandra", "Comoé", "Denguélé", "Gôh-Djiboua",
    "Lacs", "Lagunes", "Montagnes", "Sassandra-Marahoué", "Savanes",
    "Vallée du Bandama", "Woroba", "Yamoussoukro", "Zanzan",
  ],
  "Kenya": [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu",
    "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho",
    "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui",
    "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
    "Marsabit", "Meru", "Migori", "Murang'a", "Nairobi", "Nakuru",
    "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu",
    "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", "Trans-Nzoia",
    "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
  ],
  "Lesotho": [
    "Berea", "Butha-Buthe", "Leribe", "Mafeteng", "Maseru",
    "Mohale's Hoek", "Mokhotlong", "Qacha's Nek", "Quthing", "Thaba-Tseka",
  ],
  "Liberia": [
    "Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount",
    "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland",
    "Montserrado", "Nimba", "River Cess", "River Gee", "Sinoe",
  ],
  "Libya": [
    "Al Butnan", "Al Jabal al Akhdar", "Al Jabal al Gharbi", "Al Kufrah",
    "Al Marj", "Al Marqab", "Al Wahat", "Benghazi", "Derna", "Ghat",
    "Jafara", "Jufra", "Kufra", "Murqub", "Murzuq", "Nalut",
    "Sabha", "Sirte", "Tripoli", "Wadi Al Hayaa", "Wadi Al Shati",
    "Zawiya",
  ],
  "Madagascar": [
    "Antananarivo", "Antsiranana", "Fianarantsoa", "Mahajanga",
    "Toamasina", "Toliara",
  ],
  "Malawi": [
    "Balaka", "Blantyre", "Chikwawa", "Chitipa", "Dedza", "Dowa",
    "Karonga", "Kasungu", "Likoma", "Lilongwe", "Machinga", "Mangochi",
    "Mchinji", "Mulanje", "Mwanza", "Mzimba", "Neno", "Ntcheu",
    "Nkhata Bay", "Nkhotakota", "Nsanje", "Ntchisi", "Phalombe",
    "Rumphi", "Salima", "Thyolo", "Zomba",
  ],
  "Mali": [
    "Bamako", "Gao", "Kayes", "Kidal", "Koulikoro", "Mopti",
    "Ségou", "Sikasso", "Tombouctou",
  ],
  "Mauritania": [
    "Adrar", "Assaba", "Brakna", "Dakhlet Nouadhibou", "Gorgol",
    "Guidimaka", "Inchiri", "Nouakchott-Nord", "Nouakchott-Ouest",
    "Nouakchott-Sud", "Tagant", "Tiris Zemmour", "Trarza",
  ],
  "Mauritius": [
    "Agalega Islands", "Black River", "Flacq", "Grand Port",
    "Moka", "Pamplemousses", "Plaines Wilhems", "Port Louis",
    "Rivière Noire", "Rodrigues", "Savanne",
  ],
  "Morocco": [
    "Beni Mellal-Khenifra", "Casablanca-Settat", "Dakhla-Oued Ed-Dahab",
    "Drâa-Tafilalet", "Fès-Meknès", "Guelmim-Oued Noun",
    "Laâyoune-Sakia El Hamra", "Marrakech-Safi", "Oriental",
    "Rabat-Salé-Kénitra", "Souss-Massa", "Tanger-Tétouan-Al Hoceïma",
  ],
  "Mozambique": [
    "Cabo Delgado", "Gaza", "Inhambane", "Manica", "Maputo",
    "Maputo City", "Nampula", "Niassa", "Sofala", "Tete", "Zambézia",
  ],
  "Namibia": [
    "Erongo", "Hardap", "Karas", "Kavango East", "Kavango West",
    "Khomas", "Kunene", "Ohangwena", "Omaheke", "Omusati",
    "Oshana", "Oshikoto", "Otjozondjupa", "Zambezi",
  ],
  "Niger": [
    "Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillabéri", "Zinder",
  ],
  "Nigeria": [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
    "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
    "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
    "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  ],
  "Rwanda": [
    "Eastern Province", "Kigali", "Northern Province", "Southern Province", "Western Province",
  ],
  "São Tomé and Príncipe": [
    "Água Grande", "Cantagalo", "Lembá", "Lembá", "Príncipe", "São Tomé",
  ],
  "Senegal": [
    "Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou",
    "Kolda", "Louga", "Matam", "Saint-Louis", "Sédhiou", "Tambacounda",
    "Thiès", "Ziguinchor",
  ],
  "Seychelles": [
    "Anse Boileau", "Anse Royale", "Beau Vallon", "Bel Ombre",
    "Cascade", "English River", "Glacis", "Grand Anse Mahe",
    "Grand Anse Praslin", "La Digue", "La Rivière Anglaise",
    "Les Mamelles", "Mont Buxton", "Mont Fleuri", "Plaisance",
    "Pointe La Rue", "Port Glaud", "Takamaka",
  ],
  "Sierra Leone": [
    "Eastern Province", "North Western Province", "Northern Province",
    "Southern Province", "Western Area",
  ],
  "Somalia": [
    "Awdal", "Bakool", "Banaadir", "Bari", "Bay", "Galguduud",
    "Gedo", "Hiraan", "Lower Juba", "Lower Shabelle",
    "Middle Juba", "Middle Shabelle", "Mudug", "Nugaal",
    "Sanaag", "Sool", "Togdheer", "Woqooyi Galbeed",
  ],
  "South Africa": [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
    "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape",
  ],
  "South Sudan": [
    "Central Equatoria", "Eastern Equatoria", "Jonglei", "Lakes",
    "Northern Bahr el Ghazal", "Unity", "Upper Nile", "Warrap",
    "Western Bahr el Ghazal", "Western Equatoria",
  ],
  "Sudan": [
    "Al Jazirah", "Al Qadarif", "Blue Nile", "Central Darfur",
    "East Darfur", "Gedaref", "Gezira", "Kassala",
    "Khartoum", "North Darfur", "North Kordofan", "Northern",
    "Red Sea", "River Nile", "Sennar", "South Darfur",
    "South Kordofan", "West Darfur", "West Kordofan", "White Nile",
  ],
  "Tanzania": [
    "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera",
    "Katavi", "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara",
    "Mbeya", "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North",
    "Pemba South", "Rukwa", "Ruvuma", "Shinyanga", "Simiyu", "Singida",
    "Songwe", "Tabora", "Tanga", "Zanzibar North", "Zanzibar South",
    "Zanzibar Urban West",
  ],
  "Togo": [
    "Centrale", "Kara", "Maritime", "Plateaux", "Savanes",
  ],
  "Tunisia": [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
    "Jendouba", "Kairouan", "Kasserine", "Kebili", "Kef",
    "Mahdia", "Manouba", "Médénine", "Monastir", "Nabeul",
    "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine",
    "Tozeur", "Tunis", "Zaghouan",
  ],
  "Uganda": [
    "Abim", "Adjumani", "Amolatar", "Amudat", "Amuria", "Amuru",
    "Apac", "Arua", "Budaka", "Bugiri", "Buhweju", "Buikwe",
    "Bukedea", "Bukomansimbi", "Bulambuli", "Bundibugyo", "Bushenyi",
    "Busiki", "Busia", "Butaleja", "Butambala", "Buvuma", "Buyende",
    "Dokolo", "Gomba", "Gulu", "Hoima", "Ibanda", "Iganga",
    "Isingiro", "Jinja", "Kaabong", "Kabale", "Kabarole", "Kaberamaido",
    "Kalangala", "Kaliro", "Kampala", "Kamuli", "Kamwenge", "Kanungu",
    "Kapchorwa", "Kasese", "Katakwi", "Kayunga", "Kazo", "Kibale",
    "Kiboga", "Kyejojo", "Kiruhura", "Kiryandongo", "Kisoro", "Kitgum",
    "Koboko", "Kotido", "Kumi", "Kween", "Kyankwanzi", "Kyotera",
    "Lira", "Luuka", "Luwero", "Lwengo", "Lyantonde", "Manafwa",
    "Maracha", "Masaka", "Masindi", "Mayuge", "Mbale", "Mbarara",
    "Mitooma", "Mityana", "Moroto", "Moyo", "Mpigi", "Mubende",
    "Mukono", "Nakapiripirit", "Nakaseke", "Nakasongola", "Namayingo",
    "Namutumba", "Napak", "Nebbi", "Ntungamo", "Nwoya", "Otuke",
    "Oyam", "Pader", "Pallisa", "Rakai", "Rubirizi", "Rukungiri",
    "Sembabule", "Serere", "Sheema", "Sironko", "Soroti", "Tororo",
    "Wakiso", "Yumbe",
  ],
  "Zambia": [
    "Central", "Copperbelt", "Eastern", "Luapula", "Lusaka",
    "Muchinga", "Northern", "North-Western", "Southern", "Western",
  ],
  "Zimbabwe": [
    "Bulawayo", "Harare", "Manicaland", "Mashonaland Central",
    "Mashonaland East", "Mashonaland West", "Masvingo",
    "Matabeleland North", "Matabeleland South", "Midlands",
  ],
};

function getStatesForCountry(c: string): string[] {
  return AFRICAN_COUNTRIES[c] || [];
}

const STEPS = [
  { id: 1, title: "Business", icon: Building2 },
  { id: 2, title: "Rep & Docs", icon: UserCheck },
  { id: 3, title: "First Asset", icon: PackagePlus },
  { id: 4, title: "Account", icon: Lock },
];

export function PartnerOnboardingForm() {
  const navigate = useNavigate();
  const { session, isAuthenticated } = useAuthSession();
  const [bypassActiveCheck, setBypassActiveCheck] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPartner, setSubmittedPartner] = useState<{
    id: string;
    businessName: string;
    email: string;
  } | null>(null);

  // Business Info
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Automotive & Dealership");
  const [cacNumber, setCacNumber] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [state, setState] = useState("Lagos");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  // Representative
  const [repName, setRepName] = useState("");
  const [repPosition, setRepPosition] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [repPhone, setRepPhone] = useState("");

  // Documents
  const [cacDocUploaded, setCacDocUploaded] = useState(true);
  const [addressDocUploaded, setAddressDocUploaded] = useState(true);
  const [dealershipDocUploaded, setDealershipDocUploaded] = useState(false);

  // Asset
  const [assetName, setAssetName] = useState("");
  const [assetCategory, setAssetCategory] = useState("Automotive");
  const [assetDescription, setAssetDescription] = useState("");
  const [declaredValueNaira, setDeclaredValueNaira] = useState("");
  const [assetLocation, setAssetLocation] = useState("");
  const [assetCondition, setAssetCondition] = useState<"Brand new" | "Like new" | "Refurbished">(
    "Brand new",
  );
  const [referenceNumber, setReferenceNumber] = useState("");

  // Account
  const [accountPassword, setAccountPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};

    if (step === 1) {
      if (!businessName.trim()) e.businessName = "Company name is required";
      if (!cacNumber.trim()) e.cacNumber = "CAC number is required";
      if (!address.trim()) e.address = "Business address is required";
      if (!companyEmail.trim()) e.companyEmail = "Company email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail))
        e.companyEmail = "Enter a valid email";
      if (!companyPhone.trim()) e.companyPhone = "Phone number is required";
      if (!description.trim()) e.description = "Business description is required";
    } else if (step === 2) {
      if (!repName.trim()) e.repName = "Representative name is required";
      if (!repPosition.trim()) e.repPosition = "Position is required";
      if (!repEmail.trim()) e.repEmail = "Email is required";
      if (!repPhone.trim()) e.repPhone = "Phone is required";
      if (!cacDocUploaded) e.cacDoc = "CAC certificate is required";
      if (!addressDocUploaded) e.addressDoc = "Proof of address is required";
    } else if (step === 3) {
      if (!assetName.trim()) e.assetName = "Asset name is required";
      if (!assetDescription.trim()) e.assetDescription = "Description is required";
      if (!declaredValueNaira || Number(declaredValueNaira) <= 0)
        e.declaredValue = "Enter a valid value";
      if (!assetLocation.trim()) e.assetLocation = "Location is required";
    } else if (step === 4) {
      if (!accountPassword) e.password = "Password is required";
      else if (accountPassword.length < 8) e.password = "Minimum 8 characters";
      if (accountPassword !== confirmPassword) e.confirmPassword = "Passwords do not match";
      if (!agreeTerms) e.agreeTerms = "You must agree to the terms";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1 && !repEmail) {
        setRepEmail(companyEmail);
        setRepPhone(companyPhone);
      }
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fill in required fields");
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitApplication = async () => {
    if (!agreeTerms || !validateStep(4)) {
      if (!agreeTerms) {
        toast.error("Please agree to the Terms of Service");
      }
      setCurrentStep(4);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const valKobo = Math.round(Number(declaredValueNaira || 0) * 100);
      const authEmail = repEmail || companyEmail;

      let firebaseUid = "";

      try {
        const cred = await registerWithEmail(authEmail, accountPassword);
        firebaseUid = cred.user.uid;

        await createUserProfile(firebaseUid, {
          email: authEmail,
          firstName: repName.split(" ")[0] || "Partner",
          lastName: repName.split(" ").slice(1).join(" ") || "Admin",
          handle: businessName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_")
            .slice(0, 20),
          phone: repPhone || companyPhone,
          avatarMonogram: businessName.slice(0, 2).toUpperCase(),
          role: "partner",
          isAdmin: false,
          verified: false,
        });
      } catch (authErr: any) {
        console.warn("Firebase Auth creation failed:", authErr?.message);
        firebaseUid = `local_${Date.now().toString(36)}`;
      }

      const result = await partnerStore.registerPartnerApplication({
        userId: firebaseUid,
        businessName,
        businessType,
        cacNumber,
        address,
        city: state,
        state,
        country,
        companyEmail,
        companyPhone,
        website,
        description,
        authorizedRepresentative: {
          fullName: repName,
          position: repPosition,
          email: repEmail,
          phone: repPhone,
        },
        documents: {
          cacCertificate: `https://secure-docs.raffila.internal/cac/${cacNumber.replace(/[^a-zA-Z0-9]/g, "")}.pdf`,
          proofOfAddress: `https://secure-docs.raffila.internal/utility/${state.toLowerCase()}-address.pdf`,
          additionalDocument: dealershipDocUploaded
            ? `https://secure-docs.raffila.internal/auth/partner-license.pdf`
            : undefined,
        },
        initialAsset: {
          name: assetName,
          category: assetCategory,
          description: assetDescription,
          declaredValueKobo: valKobo,
          location: assetLocation,
          condition: assetCondition,
          referenceNumber: referenceNumber || undefined,
          images: [],
        },
      });

      const partnerUser = {
        id: `firebase_${firebaseUid}`,
        role: "partner" as const,
        firstName: repName.split(" ")[0] || "Partner",
        lastName: repName.split(" ").slice(1).join(" ") || "Admin",
        handle: businessName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_")
          .slice(0, 20),
        email: authEmail,
        phone: repPhone || companyPhone,
        avatarMonogram: businessName.slice(0, 2).toUpperCase(),
        verified: false,
        tagline: `${businessName} · Pending Review`,
        partnerId: result.partner.id,
        businessName: result.partner.businessName,
      };

      setFirebaseSession(partnerUser, true);

      setSubmittedPartner({
        id: result.partner.id,
        businessName: result.partner.businessName,
        email: authEmail,
      });

      toast.success("Application Submitted!", {
        description: `Welcome ${businessName}! Opening your Partner Dashboard...`,
      });

      navigate({ to: "/partner" });
    } catch (err: any) {
      toast.error("Submission failed", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingPartnerProfile = session?.user?.partnerId
    ? partnerStore.getPartnerById(session.user.partnerId)
    : session?.user?.uid
      ? partnerStore.getAllPartners().find((p) => p.userId === session.user.uid)
      : null;

  if (
    isAuthenticated &&
    session?.user?.role === "partner" &&
    existingPartnerProfile &&
    !bypassActiveCheck &&
    !submittedPartner
  ) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
        <Card className="rounded-[32px] border-0 bg-white p-8 ring-1 ring-ink/10 shadow-lg">
          <div className="grid size-16 mx-auto place-items-center rounded-2xl bg-mint/20 text-mint-700 mb-6">
            <Check className="size-7 stroke-[2.5]" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink">
            You&apos;re already a registered partner
          </h2>
          <p className="mt-2 text-sm text-ink/60 max-w-md mx-auto">
            Your partner account is active. Access your dashboard to manage listings, track
            performance, and handle settlements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button asChild variant="primary" size="lg" className="rounded-full px-8 h-12 text-sm font-bold">
              <Link to="/partner">
                Go to Partner Dashboard <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-xs font-bold text-ink/50 hover:text-coral"
              onClick={() => setBypassActiveCheck(true)}
            >
              Register Another Business
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (submittedPartner) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
        <Card className="rounded-[32px] border-0 bg-white p-8 sm:p-10 ring-1 ring-ink/10 shadow-lg">
          <div className="grid size-16 mx-auto place-items-center rounded-2xl bg-mint/20 text-mint-700 mb-6">
            <Check className="size-7 stroke-[2.5]" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink">
            Application Submitted Successfully
          </h2>
          <p className="mt-2 text-sm text-ink/60 max-w-md mx-auto">
            Your partner application for{" "}
            <span className="font-bold text-ink">{submittedPartner.businessName}</span> is under
            review. You can access your partner dashboard now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button asChild variant="primary" size="lg" className="rounded-full px-8 h-12 text-sm font-bold">
              <Link to="/partner">
                Go to Partner Dashboard <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-6 h-12 text-sm font-bold border-ink/15">
              <Link to="/">Back to Homepage</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-lilac/30 px-4 py-1.5 text-xs font-extrabold text-ink">
          <Building className="size-3.5 text-coral" />
          <span>Raffila Asset Partner Program</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Become a Prize Partner
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          List your luxury vehicles, real estate, electronics, or fine goods on Africa&apos;s premier prize marketplace.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="mt-8 flex items-center justify-center gap-1">
        {STEPS.map((s, idx) => {
          const isCompleted = currentStep > s.id;
          const isCurrent = currentStep === s.id;
          const Icon = s.icon;

          return (
            <div key={s.id} className="flex items-center">
              <button
                type="button"
                onClick={() => s.id < currentStep && setCurrentStep(s.id)}
                disabled={s.id > currentStep}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs font-bold",
                  isCurrent
                    ? "bg-white ring-1 ring-coral/30 shadow-sm text-ink"
                    : isCompleted
                      ? "text-ink/70 hover:bg-white/60 cursor-pointer"
                      : "text-ink/30 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "size-7 grid place-items-center rounded-lg shrink-0 transition-colors",
                    isCompleted
                      ? "bg-mint text-ink"
                      : isCurrent
                        ? "bg-coral text-white"
                        : "bg-ink/10 text-ink/40",
                  )}
                >
                  {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : <Icon className="size-3.5" />}
                </div>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={cn("w-6 h-px mx-1", isCompleted ? "bg-mint" : "bg-ink/15")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <Card className="mt-6 rounded-[28px] border-0 bg-white ring-1 ring-ink/10 shadow-lg overflow-hidden">
        <CardContent className="p-6 sm:p-8">

          {/* STEP 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-extrabold text-ink">Business Information</h2>
                <p className="text-sm text-ink/55 mt-1">
                  Registered legal entity details for CAC verification.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Company / Business Name *"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.businessName && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.businessName && <p className="mt-1 text-xs text-coral font-bold">{errors.businessName}</p>}
                </div>

                <div>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="h-11 rounded-xl border-ink/15 font-bold text-sm">
                      <SelectValue placeholder="Business Type *" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {BUSINESS_TYPES.map((bt) => (
                        <SelectItem key={bt} value={bt} className="font-bold text-sm py-2">{bt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Input
                    placeholder="RC / CAC Number *"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.cacNumber && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.cacNumber && <p className="mt-1 text-xs text-coral font-bold">{errors.cacNumber}</p>}
                </div>

                <div className="sm:col-span-2">
                  <Input
                    placeholder="Registered Business Address *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.address && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.address && <p className="mt-1 text-xs text-coral font-bold">{errors.address}</p>}
                </div>

                <div>
                  <Select value={country} onValueChange={(v) => { setCountry(v); setState(""); }}>
                    <SelectTrigger className="h-11 rounded-xl border-ink/15 font-bold text-sm">
                      <SelectValue placeholder="Country *" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl max-h-64 overflow-y-auto">
                      {Object.keys(AFRICAN_COUNTRIES).sort().map((c) => (
                        <SelectItem key={c} value={c} className="font-bold text-sm py-2">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  {getStatesForCountry(country).length > 0 ? (
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger className="h-11 rounded-xl border-ink/15 font-bold text-sm">
                        <SelectValue placeholder="State / Region *" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl max-h-64 overflow-y-auto">
                        {getStatesForCountry(country).map((s) => (
                          <SelectItem key={s} value={s} className="font-bold text-sm py-2">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="State / Region *"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-11 rounded-xl border-ink/15 font-bold text-sm"
                    />
                  )}
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Company Email *"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.companyEmail && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.companyEmail && <p className="mt-1 text-xs text-coral font-bold">{errors.companyEmail}</p>}
                </div>

                <div>
                  <Input
                    placeholder="Phone Number *"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.companyPhone && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.companyPhone && <p className="mt-1 text-xs text-coral font-bold">{errors.companyPhone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <Input
                    placeholder="Website (optional)"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="h-11 rounded-xl border-ink/15 font-bold text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    placeholder="Business Profile — describe your brand, showroom, and inventory..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className={cn(
                      "rounded-xl border-ink/15 font-bold text-sm",
                      errors.description && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.description && <p className="mt-1 text-xs text-coral font-bold">{errors.description}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Representative & Documents */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-extrabold text-ink">Representative & Documents</h2>
                <p className="text-sm text-ink/55 mt-1">
                  Authorized signatory details and compliance documents.
                </p>
              </div>

              {/* Representative fields */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Representative Full Name *"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.repName && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.repName && <p className="mt-1 text-xs text-coral font-bold">{errors.repName}</p>}
                </div>

                <div>
                  <Input
                    placeholder="Position / Title *"
                    value={repPosition}
                    onChange={(e) => setRepPosition(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.repPosition && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.repPosition && <p className="mt-1 text-xs text-coral font-bold">{errors.repPosition}</p>}
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Direct Email *"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.repEmail && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.repEmail && <p className="mt-1 text-xs text-coral font-bold">{errors.repEmail}</p>}
                </div>

                <div>
                  <Input
                    placeholder="Direct Phone *"
                    value={repPhone}
                    onChange={(e) => setRepPhone(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.repPhone && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.repPhone && <p className="mt-1 text-xs text-coral font-bold">{errors.repPhone}</p>}
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink/45">Required Documents</p>

                <div className="rounded-2xl border border-ink/10 p-4 flex items-center justify-between gap-4 bg-paper/40">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-coral/15 text-coral flex items-center justify-center shrink-0">
                      <FileCheck2 className="size-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-ink">CAC Certificate *</p>
                      <p className="text-xs text-ink/50">Certificate of Incorporation</p>
                    </div>
                  </div>
                  {cacDocUploaded ? (
                    <Badge className="bg-mint/30 border-0 text-ink text-xs font-bold px-3 py-1">
                      <Check className="size-3 mr-1 text-mint-700" /> Attached
                    </Badge>
                  ) : (
                    <Button type="button" size="sm" variant="outline" className="rounded-full text-xs font-bold border-coral text-coral" onClick={() => setCacDocUploaded(true)}>
                      <Upload className="size-3.5 mr-1" /> Upload
                    </Button>
                  )}
                </div>
                {errors.cacDoc && <p className="text-xs text-coral font-bold">{errors.cacDoc}</p>}

                <div className="rounded-2xl border border-ink/10 p-4 flex items-center justify-between gap-4 bg-paper/40">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-sky/20 text-sky-700 flex items-center justify-center shrink-0">
                      <Building2 className="size-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-ink">Proof of Address *</p>
                      <p className="text-xs text-ink/50">Utility bill or bank statement (within 3 months)</p>
                    </div>
                  </div>
                  {addressDocUploaded ? (
                    <Badge className="bg-mint/30 border-0 text-ink text-xs font-bold px-3 py-1">
                      <Check className="size-3 mr-1 text-mint-700" /> Attached
                    </Badge>
                  ) : (
                    <Button type="button" size="sm" variant="outline" className="rounded-full text-xs font-bold border-coral text-coral" onClick={() => setAddressDocUploaded(true)}>
                      <Upload className="size-3.5 mr-1" /> Upload
                    </Button>
                  )}
                </div>
                {errors.addressDoc && <p className="text-xs text-coral font-bold">{errors.addressDoc}</p>}

                <div className="rounded-2xl border border-ink/10 p-4 flex items-center justify-between gap-4 bg-paper/40">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-lemon/35 text-ink flex items-center justify-center shrink-0">
                      <ShieldCheck className="size-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-ink">Trade License / Authorization</p>
                      <p className="text-xs text-ink/50">Optional — supplier letter or trade authorization</p>
                    </div>
                  </div>
                  {dealershipDocUploaded ? (
                    <Badge className="bg-mint/30 border-0 text-ink text-xs font-bold px-3 py-1">
                      <Check className="size-3 mr-1 text-mint-700" /> Attached
                    </Badge>
                  ) : (
                    <Button type="button" size="sm" variant="outline" className="rounded-full text-xs font-bold border-ink/20" onClick={() => setDealershipDocUploaded(true)}>
                      <Upload className="size-3.5 mr-1" /> Attach
                    </Button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-lilac/15 p-3 flex items-start gap-2.5 text-xs text-ink/65">
                <Info className="size-3.5 text-coral shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold text-ink">Data Security:</span> All documents are encrypted and only accessible by accredited compliance officers.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: First Asset */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-extrabold text-ink">Initial Prize Asset</h2>
                <p className="text-sm text-ink/55 mt-1">
                  Propose your first asset to list once your partner account is approved.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Asset Title / Model Name *"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.assetName && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.assetName && <p className="mt-1 text-xs text-coral font-bold">{errors.assetName}</p>}
                </div>

                <div>
                  <Select value={assetCategory} onValueChange={setAssetCategory}>
                    <SelectTrigger className="h-11 rounded-xl border-ink/15 font-bold text-sm">
                      <SelectValue placeholder="Category *" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {ASSET_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="font-bold text-sm py-2">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Input
                    type="number"
                    placeholder="Declared Value (₦) *"
                    value={declaredValueNaira}
                    onChange={(e) => setDeclaredValueNaira(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.declaredValue && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {declaredValueNaira && Number(declaredValueNaira) > 0 && (
                    <p className="mt-1 text-xs font-extrabold text-coral">
                      {formatNaira(Number(declaredValueNaira) * 100)}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Physical Location *"
                    value={assetLocation}
                    onChange={(e) => setAssetLocation(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.assetLocation && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.assetLocation && <p className="mt-1 text-xs text-coral font-bold">{errors.assetLocation}</p>}
                </div>

                <div>
                  <Select value={assetCondition} onValueChange={(v: any) => setAssetCondition(v)}>
                    <SelectTrigger className="h-11 rounded-xl border-ink/15 font-bold text-sm">
                      <SelectValue placeholder="Condition *" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="Brand new">Brand new</SelectItem>
                      <SelectItem value="Like new">Like new / Pristine</SelectItem>
                      <SelectItem value="Refurbished">Certified Pre-owned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    placeholder="Asset ID / Reference Number (optional)"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="h-11 rounded-xl border-ink/15 font-bold text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    placeholder="Specifications & Description — key features, condition details, warranty, included items..."
                    value={assetDescription}
                    onChange={(e) => setAssetDescription(e.target.value)}
                    rows={2}
                    className="rounded-xl border-ink/15 font-bold text-sm"
                  />
                  {errors.assetDescription && <p className="mt-1 text-xs text-coral font-bold">{errors.assetDescription}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Create Account & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-extrabold text-ink">Create Your Account</h2>
                <p className="text-sm text-ink/55 mt-1">
                  Set up login credentials and review your application.
                </p>
              </div>

              {/* Password */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    value={repEmail || companyEmail || "your@email.com"}
                    disabled
                    className="h-11 rounded-xl border-ink/15 font-bold text-sm bg-cream/30"
                  />
                </div>

                <div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password * (min 8 characters)"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      className={cn(
                        "h-11 rounded-xl border-ink/15 font-bold text-sm pr-10",
                        errors.password && "border-coral ring-1 ring-coral",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-coral font-bold">{errors.password}</p>}
                </div>

                <div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password *"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-ink/15 font-bold text-sm",
                      errors.confirmPassword && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-coral font-bold">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Review Summary */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink/45">Application Summary</p>

                <div className="rounded-2xl border border-ink/10 p-4 bg-paper/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-ink/40">Business</p>
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-bold text-coral hover:underline">Edit</button>
                  </div>
                  <p className="text-sm font-extrabold text-ink">{businessName}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
                    <span>{cacNumber}</span>
                    <span>{businessType}</span>
                    <span>{state}, {country}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-ink/10 p-4 bg-paper/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-ink/40">Representative</p>
                    <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-bold text-coral hover:underline">Edit</button>
                  </div>
                  <p className="text-sm font-extrabold text-ink">
                    {repName} <span className="text-xs font-bold text-ink/50">({repPosition})</span>
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
                    <span>{repEmail}</span>
                    <span>{repPhone}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-ink/10 p-4 bg-paper/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-ink/40">First Asset</p>
                    <button type="button" onClick={() => setCurrentStep(3)} className="text-xs font-bold text-coral hover:underline">Edit</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-ink">{assetName}</p>
                      <p className="text-xs text-ink/55">{assetCategory} · {assetCondition}</p>
                    </div>
                    <p className="text-sm font-extrabold text-coral">{formatNaira(Number(declaredValueNaira || 0) * 100)}</p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(c) => setAgreeTerms(Boolean(c))}
                    className="mt-0.5 size-4 rounded-md"
                  />
                  <label htmlFor="terms" className="text-xs text-ink/70 leading-relaxed cursor-pointer">
                    I confirm I am authorized to submit this on behalf of{" "}
                    <span className="font-bold text-ink">{businessName || "the business"}</span>,
                    and agree to the{" "}
                    <Link to="/terms-and-conditions" className="font-bold text-coral underline">Partner Terms</Link>{" "}
                    and{" "}
                    <Link to="/privacy-policy" className="font-bold text-coral underline">Privacy Policy</Link>.
                    Assets require admin approval before going live.
                  </label>
                </div>
                {errors.agreeTerms && <p className="mt-2 text-xs text-coral font-bold">{errors.agreeTerms}</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 pt-5 border-t border-ink/10 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="rounded-full px-6 h-11 text-sm font-bold border-ink/20"
              >
                <ArrowLeft className="size-4 mr-2" /> Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleNext}
                className="rounded-full px-8 h-11 text-sm font-bold shadow-md ml-auto"
              >
                Continue <ArrowRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                className="rounded-full px-8 h-11 text-sm font-bold shadow-md bg-coral text-white ml-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
                <Check className="size-4 ml-2 stroke-[2.5]" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
