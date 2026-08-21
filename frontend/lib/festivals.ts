export interface Festival {
  month: number;
  day: number;
  name: string;
  category: 'international' | 'indian' | 'tech' | 'awareness' | 'fun';
  emoji: string;
  promptSuggestion: string;
}

export const festivals: Festival[] = [
  // January
  { month: 1, day: 1, name: "New Year's Day", category: 'international', emoji: '🎉', promptSuggestion: 'New Year celebration with fresh beginnings, resolutions, and hope for the year ahead' },
  { month: 1, day: 4, name: "World Braille Day", category: 'awareness', emoji: '👁️', promptSuggestion: 'Accessibility and inclusion awareness, celebrating blind and visually impaired communities' },
  { month: 1, day: 12, name: "National Youth Day (India)", category: 'indian', emoji: '🇮🇳', promptSuggestion: 'Celebrating youth energy, Swami Vivekananda legacy, and young leadership' },
  { month: 1, day: 15, name: "Martin Luther King Jr. Day", category: 'international', emoji: '✊', promptSuggestion: 'Equality, civil rights, and the power of peaceful activism' },
  { month: 1, day: 15, name: "Makar Sankranti (India)", category: 'indian', emoji: '🪁', promptSuggestion: 'Harvest festival, kite flying, til-gul sweets, and new beginnings' },
  { month: 1, day: 23, name: "Netaji Jayanti (India)", category: 'indian', emoji: '🇮🇳', promptSuggestion: 'Patriotism, courage, and honoring Netaji Subhas Chandra Bose' },
  { month: 1, day: 26, name: "Republic Day (India)", category: 'indian', emoji: '🇮🇳', promptSuggestion: 'Indian Republic Day parade, tricolor theme, patriotism, and democratic values' },
  { month: 1, day: 27, name: "International Holocaust Remembrance", category: 'awareness', emoji: '🕊️', promptSuggestion: 'Remembering history, promoting peace and tolerance' },

  // February
  { month: 2, day: 1, name: "World Interfaith Harmony Week", category: 'awareness', emoji: '🤝', promptSuggestion: 'Unity in diversity, harmony between different faiths and cultures' },
  { month: 2, day: 4, name: "World Cancer Day", category: 'awareness', emoji: '🎀', promptSuggestion: 'Cancer awareness, support for patients, early detection, and hope' },
  { month: 2, day: 14, name: "Valentine's Day", category: 'international', emoji: '💕', promptSuggestion: 'Love, romance, gifts for loved ones, couple themes, heart-shaped products' },
  { month: 2, day: 19, name: "World Day of Social Justice", category: 'awareness', emoji: '⚖️', promptSuggestion: 'Social justice, equality, fair workplaces, and community support' },
  { month: 2, day: 21, name: "International Mother Language Day", category: 'awareness', emoji: '🗣️', promptSuggestion: 'Celebrating linguistic diversity and cultural heritage' },
  { month: 2, day: 28, name: "National Science Day (India)", category: 'indian', emoji: '🔬', promptSuggestion: 'Scientific innovation, C.V. Raman discovery, and STEM education' },

  // March
  { month: 3, day: 1, name: "World Consumer Rights Day", category: 'awareness', emoji: '🛒', promptSuggestion: 'Consumer awareness, fair trade, product quality, and customer satisfaction' },
  { month: 3, day: 3, name: "World Wildlife Day", category: 'awareness', emoji: '🦁', promptSuggestion: 'Wildlife conservation, biodiversity, and protecting endangered species' },
  { month: 3, day: 5, name: "World Book Day", category: 'international', emoji: '📚', promptSuggestion: 'Reading, knowledge, books, literary themes, and learning' },
  { month: 3, day: 8, name: "International Women's Day", category: 'international', emoji: '💪', promptSuggestion: 'Women empowerment, gender equality, celebrating women achievers' },
  { month: 3, day: 14, name: "World Pi Day", category: 'fun', emoji: '🥧', promptSuggestion: 'Math, pies, nerdy humor, and educational content' },
  { month: 3, day: 17, name: "St. Patrick's Day", category: 'international', emoji: '☘️', promptSuggestion: 'Green themes, Irish culture, luck, and celebration' },
  { month: 3, day: 20, name: "International Day of Happiness", category: 'international', emoji: '😊', promptSuggestion: 'Joy, happiness, positive vibes, smile campaigns' },
  { month: 3, day: 21, name: "World Poetry Day", category: 'international', emoji: '🪶', promptSuggestion: 'Poetry, literature, creative writing, and artistic expression' },
  { month: 3, day: 22, name: "World Water Day", category: 'awareness', emoji: '💧', promptSuggestion: 'Water conservation, clean water access, sustainability' },
  { month: 3, day: 24, name: "World Tuberculosis Day", category: 'awareness', emoji: '🏥', promptSuggestion: 'Health awareness, TB prevention, and healthcare access' },
  { month: 3, day: 27, name: "World Theatre Day", category: 'international', emoji: '🎭', promptSuggestion: 'Drama, performing arts, creativity, and storytelling' },

  // April
  { month: 4, day: 1, name: "April Fools' Day", category: 'fun', emoji: '🤡', promptSuggestion: 'Pranks, humor, funny content, playful brand messaging' },
  { month: 4, day: 4, name: "World Health Day", category: 'awareness', emoji: '❤️', promptSuggestion: 'Health, wellness, fitness, healthy lifestyle tips' },
  { month: 4, day: 7, name: "World Health Day", category: 'awareness', emoji: '🏥', promptSuggestion: 'Global health awareness, medical breakthroughs, wellness tips' },
  { month: 4, day: 11, name: "World Parkinson's Day", category: 'awareness', emoji: '🎗️', promptSuggestion: 'Neurological awareness, support for patients, medical research' },
  { month: 4, day: 18, name: "World Heritage Day", category: 'international', emoji: '🏛️', promptSuggestion: 'Cultural heritage, monuments, history, and preservation' },
  { month: 4, day: 22, name: "Earth Day", category: 'international', emoji: '🌍', promptSuggestion: 'Environmental awareness, sustainability, eco-friendly products, green living' },
  { month: 4, day: 23, name: "World Book Day", category: 'international', emoji: '📖', promptSuggestion: 'Reading culture, books, author quotes, literary themes' },
  { month: 4, day: 25, name: "World Penguin Day", category: 'fun', emoji: '🐧', promptSuggestion: 'Cute penguins, wildlife, arctic themes, playful content' },
  { month: 4, day: 28, name: "World Day for Safety and Health", category: 'awareness', emoji: '🦺', promptSuggestion: 'Workplace safety, health protocols, and employee wellbeing' },

  // May
  { month: 5, day: 1, name: "International Workers' Day", category: 'international', emoji: '⚒️', promptSuggestion: 'Labor rights, workers appreciation, hard work, and dedication' },
  { month: 5, day: 3, name: "World Press Freedom Day", category: 'awareness', emoji: '📰', promptSuggestion: 'Freedom of speech, journalism, media literacy' },
  { month: 5, day: 4, name: "Star Wars Day", category: 'fun', emoji: '⭐', promptSuggestion: 'May the Fourth be with you, sci-fi themes, pop culture' },
  { month: 5, day: 5, name: "Cinco de Mayo", category: 'international', emoji: '🌮', promptSuggestion: 'Mexican culture, celebration, food, and festive themes' },
  { month: 5, day: 8, name: "World Red Cross Day", category: 'awareness', emoji: '➕', promptSuggestion: 'Humanitarian aid, blood donation, community service' },
  { month: 5, day: 11, name: "Mother's Day", category: 'international', emoji: '👩‍👧', promptSuggestion: 'Mother love, gifts for mom, family bonds, appreciation' },
  { month: 5, day: 17, name: "World Telecommunication Day", category: 'tech', emoji: '📡', promptSuggestion: 'Digital connectivity, technology, innovation, and communication' },
  { month: 5, day: 20, name: "World Bee Day", category: 'awareness', emoji: '🐝', promptSuggestion: 'Bee conservation, pollination, honey, and ecosystem health' },
  { month: 5, day: 21, name: "World Day for Cultural Diversity", category: 'awareness', emoji: '🌍', promptSuggestion: 'Cultural exchange, diversity, inclusion, and global unity' },
  { month: 5, day: 31, name: "World No Tobacco Day", category: 'awareness', emoji: '🚭', promptSuggestion: 'Anti-tobacco awareness, healthy living, and wellness' },

  // June
  { month: 6, day: 1, name: "World Milk Day", category: 'international', emoji: '🥛', promptSuggestion: 'Dairy products, nutrition, milk benefits, and breakfast themes' },
  { month: 6, day: 3, name: "World Bicycle Day", category: 'international', emoji: '🚲', promptSuggestion: 'Cycling, fitness, eco-friendly transport, and outdoor activities' },
  { month: 6, day: 5, name: "World Environment Day", category: 'international', emoji: '🌱', promptSuggestion: 'Environmental protection, planting trees, clean energy, sustainability' },
  { month: 6, day: 6, name: "World Oceans Day", category: 'awareness', emoji: '🌊', promptSuggestion: 'Ocean conservation, marine life, plastic-free, and blue themes' },
  { month: 6, day: 8, name: "World Oceans Day", category: 'awareness', emoji: '🐠', promptSuggestion: 'Marine biodiversity, ocean cleanup, sustainable fishing' },
  { month: 6, day: 12, name: "World Day Against Child Labour", category: 'awareness', emoji: '👶', promptSuggestion: 'Child rights, education for all, and fair labor practices' },
  { month: 6, day: 14, name: "World Blood Donor Day", category: 'awareness', emoji: '🩸', promptSuggestion: 'Blood donation awareness, saving lives, donor appreciation' },
  { month: 6, day: 17, name: "World Day to Combat Desertification", category: 'awareness', emoji: '🏜️', promptSuggestion: 'Land degradation, drought prevention, sustainable agriculture' },
  { month: 6, day: 20, name: "World Refugee Day", category: 'awareness', emoji: '🏕️', promptSuggestion: 'Refugee support, humanitarian aid, and global solidarity' },
  { month: 6, day: 21, name: "International Day of Yoga", category: 'indian', emoji: '🧘', promptSuggestion: 'Yoga, wellness, mindfulness, fitness, and mental health' },
  { month: 6, day: 21, name: "Father's Day", category: 'international', emoji: '👨‍👧', promptSuggestion: 'Father appreciation, gifts for dad, family love, bonding' },
  { month: 6, day: 23, name: "International Widows' Day", category: 'awareness', emoji: '💔', promptSuggestion: 'Widow support, women empowerment, social justice' },
  { month: 6, day: 26, name: "International Day Against Drug Abuse", category: 'awareness', emoji: '🚫', promptSuggestion: 'Drug prevention, healthy choices, and community support' },

  // July
  { month: 7, day: 1, name: "Canada Day", category: 'international', emoji: '🍁', promptSuggestion: 'Canadian pride, maple leaf themes, national celebration' },
  { month: 7, day: 4, name: "Independence Day (USA)", category: 'international', emoji: '🇺🇸', promptSuggestion: 'American independence, fireworks, patriotic themes' },
  { month: 7, day: 7, name: "World Chocolate Day", category: 'fun', emoji: '🍫', promptSuggestion: 'Chocolate love, sweet treats, indulgence, and dessert themes' },
  { month: 7, day: 11, name: "World Population Day", category: 'awareness', emoji: '👥', promptSuggestion: 'Population awareness, sustainability, and global challenges' },
  { month: 7, day: 15, name: "World Youth Skills Day", category: 'awareness', emoji: '🎓', promptSuggestion: 'Youth education, skill development, and career readiness' },
  { month: 7, day: 17, name: "World Emoji Day", category: 'fun', emoji: '😀', promptSuggestion: 'Emoji celebration, digital communication, fun and playful content' },
  { month: 7, day: 18, name: "Nelson Mandela Day", category: 'international', emoji: '✊', promptSuggestion: 'Leadership, resilience, social justice, and community service' },
  { month: 7, day: 28, name: "World Nature Conservation Day", category: 'awareness', emoji: '🌿', promptSuggestion: 'Nature preservation, wildlife protection, and green living' },
  { month: 7, day: 30, name: "International Day of Friendship", category: 'international', emoji: '🤝', promptSuggestion: 'Friendship, bonding, community, and togetherness' },

  // August
  { month: 8, day: 1, name: "World Wide Web Day", category: 'tech', emoji: '🌐', promptSuggestion: 'Internet, digital innovation, web technology, and connectivity' },
  { month: 8, day: 4, name: "International Beer Day", category: 'fun', emoji: '🍺', promptSuggestion: 'Cheers, beverages, social gatherings, and celebration' },
  { month: 8, day: 8, name: "International Cat Day", category: 'fun', emoji: '🐱', promptSuggestion: 'Cute cats, pet love, feline friends, and adorable content' },
  { month: 8, day: 10, name: "World Lion Day", category: 'awareness', emoji: '🦁', promptSuggestion: 'Wildlife conservation, lion protection, and majestic themes' },
  { month: 8, day: 12, name: "International Youth Day", category: 'international', emoji: '🌟', promptSuggestion: 'Youth empowerment, young leaders, and future generation' },
  { month: 8, day: 15, name: "Independence Day (India)", category: 'indian', emoji: '🇮🇳', promptSuggestion: 'Indian independence, tricolor theme, patriotism, and freedom' },
  { month: 8, day: 19, name: "World Humanitarian Day", category: 'awareness', emoji: '🤲', promptSuggestion: 'Humanitarian aid, helping others, and global solidarity' },
  { month: 8, day: 25, name: "World Dog Day", category: 'fun', emoji: '🐕', promptSuggestion: 'Dogs, pet love, furry friends, and adorable dog content' },

  // September
  { month: 9, day: 1, name: "Worldinema Day", category: 'awareness', emoji: '🎬', promptSuggestion: 'Cinema, filmmaking, storytelling, and creative arts' },
  { month: 9, day: 5, name: "Teachers' Day (India)", category: 'indian', emoji: '👨‍🏫', promptSuggestion: 'Teacher appreciation, education, knowledge, and mentorship' },
  { month: 9, day: 8, name: "International Literacy Day", category: 'awareness', emoji: '📚', promptSuggestion: 'Literacy, education, reading, and knowledge empowerment' },
  { month: 9, day: 10, name: "World Suicide Prevention Day", category: 'awareness', emoji: '💚', promptSuggestion: 'Mental health awareness, support, hope, and wellness' },
  { month: 9, day: 16, name: "World Ozone Day", category: 'awareness', emoji: '🛰️', promptSuggestion: 'Ozone layer protection, environmental awareness, and climate action' },
  { month: 9, day: 21, name: "World Peace Day", category: 'international', emoji: '☮️', promptSuggestion: 'World peace, harmony, non-violence, and global unity' },
  { month: 9, day: 22, name: "World Car Free Day", category: 'awareness', emoji: '🚗', promptSuggestion: 'Sustainable transport, cycling, walking, and clean air' },
  { month: 9, day: 27, name: "World Tourism Day", category: 'international', emoji: '✈️', promptSuggestion: 'Travel, tourism, exploration, adventure, and destinations' },
  { month: 9, day: 28, name: "World Rivers Day", category: 'awareness', emoji: '🏞️', promptSuggestion: 'River conservation, water bodies, and environmental protection' },

  // October
  { month: 10, day: 1, name: "International Day of Older Persons", category: 'awareness', emoji: '👴', promptSuggestion: 'Senior citizens, wisdom, experience, and elderly care' },
  { month: 10, day: 2, name: "Gandhi Jayanti (India)", category: 'indian', emoji: '🕊️', promptSuggestion: 'Mahatma Gandhi, non-violence, truth, and peace' },
  { month: 10, day: 4, name: "World Animal Day", category: 'awareness', emoji: '🐾', promptSuggestion: 'Animal welfare, pet adoption, wildlife protection' },
  { month: 10, day: 5, name: "World Teachers' Day", category: 'international', emoji: '🍎', promptSuggestion: 'Teacher appreciation, education, and mentorship' },
  { month: 10, day: 10, name: "World Mental Health Day", category: 'awareness', emoji: '🧠', promptSuggestion: 'Mental health awareness, self-care, therapy, and wellness' },
  { month: 10, day: 11, name: "World Obesity Day", category: 'awareness', emoji: '⚖️', promptSuggestion: 'Healthy weight, nutrition, fitness, and lifestyle' },
  { month: 10, day: 13, name: "World Sight Day", category: 'awareness', emoji: '👁️', promptSuggestion: 'Eye health, vision care, and blindness prevention' },
  { month: 10, day: 15, name: "Global Handwashing Day", category: 'awareness', emoji: '🧼', promptSuggestion: 'Hygiene, handwashing, health, and cleanliness' },
  { month: 10, day: 16, name: "World Food Day", category: 'international', emoji: '🍎', promptSuggestion: 'Food security, nutrition, hunger awareness, and agriculture' },
  { month: 10, day: 17, name: "International Day for Eradication of Poverty", category: 'awareness', emoji: '🤲', promptSuggestion: 'Poverty awareness, social justice, and community support' },
  { month: 10, day: 24, name: "United Nations Day", category: 'international', emoji: '🇺🇳', promptSuggestion: 'Global cooperation, peace, diplomacy, and unity' },
  { month: 10, day: 29, name: "World Stroke Day", category: 'awareness', emoji: '🏥', promptSuggestion: 'Stroke prevention, health awareness, and quick response' },
  { month: 10, day: 31, name: "Halloween", category: 'international', emoji: '🎃', promptSuggestion: 'Spooky themes, costumes, pumpkins, horror, and fun' },

  // November
  { month: 11, day: 1, name: "World Vegan Day", category: 'international', emoji: '🌱', promptSuggestion: 'Vegan lifestyle, plant-based food, cruelty-free, and sustainability' },
  { month: 11, day: 5, name: "World Tsunami Awareness Day", category: 'awareness', emoji: '🌊', promptSuggestion: 'Disaster preparedness, early warning, and community safety' },
  { month: 11, day: 11, name: "Singles' Day (11.11)", category: 'fun', emoji: '1️⃣', promptSuggestion: 'Shopping festival, self-love, deals, and single life celebration' },
  { month: 11, day: 13, name: "World Kindness Day", category: 'international', emoji: '💝', promptSuggestion: 'Acts of kindness, generosity, compassion, and goodwill' },
  { month: 11, day: 14, name: "World Diabetes Day", category: 'awareness', emoji: '🩺', promptSuggestion: 'Diabetes awareness, healthy eating, blood sugar management' },
  { month: 11, day: 16, name: "International Day for Tolerance", category: 'awareness', emoji: '🤝', promptSuggestion: 'Tolerance, understanding, diversity, and acceptance' },
  { month: 11, day: 17, name: "International Students' Day", category: 'international', emoji: '🎓', promptSuggestion: 'Student life, education, campus culture, and learning' },
  { month: 11, day: 19, name: "World Toilet Day", category: 'awareness', emoji: '🚽', promptSuggestion: 'Sanitation awareness, hygiene, and clean water access' },
  { month: 11, day: 21, name: "World Television Day", category: 'international', emoji: '📺', promptSuggestion: 'Media, entertainment, storytelling, and visual communication' },
  { month: 11, day: 25, name: "International Day for Elimination of Violence Against Women", category: 'awareness', emoji: '🛑', promptSuggestion: 'Women safety, gender-based violence awareness, and support' },
  { month: 11, day: 26, name: "Constitution Day (India)", category: 'indian', emoji: '🇮🇳', promptSuggestion: 'Indian Constitution, Dr. B.R. Ambedkar, democratic values, and rights' },
  { month: 11, day: 29, name: "International Day of Solidarity with Palestine", category: 'awareness', emoji: '🕊️', promptSuggestion: 'Solidarity, human rights, and global awareness' },

  // December
  { month: 12, day: 1, name: "World AIDS Day", category: 'awareness', emoji: '🎗️', promptSuggestion: 'AIDS awareness, HIV prevention, support for affected communities' },
  { month: 12, day: 2, name: "International Day for Abolition of Slavery", category: 'awareness', emoji: '⛓️', promptSuggestion: 'Human rights, freedom, and anti-trafficking awareness' },
  { month: 12, day: 3, name: "International Day of Persons with Disabilities", category: 'awareness', emoji: '♿', promptSuggestion: 'Disability inclusion, accessibility, and empowerment' },
  { month: 12, day: 5, name: "International Volunteer Day", category: 'international', emoji: '🤲', promptSuggestion: 'Volunteering, community service, giving back, and social impact' },
  { month: 12, day: 7, name: "International Civil Aviation Day", category: 'international', emoji: '✈️', promptSuggestion: 'Aviation, travel, connectivity, and global transportation' },
  { month: 12, day: 10, name: "Human Rights Day", category: 'international', emoji: '⚖️', promptSuggestion: 'Human rights, dignity, freedom, and equality for all' },
  { month: 12, day: 14, name: "World Monkey Day", category: 'fun', emoji: '🐒', promptSuggestion: 'Fun monkey content, wildlife, and playful themes' },
  { month: 12, day: 18, name: "International Migrants Day", category: 'awareness', emoji: '🌍', promptSuggestion: 'Migration, diversity, cultural exchange, and inclusion' },
  { month: 12, day: 20, name: "International Human Solidarity Day", category: 'awareness', emoji: '🤝', promptSuggestion: 'Global solidarity, unity, and collective action' },
  { month: 12, day: 22, name: "National Mathematics Day (India)", category: 'indian', emoji: '🔢', promptSuggestion: 'Mathematics, Srinivasa Ramanujan legacy, and STEM education' },
  { month: 12, day: 25, name: "Christmas", category: 'international', emoji: '🎄', promptSuggestion: 'Christmas celebration, gifts, holiday season, Santa, and joy' },
  { month: 12, day: 31, name: "New Year's Eve", category: 'international', emoji: '🎆', promptSuggestion: 'Year-end celebration, countdown, fireworks, and new beginnings' },
];

export function getFestivalsForDate(month: number, day: number): Festival[] {
  return festivals.filter(f => f.month === month && f.day === day);
}

export function getFestivalsForMonth(month: number): Festival[] {
  return festivals.filter(f => f.month === month);
}

export function getTodayFestival(): Festival | null {
  const now = new Date();
  const today = getFestivalsForDate(now.getMonth() + 1, now.getDate());
  return today.length > 0 ? today[0] : null;
}

export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const categoryColors: Record<string, string> = {
  international: 'bg-blue-500/20 text-blue-400',
  indian: 'bg-orange-500/20 text-orange-400',
  tech: 'bg-purple-500/20 text-purple-400',
  awareness: 'bg-green-500/20 text-green-400',
  fun: 'bg-pink-500/20 text-pink-400',
};
