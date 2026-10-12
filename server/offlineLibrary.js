/**
 * Built-in Library of Safe Offline Dog-Walking Activities.
 * These are curated, veterinary-friendly sensory enrichment activities
 * used when cloud AI (Gemini) and local AI (Ollama) are unavailable,
 * or when the user explicitly requests full offline mode.
 * 
 * NOTE: As per project guidelines, activities from this library are
 * CLEARLY LABELED as "Offline Safe Activity Library", NOT AI-generated.
 */

export const OFFLINE_ACTIVITIES = [
  {
    id: 'offline-sniffari-explore',
    title: 'The Great Sniffari & Decompression Trail',
    subtitle: 'Canine-Led Sensory Exploration',
    tagline: 'A gentle, stress-free walk where your pup chooses every turn and scent stop.',
    theme: 'nature',
    difficulty: 'Easy',
    durationMinutes: 20,
    distanceKm: 1.0,
    storyNarrative:
      'Allow your dog to lead the adventure! In this decompression walk, leash pressure remains soft while your pup decodes ground-level scent signatures left along lawn edges, damp soil, and fallen leaves.',
    scentTags: ['Damp Soil', 'Fallen Leaves', 'Lawn Edge Moisture', 'Canine Footprints'],
    badgeReward: {
      title: 'Master Sniffari Explorer',
      description: 'Completed a slow-paced sensory decompression walk with zero leash tension!',
      iconEmoji: '🌿',
    },
    checkpoints: [
      {
        id: 'cp-sniff-1',
        stepNumber: 1,
        title: 'The Decompression Verge',
        description: 'Give 3 full minutes of uninterrupted sniffing on the widest grass patch.',
        scentPrompt: 'Look for morning dew or shaded lawn boundaries where scents pool.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 3,
      },
      {
        id: 'cp-sniff-2',
        stepNumber: 2,
        title: 'Tree Base Exploration',
        description: 'Allow deliberate investigation of a sturdy roadside or park tree.',
        scentPrompt: 'Inspect bark crevices and root nooks for local bird and critter trails.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 3,
      },
      {
        id: 'cp-sniff-3',
        stepNumber: 3,
        title: 'The Breeze Catcher Point',
        description: 'Pause at an open corner where cross-breezes deliver airborne aromas.',
        scentPrompt: 'Let your dog lift their nose into the breeze to sample distant scents.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 4,
      },
    ],
  },
  {
    id: 'offline-detective-acorn',
    title: 'The Acorn & Twig Detective Hunt',
    subtitle: 'Critter Marking & Tree Trunk Investigation',
    tagline: 'Track low-lying critter highways and hidden seed stashes in your local park.',
    theme: 'detective',
    difficulty: 'Medium',
    durationMinutes: 30,
    distanceKm: 1.8,
    storyNarrative:
      'Sharpen your pup’s natural tracking instincts! Today’s mission involves inspecting shaded garden borders and the bases of mature trees where squirrels and chipmunks stash their treasures.',
    scentTags: ['Fresh Oak Bark', 'Dry Twigs', 'Acorn Cache', 'Earth & Lichen'],
    badgeReward: {
      title: 'Forest Detective Hound',
      description: 'Successfully investigated three natural critter hotspots like a true canine sleuth!',
      iconEmoji: '🕵️‍♂️',
    },
    checkpoints: [
      {
        id: 'cp-det-1',
        stepNumber: 1,
        title: 'The Old Oak Outpost',
        description: 'Inspect the thick roots where small paws scramble up and down.',
        scentPrompt: 'Let your hound search for nutty residue and freshly disturbed dirt.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 3,
      },
      {
        id: 'cp-det-2',
        stepNumber: 2,
        title: 'The Log & Rock Border',
        description: 'Follow the natural border separating lawn from woodland brush.',
        scentPrompt: 'Catalog the earthy fungi and damp stone aromas along the verge.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 4,
      },
      {
        id: 'cp-det-3',
        stepNumber: 3,
        title: 'The Bench Perimeter',
        description: 'A popular human and squirrel resting spot packed with scent layers.',
        scentPrompt: 'Check the shaded legs and perimeter grass for lingering trail notes.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 4,
      },
    ],
  },
  {
    id: 'offline-urban-landmarks',
    title: 'The Urban Gazette & Landmark Tour',
    subtitle: 'Street Corner Chronicles & Safe Olfactory Landmarks',
    tagline: 'Decode the neighborhood daily newspaper written on fire hydrants and lampposts.',
    theme: 'urban',
    difficulty: 'Medium',
    durationMinutes: 25,
    distanceKm: 1.5,
    storyNarrative:
      'Every city block is a library of olfactory messages! This activity guides your companion safely across sidewalk corners to read who walked by, what bakery treats are baking, and which landmarks are buzzing.',
    scentTags: ['Vintage Cast Iron', 'Bakery Aromas', 'Sidewalk Brick', 'Garden Trellis'],
    badgeReward: {
      title: 'City Street Ambassador',
      description: 'Logged all neighborhood landmark stops while maintaining polite sidewalk manners!',
      iconEmoji: '🏙️',
    },
    checkpoints: [
      {
        id: 'cp-urb-1',
        stepNumber: 1,
        title: 'The Neighborhood Corner Post',
        description: 'The premier message board for every dog on the morning loop.',
        scentPrompt: 'Allow gentle sniffing of the post base to catch up on local canine news.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 4,
      },
      {
        id: 'cp-urb-2',
        stepNumber: 2,
        title: 'The Warm Bakery / Cafe Breeze',
        description: 'Catch the delicious waft of toasted flour and warm ovens.',
        scentPrompt: 'Observe your dog savoring the sweet and savory kitchen aromas in the air.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 3,
      },
      {
        id: 'cp-urb-3',
        stepNumber: 3,
        title: 'The Community Flower Box',
        description: 'Finish with a blast of floral, soil, and pollinator aromas.',
        scentPrompt: 'Sniff the moist soil and herb foliage at the curb planter.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 5,
      },
    ],
  },
  {
    id: 'offline-creek-pebble',
    title: 'The Whispering Creek & River Stone Trek',
    subtitle: 'Cool Currents & Aquatic Flora Aromas',
    tagline: 'Follow bubbling stream pathways to discover damp stone and fresh mint smells.',
    theme: 'creek_trail',
    difficulty: 'Adventurous',
    durationMinutes: 35,
    distanceKm: 2.2,
    storyNarrative:
      'Flowing water carries an orchestra of scents from upstream! Explore shaded streamside pathways where cool mist and water-carved pebbles deliver an immersive sensory experience.',
    scentTags: ['River Pebble', 'Wild Water Mint', 'Cedar Needle', 'Stream Foam'],
    badgeReward: {
      title: 'Brookside Navigator',
      description: 'Surveyed the aquatic trail and tracked cool water scents like a champion otter-hound!',
      iconEmoji: '🌊',
    },
    checkpoints: [
      {
        id: 'cp-crk-1',
        stepNumber: 1,
        title: 'The Shaded Cedar Approach',
        description: 'Dense canopy providing rich cedar and evergreen needle fragrance.',
        scentPrompt: 'Sniff the carpet of needles where coolness is preserved.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 3,
      },
      {
        id: 'cp-crk-2',
        stepNumber: 2,
        title: 'The Pebble Bank Overlook',
        description: 'Safe vantage near flowing water to test the aquatic breezes.',
        scentPrompt: 'Deep sniffs of moisture, mossy river rocks, and running water.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 4,
      },
      {
        id: 'cp-crk-3',
        stepNumber: 3,
        title: 'The Wild Mint Clearing',
        description: 'Fragrant herb patches thriving in the damp waterside soil.',
        scentPrompt: 'Reward your dog for identifying sweet herbal scents in the grass.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 4,
      },
    ],
  },
  {
    id: 'offline-wildflower-meadow',
    title: 'The Sunlit Clover & Wildflower Odyssey',
    subtitle: 'Open Meadow Breeze & Pollinator Paths',
    tagline: 'Wander open sunny grass fields full of sweet clover, dandelion, and fluttering winds.',
    theme: 'meadow',
    difficulty: 'Easy',
    durationMinutes: 25,
    distanceKm: 1.4,
    storyNarrative:
      'Open fields allow scents to travel horizontally across vast grasslands. This activity exercises your dog’s long-distance air scenting as they navigate clover patches and sun-warmed earth.',
    scentTags: ['Sweet White Clover', 'Sunlit Grass', 'Dandelion Roots', 'Bumblebee Wind'],
    badgeReward: {
      title: 'Meadow Wanderer',
      description: 'Explored open grasslands and mapped floral breezes with effortless joy!',
      iconEmoji: '🌼',
    },
    checkpoints: [
      {
        id: 'cp-mdw-1',
        stepNumber: 1,
        title: 'The Clover Carpet Entry',
        description: 'Dense white and red clover providing sweet, nectar-rich aromas.',
        scentPrompt: 'Allow slow grazing sniffs low in the thick grass blades.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 3,
      },
      {
        id: 'cp-mdw-2',
        stepNumber: 2,
        title: 'The Sun-Warmed Soil Patch',
        description: 'A pocket of dark earth heated by morning sunlight.',
        scentPrompt: 'Inspect the warm soil where roots and dormant seeds breathe.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 3,
      },
      {
        id: 'cp-mdw-3',
        stepNumber: 3,
        title: 'The Crest of the Meadow',
        description: 'The highest elevation point with 360-degree scent currents.',
        scentPrompt: 'Let your companion take celebratory deep inhalations on the ridge.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: 4,
      },
    ],
  },
];

