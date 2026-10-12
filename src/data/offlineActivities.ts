import type { Quest, PlannerFormData } from '../types';

export const OFFLINE_ACTIVITIES_FRONTEND: Quest[] = [
  {
    id: 'offline-lib-sniffari',
    title: 'The Great Sniffari & Decompression Trail',
    subtitle: 'Canine-Led Sensory Exploration',
    tagline: 'Offline Safe Activity: A gentle stroll where your pup chooses every turn and scent stop.',
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
    metadata: {
      source: 'offline_library',
      isAIGenerated: false,
      label: 'Offline Safe Activity Library',
      description: 'Selected from the built-in library of safe, vet-approved sensory activities (Zero cloud data sent).',
    },
  },
  {
    id: 'offline-lib-detective',
    title: 'The Acorn & Twig Detective Hunt',
    subtitle: 'Critter Marking & Tree Trunk Investigation',
    tagline: 'Offline Safe Activity: Track low-lying critter highways and hidden seed stashes.',
    theme: 'detective',
    difficulty: 'Medium',
    durationMinutes: 30,
    distanceKm: 1.8,
    storyNarrative:
      'Sharpen your pup’s natural tracking instincts! Today’s mission involves inspecting shaded garden borders and the bases of mature trees where squirrels stash their treasures.',
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
    metadata: {
      source: 'offline_library',
      isAIGenerated: false,
      label: 'Offline Safe Activity Library',
      description: 'Selected from the built-in library of safe, vet-approved sensory activities (Zero cloud data sent).',
    },
  },
];

export function getClientOfflineActivity(criteria: PlannerFormData): Quest {
  const match =
    OFFLINE_ACTIVITIES_FRONTEND.find((a) => a.theme === criteria.adventureTheme) ||
    OFFLINE_ACTIVITIES_FRONTEND[0];
  const copy: Quest = JSON.parse(JSON.stringify(match));
  const validName = criteria.dogName?.trim() || 'Pup';

  copy.id = `offline-client-${Date.now()}`;
  copy.title = `${validName}'s ${copy.title}`;
  copy.durationMinutes = criteria.durationMinutes;
  copy.distanceKm = Number(((criteria.durationMinutes / 15) * 0.9).toFixed(1));
  copy.metadata = {
    source: 'offline_library',
    isAIGenerated: false,
    label: 'Offline Safe Activity Library',
    description: 'Selected from the built-in library of safe, vet-approved sensory activities (Zero cloud data sent).',
  };
  return copy;
}
