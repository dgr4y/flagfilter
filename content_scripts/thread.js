/* Disable errors for functions included from other files via manifest.json. */
/* eslint-disable no-undef */

/** Hides meme posts and replies to meme posts. */
const hideMemePosts = () => {
  Promise.all([getThread(), createFilter()]).then(([thread, filter]) => {
    const removeOp = posts => posts.slice(1, posts.length);
    const replies = removeOp(thread.posts);
    const memeReplies = getMemePosts(replies, filter);
    memeReplies.forEach(hidePost);
  });
};

const observer = new MutationObserver(() => {
  hideMemePosts();
});
observer.observe(document.querySelector('.thread'), { childList: true });

chrome.runtime.onMessage.addListener(({ cmd }) => {
  if (cmd === 'reapplyFilters') {
    const hiddenPosts = Array.from(document.querySelectorAll('.post-hidden'));
    const hiddenPostNos = hiddenPosts.map(post => post.id.match(/\d+/)[0]);
    hiddenPostNos.forEach(showPost);
    hideMemePosts();
  }
});

hideMemePosts();