/**
 * Select and personalize an activity from the offline library.
 * Modifies dog name and duration according to user preference,
 * while maintaining the explicit "offline_library" metadata.
 */
export function getOfflineActivity({ dogName, theme, durationMinutes, energyLevel: _energyLevel }) {
  // Find match by theme, or default to first
  let match = OFFLINE_ACTIVITIES.find((a) => a.theme === theme);
  if (!match) {
    match = OFFLINE_ACTIVITIES[0];
  }

  // Clone so original remains unchanged
  const personalized = JSON.parse(JSON.stringify(match));
  const validName = dogName && dogName.trim() ? dogName.trim() : 'Pup';

  personalized.id = `offline-lib-${Date.now()}`;
  personalized.title = `${validName}'s ${personalized.title}`;
  personalized.durationMinutes = durationMinutes || personalized.durationMinutes;
  personalized.distanceKm = Number(((personalized.durationMinutes / 15) * 0.9).toFixed(1));
  personalized.tagline = `Offline Safe Activity: ${personalized.tagline}`;
  personalized.storyNarrative = `Designed for ${validName}: ${personalized.storyNarrative}`;
  personalized.badgeReward.title = `${validName} the ${personalized.badgeReward.title}`;

  return {
    quest: personalized,
    metadata: {
      source: 'offline_library',
      isAIGenerated: false,
      label: 'Offline Safe Activity Library',
      description:
        'Selected from the built-in library of safe, vet-approved sensory activities (Zero cloud data sent).',
    },
  };
}
