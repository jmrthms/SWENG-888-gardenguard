import { describe, it, expect } from '@jest/globals';
import { PESTS, pestLabel, getPest, pestIcon } from '../pests';
import { DATASET_PESTS } from '../regionalCatalog.generated';

describe('pests', () => {
  it('derives one entry per dataset pest', () => {
    expect(PESTS).toHaveLength(DATASET_PESTS.length);
    expect(PESTS).toHaveLength(35);
  });

  it('classifies diseases and critters via the override table', () => {
    expect(getPest('early-blight')?.type).toBe('disease');
    expect(getPest('late-blight')?.type).toBe('disease');
    expect(getPest('powdery-mildew')?.type).toBe('disease');
    expect(getPest('slugs')?.type).toBe('critter');
    expect(getPest('aphids')?.type).toBe('insect');
  });

  it('labels known pests and falls back to the id for unknown ones', () => {
    expect(pestLabel('aphids')).toBe('Aphids');
    expect(pestLabel('powdery-mildew')).toBe('Powdery Mildew');
    expect(pestLabel('mystery-bug')).toBe('mystery-bug');
    expect(getPest('mystery-bug')).toBeUndefined();
  });

  it('maps pest types to distinct icons', () => {
    expect(pestIcon('insect')).toBe('bug');
    expect(pestIcon('critter')).toBe('rabbit');
    expect(pestIcon('disease')).toBe('mushroom');
  });

  it('is sorted alphabetically by label', () => {
    const labels = PESTS.map((p) => p.label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
  });
});
