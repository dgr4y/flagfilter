/* Disable eslint errors for functions used in other files. */
/* eslint-disable no-unused-vars */

/**
 * Retrieves all posts that are quoted (replied to) by the given post.
 * @param {Post} post A post from the 4chan API.
 * @returns {number[]} Some post numbers.
 */
const getQuotedPostNos = (post) => {
  if (post.com) {
    const references = post.com.match(/href="#p\d+"/g) || [];
    return references.map(reference => parseInt(reference.match(/\d+/)[0], 10));
  }
  return [];
};

/**
 * Determines if a post is a reply to only meme posts.
 * @param {Post} post Post from the 4chan API.
 * @param {Array} memePosts A list of meme post objects from the 4chan API.
 * @returns {boolean} True, if the given post is a reply to any of the
 *                    meme posts or their replies.
 */
const isMemeReply = (post, memePosts) => {
  const postNos = getQuotedPostNos(post);
  if (postNos.length > 0) {
    return postNos.every(postNo => memePosts.some(memePost => memePost.no === postNo));
  }
  return false;
};

/**
 * Filters meme posts and replies to meme posts out of a list of posts.
 * @param {Post[]} posts Posts from the 4chan API.
 * @param {PostFilter} memeFilter A function determining which post is a meme post.
 */
const getMemePosts = (posts, memeFilter) => {
  const memePosts = posts.filter(memeFilter);
  if (memePosts.length === 0) {
    return [];
  }
  return memePosts.concat(getMemePosts(posts, post => isMemeReply(post, memePosts)));
};

/**
* Disables a link in the document.
* @param {HTMLElement} link A link to some post.
*/
const disable = (link) => {
  const deadLink = document.createElement('span');
  deadLink.classList.add('deadlink');
  deadLink.appendChild(document.createTextNode(link.textContent));
  link.replaceWith(deadLink);
};

/**
* Disables all links to a post in the document.
* @param {Post} post Post from the 4chan API.
*/
const disableQuoteLinks = (post) => {
  const linkSelector = `a[href="#p${post.no}"]`;
  document.querySelectorAll(`.postMessage ${linkSelector}`).forEach(disable);
  document.querySelectorAll(`.backlink ${linkSelector}`).forEach(disable);
};

/**
 * Hides a post in the document.
 * @param {Post} post Post from the 4chan API.
 */
const hidePost = (post) => {
  const postFragment = document.querySelector(`#pc${post.no}`);
  if (postFragment) {
    const arrows = postFragment.querySelector(`#sa${post.no}`);
    postFragment.classList.add('post-hidden');
    arrows.dataset.hidden = post.no;
    disableQuoteLinks(post);
  }
};

/**
 * Enables a previously disabled link in the document.
 * @param {HTMLElement} deadLink Disabled link.
 */
const enable = (deadLink) => {
  const link = document.createElement('a');
  const postNo = deadLink.textContent.match(/\d+/)[0];
  link.href = `#p${postNo}`;
  link.classList.add('quotelink');
  link.appendChild(document.createTextNode(`>>${postNo}`));
  deadLink.replaceWith(link);
};

/**
 * Enables previously disabled links in the document.
 * @param {number} postNo Number of a post.
 */
const enableDeadLinks = (postNo) => {
  const deadLinks = Array.from(document.querySelectorAll('.deadlink'));
  deadLinks.filter(link => link.textContent.includes(postNo)).forEach(enable);
};

/**
 * Shows a previously hidden post.
 * @param {number} postNo Number of a hidden post.
 */
const showPost = (postNo) => {
  const postFragment = document.querySelector(`#pc${postNo}`);
  if (postFragment) {
    postFragment.classList.remove('post-hidden');
    const arrows = postFragment.querySelector(`#sa${postNo}`);
    delete arrows.dataset.hidden;
    enableDeadLinks(postNo);
  }
};

/**
 * Hides a thread in the document.
 * @param {Thread} thread A thread pulled from the 4chan API.
 */
const hideThread = (thread) => {
  const dom = document.querySelector(`#t${thread.no}`);
  const threadVisible = !!dom;
  if (threadVisible) {
    dom.classList.add('post-hidden');
    const sa = dom.querySelector(`#sa${thread.no}`);
    sa.dataset.hidden = thread.no;
    const hideButton = sa.querySelector('img.threadHideButton');
    hideButton.src = hideButton.src.replace('minus', 'plus');
  }
};

/**
 * Shows a previously hidden thread.
 * @param {number} threadNo Number of a thread.
 */
const showThread = (threadNo) => {
  const threadFragment = document.querySelector(`#t${threadNo}`);
  if (threadFragment) {
    threadFragment.classList.remove('post-hidden');
    const sa = threadFragment.querySelector(`#sa${threadNo}`);
    delete sa.dataset.hidden;
    const hideButton = sa.querySelector('img.threadHideButton');
    hideButton.src = hideButton.src.replace('plus', 'minus');
  }
};

/**
 * Fetches the JSON representation of a thread from the 4chan API.
 * @param {string} pathname Path to a thread in this form:
 *                          /<board>/thread/<123456789>/<topic>.
 * @return {Promise<Thread>} JSON representation of the given thread.
 */
const getThread = (pathname = document.location.pathname) => {
  const matches = pathname.match(/(\w+)\/thread\/(\d+)/);
  const board = matches[1];
  const threadNo = matches[2];
  const url = `/${board}/thread/${threadNo}.json`;
  return fetch(url).then(response => response.json());
};

/**
 * @typedef {Object} Thread JSON representation of a 4chan thread from the API.
 * @property {number} no Unique thread number.
 * @property {Post[]} posts All posts in the thread, OP being the first one.
 */

/** @typedef {string} CountryCode ISO ALPHA-2 country code. */

/**
 * @typedef {Object} Post JSON representation of a 4chan post from the API.
 * @property {number} no Unique post number.
 * @property {CountryCode} country Country code.
 * @property {string} troll_country Troll country code.
 */
