/* Disable eslint errors for functions used in other files. */
/* eslint-disable no-unused-vars */

/* Disable errors for functions included from other files via manifest.json. */
/* eslint-disable no-undef */

/**
 * Determines for a post if the author has a meme flag.
 * @param {Post} post Some post.
 * @returns Whether the author is posting under a meme flag.
 */
const memeFlag = post => !!post.troll_country;

/**
 * Creates a filter for posts from the given countries.
 * @param {[CountryCode]} countries Some country codes.
 * @returns {PostFilter} A filter for posts from the given countries.
 */
const countryFilter = countries => post => countries.includes(post.country);

/**
 * Combines multiple filters.
 * @param {Filter} filters Some filters.
 * @returns {Filter} A filter discarding only items filtered out by every given filter.
 */
const either = (...filters) => item => filters.some(filter => filter(item));

/**
 * Creates a filter based on the user settings.
 * @returns {Promise<Filter>} The filter, given that the setting could be read.
 */
const createFilter = () => Promise.all([
  settings.getProperty('enabled'),
  settings.getProperty('memeflags'),
  settings.getProperty('flags'),
]).then(([enabled, memeflags, flags]) => {
  const nothing = a => false;
  if (enabled) {
    return either(
      memeflags ? memeFlag : nothing,
      flags ? countryFilter(flags) : nothing,
    );
  }
  return nothing;
});

/**
 * @typedef {function(Object): boolean} Filter Filter function.
 */

/**
 * @typedef {function(Post): boolean} PostFilter Filter function for posts.
 */
