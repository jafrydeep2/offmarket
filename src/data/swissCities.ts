// Swiss cities database for property search
export const swissCities = [
  'Zürich',
  'Geneva', 
  'Bern',
  'Lausanne',
  'Basel',
  'Winterthur',
  'Lucerne',
  'St. Gallen',
  'Lugano',
  'Biel/Bienne',
  'Thun',
  'Köniz',
  'La Chaux-de-Fonds',
  'Schaffhausen',
  'Fribourg'
];

// Function to filter cities based on input
export const filterCities = (input: string): string[] => {
  if (!input || input.length < 2) return swissCities;
  
  const searchTerm = input.toLowerCase();
  return swissCities
    .filter(city => city.toLowerCase().includes(searchTerm))
    .slice(0, 10); // Limit to 10 suggestions
};
