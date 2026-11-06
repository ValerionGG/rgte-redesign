// Secteurs : mots-clés de départ, schema.org conseillé, hashtags (FR / EN), réseaux prioritaires.
// ads = clé de benchmark Google Ads (voir benchmarks.js). b2b / local = valeurs par défaut.
// Hashtags sans accents (recherche plus large), en minuscules ; l'interface propose aussi la version CamelCase (accessibilité).

export const SECTORS = [
  {
    id: 'restaurant', label: 'Restaurant, café, traiteur', b2b: false, local: true, ads: 'restaurants',
    schema: ['Restaurant', 'LocalBusiness'], networks: ['instagram', 'tiktok', 'facebook', 'google'],
    keywords: ['restaurant', 'menu', 'réservation', 'brunch', 'traiteur', 'livraison repas', 'restaurant ouvert dimanche'],
    hashtags: {
      fr: { large: ['restaurant', 'food', 'cuisine', 'gastronomie', 'faitmaison', 'miam', 'restaurantfrancais', 'bonneadresse'],
        niche: ['cuisinemaison', 'produitslocaux', 'circuitcourt', 'chefcuisinier', 'platdujour', 'brunchtime', 'terrasse', 'bistronomie', 'foodlover', 'traiteur'] },
      en: { large: ['foodie', 'foodporn', 'instafood', 'restaurant', 'foodstagram', 'eeeeeats'], niche: ['chefslife', 'finedining', 'brunch', 'localfood', 'farmtotable'] },
    },
  },
  {
    id: 'boulangerie', label: 'Boulangerie, pâtisserie, chocolaterie', b2b: false, local: true, ads: 'restaurants',
    schema: ['Bakery', 'LocalBusiness'], networks: ['instagram', 'tiktok', 'facebook', 'pinterest'],
    keywords: ['boulangerie', 'pâtisserie', 'gâteau anniversaire', 'pain au levain', 'chocolatier', 'viennoiseries', 'pièce montée'],
    hashtags: {
      fr: { large: ['patisserie', 'boulangerie', 'gourmandise', 'patisseriefrancaise', 'faitmaison', 'chocolat', 'gateau', 'viennoiserie'],
        niche: ['artisanboulanger', 'painaulevain', 'patissier', 'croissant', 'entremets', 'tartealafraise', 'chocolatier', 'boulangerieartisanale'] },
      en: { large: ['pastry', 'bakery', 'patisserie', 'dessert', 'pastrychef', 'baking'], niche: ['frenchpastry', 'sourdough', 'viennoiserie', 'chocolatier', 'cakedesign'] },
    },
  },
  {
    id: 'equipement-pro', label: 'Équipement professionnel / industrie B2B', b2b: true, local: false, ads: 'industrial',
    schema: ['Organization', 'Product'], networks: ['linkedin', 'youtube', 'instagram', 'facebook'],
    keywords: ['fabricant', 'sur mesure', 'devis', 'équipement professionnel', 'fiche technique', 'installation', 'agencement magasin'],
    hashtags: {
      fr: { large: ['industrie', 'fabricationfrancaise', 'madeinfrance', 'savoirfaire', 'b2b', 'innovation', 'equipementpro'],
        niche: ['agencementmagasin', 'surmesure', 'bureaudetudes', 'fabricantfrancais', 'industriedufutur', 'froidcommercial', 'metiersdebouche', 'pmeindustrielle', 'frenchfab'] },
      en: { large: ['manufacturing', 'industry', 'engineering', 'b2b', 'madeinfrance'], niche: ['shopfitting', 'retaildesign', 'customdesign', 'foodservice', 'commercialrefrigeration'] },
    },
  },
  {
    id: 'ecommerce-mode', label: 'E-commerce mode & accessoires', b2b: false, local: false, ads: 'apparel',
    schema: ['Product', 'Offer', 'Organization'], networks: ['instagram', 'tiktok', 'pinterest', 'facebook'],
    keywords: ['acheter', 'robe', 'collection', 'soldes', 'livraison gratuite', 'taille', 'mode femme'],
    hashtags: {
      fr: { large: ['mode', 'tenuedujour', 'lookdujour', 'modefemme', 'style', 'shopping', 'tendance', 'nouvellecollection'],
        niche: ['modeethique', 'slowfashion', 'marquefrancaise', 'createurfrancais', 'modedurable', 'friperie', 'secondemain', 'conceptstore'] },
      en: { large: ['fashion', 'ootd', 'style', 'outfitoftheday', 'streetstyle', 'fashionista'], niche: ['slowfashion', 'sustainablefashion', 'smallbusiness', 'shopsmall', 'capsulewardrobe'] },
    },
  },
  {
    id: 'ecommerce', label: 'E-commerce généraliste', b2b: false, local: false, ads: 'shopping',
    schema: ['Product', 'Offer', 'Organization', 'BreadcrumbList'], networks: ['instagram', 'tiktok', 'facebook', 'pinterest', 'youtube'],
    keywords: ['acheter', 'prix', 'pas cher', 'avis', 'livraison', 'promo', 'comparatif'],
    hashtags: {
      fr: { large: ['shopping', 'boutiqueenligne', 'nouveaute', 'bonplan', 'idéecadeau', 'promo', 'madeinfrance'],
        niche: ['petitecreatrice', 'commercelocal', 'artisanatfrancais', 'cadeauoriginal', 'faitmain', 'eshop'] },
      en: { large: ['shopping', 'onlineshop', 'smallbusiness', 'shoponline', 'giftideas'], niche: ['tiktokmademebuyit', 'amazonfinds', 'handmade', 'shopsmall'] },
    },
  },
  {
    id: 'beaute', label: 'Beauté, coiffure, esthétique', b2b: false, local: true, ads: 'beauty',
    schema: ['BeautySalon', 'HairSalon', 'LocalBusiness'], networks: ['instagram', 'tiktok', 'facebook', 'pinterest'],
    keywords: ['coiffeur', 'institut de beauté', 'manucure', 'balayage', 'soin visage', 'prise de rendez-vous', 'barbier'],
    hashtags: {
      fr: { large: ['beaute', 'coiffure', 'coiffeur', 'maquillage', 'soinvisage', 'ongles', 'manucure', 'institutdebeaute'],
        niche: ['balayage', 'coiffeurparis', 'onglerie', 'nailart', 'barbier', 'extensionscils', 'soinsnaturels', 'cosmetiquebio'] },
      en: { large: ['beauty', 'hair', 'makeup', 'skincare', 'nails', 'hairstyle'], niche: ['balayage', 'hairtransformation', 'nailart', 'lashes', 'cleanbeauty'] },
    },
  },
  {
    id: 'sante', label: 'Santé, médical, bien-être', b2b: false, local: true, ads: 'health',
    schema: ['MedicalBusiness', 'Physician', 'LocalBusiness'], networks: ['instagram', 'facebook', 'youtube', 'linkedin'],
    keywords: ['ostéopathe', 'kiné', 'médecin', 'prise de rendez-vous', 'bilan', 'consultation', 'naturopathe'],
    hashtags: {
      fr: { large: ['sante', 'bienetre', 'prevention', 'santenaturelle', 'equilibre', 'selfcare'],
        niche: ['osteopathie', 'kinesitherapie', 'naturopathie', 'sophrologie', 'nutrition', 'santementale', 'yoga', 'meditation'] },
      en: { large: ['health', 'wellness', 'wellbeing', 'selfcare', 'healthylifestyle'], niche: ['physiotherapy', 'osteopathy', 'mentalhealth', 'nutrition', 'mindfulness'] },
    },
  },
  {
    id: 'dentaire', label: 'Dentaire & orthodontie', b2b: false, local: true, ads: 'dentists',
    schema: ['Dentist', 'MedicalBusiness'], networks: ['instagram', 'facebook', 'google'],
    keywords: ['dentiste', 'orthodontiste', 'implant dentaire', 'blanchiment', 'urgence dentaire', 'aligneurs'],
    hashtags: {
      fr: { large: ['dentiste', 'sourire', 'santedentaire', 'cabinetdentaire'], niche: ['orthodontie', 'implantdentaire', 'blanchimentdentaire', 'aligneurs', 'hygienedentaire'] },
      en: { large: ['dentist', 'smile', 'dentistry', 'dentalcare'], niche: ['orthodontics', 'invisalign', 'teethwhitening', 'dentalimplants'] },
    },
  },
  {
    id: 'immobilier', label: 'Immobilier', b2b: false, local: true, ads: 'realestate',
    schema: ['RealEstateAgent', 'LocalBusiness', 'Offer'], networks: ['instagram', 'facebook', 'linkedin', 'youtube', 'tiktok'],
    keywords: ['agence immobilière', 'estimation gratuite', 'maison à vendre', 'appartement à louer', 'investissement locatif', 'prix m2'],
    hashtags: {
      fr: { large: ['immobilier', 'agenceimmobiliere', 'maison', 'appartement', 'avendre', 'investissementimmobilier', 'decoration'],
        niche: ['visitevirtuelle', 'estimationgratuite', 'primoaccedant', 'investissementlocatif', 'coupdecoeur', 'maisondarchitecte', 'immobilierdeprestige'] },
      en: { large: ['realestate', 'realtor', 'home', 'property', 'househunting'], niche: ['luxuryrealestate', 'justlisted', 'investmentproperty', 'dreamhome'] },
    },
  },
  {
    id: 'btp', label: 'BTP, artisans, rénovation', b2b: false, local: true, ads: 'homeservices',
    schema: ['HomeAndConstructionBusiness', 'GeneralContractor', 'LocalBusiness'], networks: ['facebook', 'instagram', 'google', 'youtube'],
    keywords: ['artisan', 'rénovation', 'devis gratuit', 'plombier', 'électricien', 'couvreur', 'salle de bain', 'isolation', 'MaPrimeRénov'],
    hashtags: {
      fr: { large: ['renovation', 'travaux', 'artisan', 'batiment', 'btp', 'chantier', 'maison', 'avantapres'],
        niche: ['renovationmaison', 'salledebain', 'cuisineequipee', 'isolationthermique', 'artisanrge', 'maprimerenov', 'menuiserie', 'carrelage', 'plomberie'] },
      en: { large: ['construction', 'renovation', 'homeimprovement', 'beforeandafter'], niche: ['bathroomremodel', 'kitchenremodel', 'carpentry', 'tiling'] },
    },
  },
  {
    id: 'auto', label: 'Automobile, garage, mobilité', b2b: false, local: true, ads: 'automotive',
    schema: ['AutoRepair', 'AutoDealer', 'LocalBusiness'], networks: ['instagram', 'tiktok', 'facebook', 'youtube'],
    keywords: ['garage', 'voiture occasion', 'contrôle technique', 'entretien voiture', 'carrosserie', 'leasing', 'voiture électrique'],
    hashtags: {
      fr: { large: ['voiture', 'automobile', 'auto', 'garage', 'occasion', 'carspotting'], niche: ['voitureelectrique', 'mecanique', 'carrosserie', 'detailingauto', 'voituredecollection', 'leasing'] },
      en: { large: ['cars', 'carsofinstagram', 'auto', 'carlifestyle'], niche: ['ev', 'detailing', 'classiccars', 'mechanic'] },
    },
  },
  {
    id: 'juridique', label: 'Avocats, juridique, notaires', b2b: true, local: true, ads: 'legal',
    schema: ['LegalService', 'Attorney', 'LocalBusiness'], networks: ['linkedin', 'youtube', 'instagram'],
    keywords: ['avocat', 'divorce', 'droit du travail', 'avocat pénaliste', 'consultation juridique', 'création entreprise', 'notaire'],
    hashtags: {
      fr: { large: ['avocat', 'droit', 'juridique', 'justice', 'conseiljuridique'], niche: ['droitdutravail', 'droitdelafamille', 'droitdesaffaires', 'legaltech', 'avocatparis', 'rgpd'] },
      en: { large: ['lawyer', 'law', 'legal', 'attorney'], niche: ['employmentlaw', 'familylaw', 'legaltech', 'corporatelaw'] },
    },
  },
  {
    id: 'finance', label: 'Finance, assurance, comptabilité', b2b: true, local: false, ads: 'finance',
    schema: ['FinancialService', 'AccountingService', 'InsuranceAgency'], networks: ['linkedin', 'youtube', 'instagram', 'tiktok'],
    keywords: ['expert comptable', 'assurance', 'crédit immobilier', 'simulation', 'placement', 'courtier', 'gestion de patrimoine'],
    hashtags: {
      fr: { large: ['finance', 'investissement', 'epargne', 'assurance', 'patrimoine', 'entrepreneur'], niche: ['expertcomptable', 'gestiondepatrimoine', 'financespersonnelles', 'bourse', 'creditimmobilier', 'independancefinanciere'] },
      en: { large: ['finance', 'investing', 'money', 'personalfinance'], niche: ['fintech', 'wealthmanagement', 'accounting', 'insurtech'] },
    },
  },
  {
    id: 'saas', label: 'SaaS, logiciel, tech B2B', b2b: true, local: false, ads: 'b2b',
    schema: ['SoftwareApplication', 'Organization', 'FAQPage'], networks: ['linkedin', 'youtube', 'x', 'reddit'],
    keywords: ['logiciel', 'alternative à', 'outil', 'tarifs', 'essai gratuit', 'intégration', 'comparatif logiciel', 'API'],
    hashtags: {
      fr: { large: ['saas', 'logiciel', 'startup', 'tech', 'transformationdigitale', 'productivite', 'ia'], niche: ['frenchtech', 'nocode', 'automatisation', 'cybersecurite', 'devops', 'b2bmarketing', 'growthhacking'] },
      en: { large: ['saas', 'startup', 'tech', 'ai', 'productivity'], niche: ['buildinpublic', 'b2bsaas', 'devtools', 'nocode', 'indiehackers', 'productmanagement'] },
    },
  },
  {
    id: 'app-mobile', label: 'Application mobile', b2b: false, local: false, ads: 'apps',
    schema: ['MobileApplication', 'SoftwareApplication'], networks: ['tiktok', 'instagram', 'youtube', 'x', 'reddit'],
    keywords: ['application', 'appli', 'télécharger', 'gratuit', 'iphone', 'android', 'meilleure application'],
    hashtags: {
      fr: { large: ['application', 'appli', 'appmobile', 'startup', 'tech', 'astuce'], niche: ['applicationmobile', 'frenchtech', 'astuceiphone', 'android', 'productivite'] },
      en: { large: ['app', 'apps', 'iphone', 'android', 'tech'], niche: ['appoftheday', 'iosapp', 'androidapp', 'indiedev', 'buildinpublic', 'techtok'] },
    },
  },
  {
    id: 'formation', label: 'Formation, éducation, coaching', b2b: false, local: false, ads: 'education',
    schema: ['EducationalOrganization', 'Course', 'Person'], networks: ['youtube', 'instagram', 'linkedin', 'tiktok'],
    keywords: ['formation', 'cours en ligne', 'certifiante', 'CPF', 'coaching', 'apprendre', 'Qualiopi'],
    hashtags: {
      fr: { large: ['formation', 'apprendre', 'education', 'developpementpersonnel', 'coaching', 'reconversion'], niche: ['formationenligne', 'cpf', 'qualiopi', 'elearning', 'coachdevie', 'reconversionprofessionnelle'] },
      en: { large: ['education', 'learning', 'coaching', 'motivation'], niche: ['onlinecourse', 'elearning', 'studytok', 'careerchange'] },
    },
  },
  {
    id: 'tourisme', label: 'Tourisme, hôtellerie, loisirs', b2b: false, local: true, ads: 'travel',
    schema: ['Hotel', 'LodgingBusiness', 'TouristAttraction'], networks: ['instagram', 'tiktok', 'pinterest', 'facebook', 'youtube'],
    keywords: ['hôtel', 'chambre d\'hôtes', 'gîte', 'que faire à', 'week-end', 'location vacances', 'activités'],
    hashtags: {
      fr: { large: ['voyage', 'vacances', 'tourisme', 'france', 'weekend', 'hotel', 'evasion'], niche: ['chambredhotes', 'gite', 'escapade', 'cotedazur', 'provence', 'sudfrance', 'tourismedurable'] },
      en: { large: ['travel', 'wanderlust', 'vacation', 'travelgram', 'instatravel'], niche: ['visitfrance', 'boutiquehotel', 'slowtravel', 'frenchriviera'] },
    },
  },
  {
    id: 'sport', label: 'Sport, fitness, salle', b2b: false, local: true, ads: 'fitness',
    schema: ['SportsActivityLocation', 'ExerciseGym', 'LocalBusiness'], networks: ['instagram', 'tiktok', 'youtube', 'facebook'],
    keywords: ['salle de sport', 'coach sportif', 'crossfit', 'yoga', 'pilates', 'abonnement', 'cours collectifs'],
    hashtags: {
      fr: { large: ['sport', 'fitness', 'musculation', 'motivation', 'entrainement', 'santé'], niche: ['coachsportif', 'crossfit', 'pilates', 'yoga', 'running', 'sallesport', 'remiseenforme'] },
      en: { large: ['fitness', 'gym', 'workout', 'fitnessmotivation', 'training'], niche: ['crossfit', 'pilates', 'personaltrainer', 'gymtok', 'running'] },
    },
  },
  {
    id: 'agence', label: 'Agence, conseil, marketing', b2b: true, local: false, ads: 'b2b',
    schema: ['ProfessionalService', 'Organization'], networks: ['linkedin', 'instagram', 'youtube', 'x'],
    keywords: ['agence web', 'agence SEO', 'création site internet', 'consultant', 'stratégie digitale', 'community manager'],
    hashtags: {
      fr: { large: ['marketing', 'marketingdigital', 'communication', 'entrepreneur', 'strategie', 'business'], niche: ['seo', 'referencementnaturel', 'communitymanager', 'branding', 'webdesign', 'growthmarketing', 'inboundmarketing'] },
      en: { large: ['marketing', 'digitalmarketing', 'business', 'branding'], niche: ['seo', 'contentmarketing', 'socialmediamarketing', 'growthmarketing'] },
    },
  },
  {
    id: 'evenementiel', label: 'Mariage, événementiel, photographie', b2b: false, local: true, ads: 'events',
    schema: ['EventVenue', 'LocalBusiness', 'Event'], networks: ['instagram', 'pinterest', 'tiktok', 'facebook'],
    keywords: ['salle de mariage', 'photographe mariage', 'wedding planner', 'traiteur mariage', 'location salle', 'séminaire'],
    hashtags: {
      fr: { large: ['mariage', 'mariee', 'evenementiel', 'photographe', 'fete', 'decoration'], niche: ['photographemariage', 'weddingplanner', 'lieudereception', 'mariageboheme', 'futuremariee', 'robedemariee'] },
      en: { large: ['wedding', 'bride', 'weddingday', 'events', 'photography'], niche: ['weddingphotographer', 'weddinginspiration', 'destinationwedding', 'eventplanner'] },
    },
  },
  {
    id: 'maison-deco', label: 'Maison, décoration, ameublement', b2b: false, local: false, ads: 'homegoods',
    schema: ['FurnitureStore', 'Product', 'LocalBusiness'], networks: ['pinterest', 'instagram', 'tiktok', 'youtube'],
    keywords: ['décoration', 'meuble', 'canapé', 'luminaire', 'idée déco', 'architecte d\'intérieur', 'cuisine sur mesure'],
    hashtags: {
      fr: { large: ['decoration', 'deco', 'interieur', 'maison', 'decointerieur', 'homedecor', 'design'], niche: ['architectedinterieur', 'decoscandinave', 'chinage', 'upcycling', 'mobilierdesign', 'decoboheme', 'homestaging'] },
      en: { large: ['homedecor', 'interiordesign', 'interior', 'home', 'decor'], niche: ['interiorinspo', 'homestyling', 'vintagefurniture', 'scandinavianhome'] },
    },
  },
  {
    id: 'luxe', label: 'Bijouterie, luxe, horlogerie', b2b: false, local: false, ads: 'apparel',
    schema: ['JewelryStore', 'Product', 'Brand'], networks: ['instagram', 'pinterest', 'tiktok', 'youtube'],
    keywords: ['bijoux', 'bague de fiançailles', 'joaillerie', 'montre', 'or 18 carats', 'créateur bijoux'],
    hashtags: {
      fr: { large: ['bijoux', 'joaillerie', 'luxe', 'bijouxcreateur', 'faitmain'], niche: ['baguedefiancailles', 'bijouxor', 'joaillierfrancais', 'hautejoaillerie', 'bijouxethiques'] },
      en: { large: ['jewelry', 'luxury', 'finejewelry', 'jewelrydesigner'], niche: ['engagementring', 'handmadejewelry', 'watchesofinstagram', 'goldjewelry'] },
    },
  },
  {
    id: 'association', label: 'Association, ONG, collectivité', b2b: false, local: true, ads: 'nonprofit',
    schema: ['NGO', 'Organization', 'Event'], networks: ['facebook', 'instagram', 'linkedin', 'youtube'],
    keywords: ['association', 'bénévolat', 'faire un don', 'adhésion', 'événement', 'solidarité'],
    hashtags: {
      fr: { large: ['association', 'solidarite', 'benevolat', 'engagement', 'entraide'], niche: ['faireundon', 'economiesocialeetsolidaire', 'ess', 'vieassociative', 'impact'] },
      en: { large: ['nonprofit', 'charity', 'volunteer', 'community'], niche: ['givingtuesday', 'socialimpact', 'fundraising'] },
    },
  },
  {
    id: 'animaux', label: 'Animaux, vétérinaire, animalerie', b2b: false, local: true, ads: 'pets',
    schema: ['VeterinaryCare', 'PetStore', 'LocalBusiness'], networks: ['instagram', 'tiktok', 'facebook', 'youtube'],
    keywords: ['vétérinaire', 'toilettage', 'croquettes', 'pension chien', 'éducateur canin', 'animalerie'],
    hashtags: {
      fr: { large: ['chien', 'chat', 'animaux', 'chiot', 'chaton', 'animauxdecompagnie'], niche: ['toilettage', 'educationcanine', 'veterinaire', 'adoptezmoi', 'pensioncanine'] },
      en: { large: ['dog', 'cat', 'dogsofinstagram', 'catsofinstagram', 'pets'], niche: ['doggrooming', 'adoptdontshop', 'puppytraining', 'vetlife'] },
    },
  },
  {
    id: 'culture', label: 'Culture, art, musique, créateurs', b2b: false, local: false, ads: 'arts',
    schema: ['Person', 'MusicGroup', 'VisualArtwork', 'Event'], networks: ['instagram', 'tiktok', 'youtube', 'threads', 'bluesky'],
    keywords: ['artiste', 'concert', 'exposition', 'oeuvre', 'atelier', 'commande', 'illustration'],
    hashtags: {
      fr: { large: ['art', 'artiste', 'musique', 'culture', 'creation', 'illustration'], niche: ['artistefrancais', 'artcontemporain', 'atelierdartiste', 'musiquefrancaise', 'peinture', 'artisanat'] },
      en: { large: ['art', 'artist', 'music', 'artwork', 'creative'], niche: ['contemporaryart', 'illustration', 'newmusic', 'artistsoninstagram', 'arttok'] },
    },
  },
  {
    id: 'services-domicile', label: 'Services à domicile, nettoyage, aide', b2b: false, local: true, ads: 'homeservices',
    schema: ['HomeAndConstructionBusiness', 'LocalBusiness', 'Service'], networks: ['facebook', 'google', 'instagram'],
    keywords: ['ménage à domicile', 'aide à domicile', 'jardinage', 'garde d\'enfants', 'crédit d\'impôt', 'nettoyage bureaux'],
    hashtags: {
      fr: { large: ['servicesadomicile', 'menage', 'nettoyage', 'jardinage', 'maison'], niche: ['aideadomicile', 'gardedenfants', 'creditdimpot', 'conciergerie', 'nettoyageprofessionnel'] },
      en: { large: ['cleaning', 'homeservices', 'cleaningservice'], niche: ['cleantok', 'gardening', 'homecare'] },
    },
  },
  {
    id: 'gaming', label: 'Jeu vidéo, esport, streaming', b2b: false, local: false, ads: 'apps',
    schema: ['VideoGame', 'Organization', 'Event'], networks: ['tiktok', 'youtube', 'x', 'twitch', 'discord'],
    keywords: ['jeu vidéo', 'gameplay', 'tournoi', 'stream', 'précommande', 'indie game'],
    hashtags: {
      fr: { large: ['jeuvideo', 'gaming', 'gamer', 'esport', 'twitchfr'], niche: ['jeuindependant', 'gamingfr', 'streamerfr', 'retrogaming', 'indiedevfr'] },
      en: { large: ['gaming', 'gamer', 'videogames', 'esports', 'twitch'], niche: ['indiegame', 'indiedev', 'gamedev', 'screenshotsaturday', 'retrogaming'] },
    },
  },
  {
    id: 'autre', label: 'Autre / généraliste', b2b: false, local: false, ads: 'average',
    schema: ['Organization', 'WebSite'], networks: ['instagram', 'linkedin', 'facebook', 'tiktok', 'youtube'],
    keywords: ['service', 'prix', 'avis', 'devis', 'meilleur', 'près de chez moi'],
    hashtags: {
      fr: { large: ['entrepreneur', 'petiteentreprise', 'madeinfrance', 'commercelocal', 'nouveaute'], niche: ['tpe', 'pme', 'entrepreneuriat', 'consommerlocal', 'savoirfaire'] },
      en: { large: ['smallbusiness', 'entrepreneur', 'business', 'shopsmall'], niche: ['supportsmallbusiness', 'startup', 'localbusiness'] },
    },
  },
]

export const sectorById = (id) => SECTORS.find((s) => s.id === id) || SECTORS[SECTORS.length - 1]

// Hashtags à proscrire : bannis/limités par moments sur Instagram, ou signal de spam (engagement artificiel).
export const BANNED_HASHTAGS = [
  'followforfollow', 'follow4follow', 'f4f', 'like4like', 'l4l', 'likeforlike', 'followme', 'followback', 'tagsforlikes',
  'instalike', 'likeforlikes', 'spam4spam', 's4s', 'gainpost', 'gaintrain', 'teamfollowback', 'followall', 'pleasefollow',
  'boostlikes', 'likes', 'commentforcomment', 'shoutout4shoutout', 'alone', 'beautyblogger', 'desk', 'elevator', 'hardworkpaysoff',
  'humpday', 'kansas', 'pushups', 'snapchat', 'tagsforlikesapp', 'todayimwearing', 'thought', 'pornfood', 'killingit', 'fyp4you',
]
