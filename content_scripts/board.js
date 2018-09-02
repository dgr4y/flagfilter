/* Disable errors for functions included from other files via manifest.json. */
/* eslint-disable no-undef */

/** Hides meme posts and replies to meme posts. */
const hideMemePosts = (threadFragment) => {
  const threadNo = threadFragment.id.match(/t(\d+)/)[1];
  const board = document.location.pathname.match(/\/(\w+)\/.*/)[1];
  const path = `${board}/thread/${threadNo}/`;
  Promise.all([getThread(path), createFilter()]).then(([thread, filter]) => {
    const op = thread.posts[0];
    if ([op].filter(filter).length > 0) {
      hideThread(op);
    } else {
      const memeReplies = getMemePosts(thread.posts, filter);
      memeReplies.forEach(hidePost);
    }
  });
};

const observer = new MutationObserver((records) => {
  records.forEach((record) => {
    const threadFilter = node => node.classList.contains('thread');
    const threads = Array.from(record.addedNodes).filter(threadFilter);
    threads.forEach(hideMemePosts);
  });
});
observer.observe(document.querySelector('.board'), { childList: true });

chrome.runtime.onMessage.addListener(({ cmd }) => {
  if (cmd === 'reapplyFilters') {
    const hiddenPosts = Array.from(document.querySelectorAll('.post-hidden'));
    const hiddenPostNos = hiddenPosts.map(post => post.id.match(/\d+/)[0]);
    hiddenPostNos.forEach(showPost);
    hiddenPostNos.forEach(showThread);
    document.querySelectorAll('.thread').forEach(hideMemePosts);
  }
});

document.querySelectorAll('.thread').forEach(hideMemePosts);
