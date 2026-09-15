import { describe, expect, it } from 'vitest';
import { joinBase, joinPage } from './joinBase';

describe('joinBase', () => {
  it('leaves root-relative paths alone when base is empty', () => {
    expect(joinBase('', '/photos/a.jpg')).toBe('/photos/a.jpg');
  });

  it('prefixes a GitHub Pages project base', () => {
    expect(joinBase('/spacehey-personal', '/photos/a.jpg')).toBe(
      '/spacehey-personal/photos/a.jpg',
    );
  });
});

describe('joinPage', () => {
  it('uses trailing slashes for nested routes', () => {
    expect(joinPage('', '/')).toBe('/');
    expect(joinPage('', '/blog')).toBe('/blog/');
    expect(joinPage('/spacehey-personal', '/')).toBe('/spacehey-personal/');
    expect(joinPage('/spacehey-personal', '/friends')).toBe(
      '/spacehey-personal/friends/',
    );
  });
});
