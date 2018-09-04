/* Disable errors for functions included from other files via manifest.json. */
/* eslint-disable no-undef */

/** Shows hidden posts that are not filtered anymore. */
const showNormalPosts = (thread) => {
  createFilter().then((filter) => {
    let hiddenPosts = Array.from(document.querySelectorAll('.post-hidden'));
    const hiddenPostNos = hiddenPosts.map(post => post.id.match(/\d+/)[0]);
    hiddenPosts = thread.posts.filter(p => hiddenPostNos.includes(`${p.no}`));
    const hiddenMemePosts = getMemePosts(hiddenPosts, filter);
    const normalPosts = hiddenPosts.filter(
      post => !hiddenMemePosts.some(memePost => memePost.no === post.no),
    );
    normalPosts.forEach(post => showPost(post.no));
  });
};

/** Hides meme posts and replies to meme posts. */
const hideMemePosts = (thread) => {
  createFilter().then((filter) => {
    const removeOp = posts => posts.slice(1, posts.length);
    const replies = removeOp(thread.posts);
    const memeReplies = getMemePosts(replies, filter);
    memeReplies.forEach(hidePost);
  });
};

const observer = new MutationObserver(() => {
  fetchThread().then((thread) => {
    saveThread(thread);
    hideMemePosts(thread);
  });
});
observer.observe(document.querySelector('.thread'), { childList: true });

chrome.runtime.onMessage.addListener(({ cmd }) => {
  if (cmd === 'reapplyFilters') {
    const threadNo = document.location.pathname.match(/\/thread\/(\d+)/)[1];
    const thread = loadThread(threadNo);
    showNormalPosts(thread);
    hideMemePosts(thread);
  }
});

fetchThread().then((thread) => {
  saveThread(thread);
  hideMemePosts(thread);
});
